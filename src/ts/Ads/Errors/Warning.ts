
export class Warning {

    public readonly _message: string;
    public readonly _type?: string;

    constructor(message: string, type?: string) {
        this._message = message;
        this._type = type;
    }
}
