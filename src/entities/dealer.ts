import { Card } from "./card";

import { Player, Role } from "./player";

export class Dealer extends Player {

    protected _hiddenCard: Card = undefined;

    constructor() {

        super(null);

        this.name = 'Dealer';

        this._role = Role.dealer;

    }

    set hiddenCard(card: Card) {
        this._hiddenCard = card;
    }

    openHiddenCard(): void {

        this._hand.push(this._hiddenCard);

        this._hiddenCard = undefined;

    }

}