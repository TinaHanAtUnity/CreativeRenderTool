export class Double {

    private _value: number;

    constructor(value: number) {
        this._value = value;
    }

    public toJSON(): string {
        return this._value.toFixed(20) + '=double';
    }

}
