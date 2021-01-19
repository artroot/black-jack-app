
export enum TokenValue {
    C50 = 0.5,
    $1 = 1,
    $5 = 5,
    $25 = 25,
    $100 = 100,
    $500 = 500,
    $1000 = 1000
}

export const tokenValues: Array<TokenValue> = [
    TokenValue.C50,
    TokenValue.$1,
    TokenValue.$5,
    TokenValue.$25,
    TokenValue.$100,
    TokenValue.$500,
    TokenValue.$1000
];

export class Token {
    
    private _value: TokenValue;

    constructor(value: TokenValue) {
        this._value = value;
    }

    public get value(): TokenValue {
        return this._value;
    }

}