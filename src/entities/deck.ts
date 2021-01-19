import { CardSuit, CardPip, Card } from "./card";

export class Deck {

    private _cards: Array<Card> = [];

    constructor() {

        const pips: Array<CardPip> = Object.values(CardPip);

        const suits: Array<CardSuit> = Object.values(CardSuit);

        suits.forEach(suit => {

            pips.forEach(pip => {
                this._cards.push(new Card(suit, pip));
            });

        });

    }

    get cards(): Array<Card>  {
        return this._cards;
    }

    get length(): number {
        return this.cards.length;
    }

}
