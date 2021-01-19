import { Card } from "./entities/card";

import { Deck } from "./entities/deck";

export class ShufflingMachine {

    private shoe: Array<Card> = [];

    private played: Array<Card> = [];

    private deckCount: number = 1;

    private deck: Deck;

    constructor (deckCount?: number) {

        if (deckCount) this.deckCount = deckCount;

        for (let i = 1; i <= this.deckCount; i++) this.fillShoe(new Deck());

        for (let i = 0; i <= 3; i++) this.shuffle();
    }

    private fillShoe(deck: Deck): void {
        this.deck = deck;
        this.shoe = this.shoe.concat(deck.cards);
    }

    private shuffle(): void {
        this.shoe = this.shoe.concat(this.played);
        this.shoe.sort(() => Math.random() - 0.5);
    }

    private check(): void {
        if (this.shoeLength <= (this.deckCount * this.deck.length) / 3) this.shuffle();
    }

    get shoeLength(): number {
        return this.shoe.length;
    }

    get playedLength(): number {
        return this.played.length;
    }

    get card(): Card {
        this.check();
        return this.shoe.pop();
    }

    set card(card: Card) {
        this.played.push(card);
    }

}
