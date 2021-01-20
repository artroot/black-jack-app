import console from './logger';

import { Dealer } from "./entities/dealer";

import { Player } from "./entities/player";

import { Seat, DealerSeat, SeatStates } from "./entities/seat";

import { ShufflingMachine } from "./shufflingMachine";

import { Token, TokenValue } from "./entities/token";

import { Card } from "./entities/card";

export enum Actions {
    waitingPlayers,
    betting,
    deal,
    play,
    dealersPlay
}

enum PlayerActions {
    offer = 'offer',
    bet = 'bet',
    hit = 'hit',
    stand = 'stand'
}

interface ShufflingMachineOD {
    shoe: number;
    played: number;
}

interface DealerOD {
    hand: Array<Card>;
    total: number;
    state: SeatStates;
}

interface PlayerOD {
    id: number;
    name: string;
    deposit: number;
    hand: Array<Card>
    total: number;
}

interface SeatOD {
    id: number;
    player: PlayerOD | null;
    bet: Array<Token>;
    deposit: Array<Token>;
    state: SeatStates;
}


export interface BroadcastData {
    shufflingMachine: ShufflingMachineOD;
    dealer: DealerOD;
    seats: Array<SeatOD>;
    freeSeats: Array<Seat>;
    active: number | null;
}

const timer = function(ms: number) {
    return function(call) {
        return setTimeout(call, ms);
    }
}

export default class Game {

    private seatMax: number;

    private minBet: Array<TokenValue>;

    private watchersQueue: Array<Player> = [];

    private playersQueue: Array<Player> = [];

    private seatMap: Array<Seat> = [];

    private dealerSeat: DealerSeat;

    private state: Actions = Actions.waitingPlayers;

    private SM: ShufflingMachine;

    private tenSecTimer = timer(10000);

    private fiveSecTimer = timer(5000);

    constructor(seatMax?: number, minBet?: Array<TokenValue>, deckAmount?: number) {

        this.seatMax = seatMax ? seatMax : 5;

        this.createSeats();

        this.minBet = minBet ? minBet : [TokenValue.$1, TokenValue.$1];

        this.SM = new ShufflingMachine(deckAmount);

        this.dealerSeat = new DealerSeat();

        this.dealerSeat.down(new Dealer());

    }

    private createSeats(): void {
        for(let i = 1; i <= this.seatMax; i++) this.seatMap.push(new Seat());
    }

    private checkFreeSeat(): void {
        while(this.playersQueue.length > 0 && this.seats.length < this.seatMax) {
            this.emptySeats[0].down(this.playersQueue.pop());
        }
    }

    async start() {

        if (this.state != Actions.waitingPlayers) return;

        await this.cleanup();

        await this.checkFreeSeat();

        if (this.state === Actions.waitingPlayers && this.seats.length > 0) {

            this.state = Actions.betting;

            await this.betting();

            this.state = Actions.deal;

            await this.deal();

            this.state = Actions.play;

            await this.play();

            this.state = Actions.dealersPlay;

            this.dealerSeat.player.openHiddenCard();

            this.dealerPlay();

            this.broadcast();

            this.payments();

            this.broadcast();

            console.log('Game over');

            await (new Promise(resolve => this.fiveSecTimer(() => resolve(true))));

            this.state = Actions.waitingPlayers;

            return await this.start();

        }

    }

    private async cleanup() {

        return new Promise(resolve => {

            this.seats.forEach(seat => {

                seat.state = SeatStates.Unknown;

                if (!seat.bet.length && seat.player.deposit < this.minBet.reduce((sum, value) => sum + value, 0)) {
                    seat.up();
                    return;
                }

                while(seat.bet.length && seat.player.total <= 21) {
                    seat.player.setToken(seat.bet.pop());
                }

                while(seat.player.hand.length) {
                    this.SM.card = seat.player.hand.pop();
                }
            });

            while(this.dealerSeat.player.hand.length) {
                this.SM.card = this.dealerSeat.player.hand.pop();
            }

            resolve(true);

        });
    }

    private async betting() {

        for (let i = 0; i < this.seats.length; i++) {

            await (new Promise(async resolve => {

                console.log(`Waiting for player ${this.seats[i].player.id} betting...`);

                this.minBet.forEach(bet => this.seats[i].betting(bet));
                this.broadcast(this.seats[i].id);

                resolve(await this.bet(this.seats[i]));

            }));

        }

    }

    private bet(seat: Seat) {
        return new Promise(resolve => {
            let timer = this.tenSecTimer(() => resolve(0));
            seat.player.socket.emit('bet', '?', res => {

                clearTimeout(timer);

                if (!res) {
                    resolve(true);
                } else {
                    const bet = seat.bet.reduce((sum, cur) => sum + Number(cur.value), 0) * Number(res);
                    try {
                        seat.betting(Number(bet));
                    } catch (err) {

                    }
                    resolve(true);
                }
            });
        });
    }

    /**
     * Offer to take card (recursion)
     * @param seat Seat
     */
    private offer(seat: Seat): Promise<boolean> {

        return new Promise(resolve => {

            if (seat.player.total == 21) {
                resolve(false);
                if (this.dealerSeat.player.total < 10) seat.state = SeatStates.BlackJack;
                return;
            } else if (seat.player.total > 21) {
                resolve(false);
                seat.state = SeatStates.Looser;
                return;
            }

            let timer = this.tenSecTimer(() => resolve(false));
            seat.player.socket.emit(PlayerActions.offer, '?', res => {
                if (res === PlayerActions.hit) {
                    //console.log("yes");
                    seat.player.takeCard(this.SM.card);
                    clearTimeout(timer);
                    this.broadcast(seat.id);
                    resolve(this.offer(seat));
                    return;
                }
                else {
                    clearTimeout(timer);
                    this.broadcast();
                    resolve(false);
                    return;
                }
            });
        });
    }

    private async deal() {

        this.seats.forEach(seat => {
            seat.player.takeCard(this.SM.card);
            seat.player.takeCard(this.SM.card);
        });
        this.dealerSeat.player.hand.push(this.SM.card);
        this.dealerSeat.player.hiddenCard = this.SM.card;
        this.broadcast();
    }

    private async play() {

        for (let i = 0; i < this.seats.length; i++) {

            this.broadcast(this.seats[i].id);

            await (new Promise(async resolve => {

                console.log(`Waiting for player ${this.seats[i].player.id} deal...`);

                resolve(await this.offer(this.seats[i]));

            }));

        }
    }

    private dealerPlay() {

        while (this.dealerSeat.player.total < 17) {
            if (this.dealerSeat.player.total >= 21) return;
            else this.dealerSeat.player.takeCard(this.SM.card);
        }

    }

    private payments () {
        this.seats.filter(seat => seat.state === SeatStates.Unknown).forEach(seat => {
            if (seat.player.total === 21) {
                if (this.dealerSeat.player.total === 21) seat.state = SeatStates.Draw;
                else seat.state = SeatStates.BlackJack;
                return;
            } else if (this.dealerSeat.player.total > 21 || seat.player.total > this.dealerSeat.player.total) {
                seat.state = SeatStates.Winner;
                return;
            } else if (this.dealerSeat.player.total < 21 && seat.player.total === this.dealerSeat.player.total) {
                seat.state = SeatStates.Draw;
            } else {
                seat.state = SeatStates.Looser;
            }
        });
    }

    join(player: Player) {
        if (this.playersQueue.length && this.playersQueue.find(_player => _player === player)) throw new Error('Already in queue');
        this.playersQueue.push(player);
        this.start();
        this.broadcast();
    }

    joinWatcher(player: Player) {
        if (this.watchersQueue.length && this.watchersQueue.find(_player => _player === player)) throw new Error('Already in queue');
        this.watchersQueue.push(player);
        this.broadcast();
    }

    leave(player: Player) {
        this.playersQueue = this.playersQueue.filter(_player => _player !== player);
        this.seats.forEach(seat => {
            if (seat.player === player) seat.up();
        });
    }

    broadcast(active?: number) {

        let seats = [];

        this.seats.forEach(seat => {
            let _seat: SeatOD = {
                id: seat.id,
                player: seat.player ? {
                    id: seat.player.id,
                    name: seat.player.name,
                    deposit: seat.player.deposit,
                    hand: seat.player.hand,
                    total: seat.player.total
                } : null,
                bet: seat.bet.sort((a, b) => seat.bet.filter(i => i.value === b.value).length - seat.bet.filter(i => i.value === a.value).length),
                deposit: seat.deposit.sort((a, b) => seat.bet.filter(i => i.value === b.value).length - seat.bet.filter(i => i.value === a.value).length),
                state: seat.state
            }
            seats.push(_seat);
        });

        let table: BroadcastData = {
            shufflingMachine: {
                shoe: this.SM.shoeLength,
                played: this.SM.playedLength
            },
            dealer: {
                hand: this.dealerSeat.player.hand,
                total: this.dealerSeat.player.total,
                state: this.dealerSeat.state
            },
            seats,
            freeSeats: this.emptySeats,
            active
        }

        this.seats.forEach(seat => {
            seat.player.socket.emit('game', table);
        });

        this.watchersQueue.forEach(watcher => {
            watcher.socket.emit('game', table);
        });
    }

    get seats() {
        return this.seatMap.filter(seat => seat.player !== undefined);
    }

    get emptySeats() {
        return this.seatMap.filter(seat => seat.player === undefined);
    }

}
