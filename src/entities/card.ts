
export enum CardSuit {
    Spades = 'spades',
    Hearts = 'hearts',
    Diams = 'diams',
    Clubs = 'clubs'
}

export enum CardPip {
    Ace = 'ace',
    King = 'king',
    Queen = 'queen',
    Jack = 'jack',
    Ten = '10',
    Nine = '9',
    Eight = '8',
    Seven = '7',
    Six = '6',
    Five = '5',
    Four = '4',
    Three = '3',
    Two = '2'
}

export class Card {

    public suit: CardSuit;

    public pip: CardPip;

    constructor (suit: CardSuit, pip: CardPip) {
        
        this.suit = suit;
        
        this.pip = pip;
    
        return Object.freeze(this);
    }

    get value(): number {
        switch(this.pip) {
            case CardPip.Ace:
                return 11;
            case CardPip.King:
            case CardPip.Queen:
            case CardPip.Jack:
                return 10;
            default:
                return Number(this.pip);
        }
    }

}