import { Model } from 'Models/Model';

export class PlayerMetaData extends Model {

    private _sid: string;
    private _name: string;
    private _gender: string;
    private _age: number;

    constructor(sid: string, name: string, gender: string, age: number) {
        super();
        this._sid = sid;
        this._name = name;
        this._gender = gender;
        this._age = age;
    }

    public getSid(): string {
        return this._sid;
    }

    public getName(): string {
        return this._name;
    }

    public getGender(): string {
        return this._gender;
    }

    public getAge(): number {
        return this._age;
    }

    public getDTO(): { [key: string]: any } {
        return {
            'sid': this._sid,
            'name': this._name,
            'version': this._gender,
            'age': this._age
        };
    }

}
