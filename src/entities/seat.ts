import { Player } from "./player";

import { TokenValue, Token, tokenValues } from "./token";

import { Dealer } from "./dealer";

export enum SeatStates {
    Unknown,
    Looser,
    Winner,
    BlackJack,
    Draw
}

export class Seat {

    private _id: number;

    private _bet: Array<Token> = [];

    protected _player: Player = undefined;

    protected _state: SeatStates = SeatStates.Unknown;

    constructor() {
        this._id = this.generateId();
    }

    down (player: Player): void {

        if (this._player !== undefined) throw new Error('Seat already taken');

        this._player = player;

    }

    up (): void {
        this._player = undefined;
    }

    public betting(bet: TokenValue): void {

        const values = tokenValues.sort((a, b) => b - a);

        while(bet > 0) {
            for(const value of values) {
                if (bet >= value) {

                    this._bet.push(this.player.getToken(value));

                    bet -= value;

                    break;
                }
            }
        }
    }

    public get deposit(): Array<Token> {

        let deposit: number = this.player.deposit;

        const tokens: Array<Token> = [];

        const values = tokenValues.sort((a, b) => b - a);

        while(deposit > 0) {
            for(const value of values) {
                if (deposit >= value) {

                    tokens.push(new Token(value));

                    deposit -= value;

                    break;
                }
            }
        }

        return tokens;
    }

    set state(state: SeatStates) {

        this._state = state;

        switch(this._state) {
            case SeatStates.BlackJack:

                let totalTokenValues: number = this._bet.reduce((total: number, token: Token) => total + token.value, 0);

                totalTokenValues *= 1.5;

                while(totalTokenValues > 0) {
                    for(const value of tokenValues) {
                        if (totalTokenValues >= value) {

                            this._bet.push(new Token(value));

                            totalTokenValues -= value;

                            break;
                        }
                    }
                }

            break;
            case SeatStates.Winner:
                this._bet.forEach(bet => this._bet.push(bet));
            break;
            case SeatStates.Draw:
                while(this.bet.length) this.player.setToken(this._bet.pop());
            break;
            case SeatStates.Looser:
                this._bet = [];
            break;
        }
    }

    get id(): number {
        return this._id;
    }

    get state(): SeatStates {
        return this._state;
    }

    get player(): Player {
        return this._player;
    }

    public get bet(): Array<Token> {
        return this._bet;
    } 

    private generateId(): number {

        const hrtime = process.hrtime();

        return hrtime[0] * 1000000000 + hrtime[1];

    }

}

export class DealerSeat extends Seat {

    protected _player: Dealer = undefined;

    down (dealer: Dealer) {
        this._player = dealer;
    }

    get player(): Dealer {
        return this._player;
    }

}
