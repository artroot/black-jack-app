import { Card, CardPip } from "./card";

import { Token, TokenValue } from "./token";

export enum Role {
    player = 'player',
    dealer = 'dealer'
}

export class Player {

    protected _id: number;

    public name: string = '';

    protected _role: Role = Role.player;

    protected _hand: Array<Card> = [];

    protected _socket: any;

    private _deposit: number = 0;

    constructor(socket: any) {

        this._id = this.generateId();

        this._socket = socket;

    }

    takeCard(card: Card): Player {
        
        this._hand.push(card);

        if (this._socket) this._socket.emit('hand', this._hand);

        return this;
    }

    getToken(bet: TokenValue): Token {
        if (this._deposit < bet) throw new Error('Have no tokens');
        this._deposit -= bet;
        return new Token(bet);
    }

    setToken(token: Token): Player {
        this._deposit += token.value;
        return this;
    }

    get hand(): Array<Card> {
        return Object.create(this._hand);
    }

    get deposit(): number {
        return this._deposit;
    }

    get role(): Role {
        return this._role;
    }

    get total(): number {

        let total: number = 0;

        this.hand.filter(card => card.pip !== CardPip.Ace).forEach(card => {
            total += card.value;
        });

        const aces: Array<Card> = this.hand.filter(card => card.pip === CardPip.Ace);

        aces.forEach(card => {
            if (aces.length >= 1 && (total + 11) > 21) total += 1;
            else total += card.value;
        });

        return total;

    }

    private generateId(): number {

        const hrtime = process.hrtime();

        return hrtime[0] * 1000000000 + hrtime[1];

    }

}
