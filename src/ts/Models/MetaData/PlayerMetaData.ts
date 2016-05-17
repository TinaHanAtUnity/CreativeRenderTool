import { Model } from 'Models/Model';
import { NativeBridge } from 'Native/NativeBridge';
import { StorageType } from 'Native/Api/Storage';

export class PlayerMetaData extends Model {

    private _sid: string;
    private _name: string;
    private _gender: string;
    private _age: number;

    public static exists(nativeBridge: NativeBridge): Promise<boolean> {
        return nativeBridge.Storage.getKeys(StorageType.PUBLIC, 'player', false).then(keys => {
            return keys.length > 0;
        });
    }

    public static fetch(nativeBridge: NativeBridge): Promise<PlayerMetaData> {
        return PlayerMetaData.exists(nativeBridge).then(exists => {
            if(!exists) {
                return Promise.resolve(undefined);
            }
            return Promise.all([
                nativeBridge.Storage.get<string>(StorageType.PUBLIC, 'player.sid.value').catch(() => undefined),
                nativeBridge.Storage.get<string>(StorageType.PUBLIC, 'player.name.value').catch(() => undefined),
                nativeBridge.Storage.get<string>(StorageType.PUBLIC, 'player.gender.value').catch(() => undefined),
                nativeBridge.Storage.get<number>(StorageType.PUBLIC, 'player.age.value').catch(() => undefined)
            ]).then(([sid, name, gender, age]) => {
                nativeBridge.Storage.delete(StorageType.PUBLIC, 'player');
                return new PlayerMetaData(sid, name, gender, age);
            });
        });
    }

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
            'playerSid': this._sid,
            'playerName': this._name,
            'playerGender': this._gender,
            'playerAge': this._age
        };
    }

}
