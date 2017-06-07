import { ISchema, Model } from 'Models/Model';
import { NativeBridge } from 'Native/NativeBridge';
import { MetaData } from 'Utilities/MetaData';

export interface IMetaData {
    category: string;
    keys: string[];
}

export abstract class BaseMetaData<T extends IMetaData = IMetaData> extends Model<T> {
    public static Schema: ISchema<IMetaData> = {
        category: ['string'],
        keys: ['array'],
    };

    constructor(name: string, schema: ISchema<T>) {
        super(name, schema);
    }

    public getCategory(): string {
        return this.get('category');
    }

    public getKeys(): string[] {
        return this.get('keys');
    }

    public fetch(nativeBridge: NativeBridge, keys?: string[]): Promise<boolean> {
        let finalKeys: string[] = [];
        if (!keys) {
            finalKeys = this.getKeys();
        } else {
            finalKeys = keys;
        }

        return this.getValues(nativeBridge, finalKeys).then((data) => {
            return this.setValues(data);
        });
    }

    protected setValues(data: {}): boolean {
        let success = false;
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                try {
                    this.set(<any>key, data[key]);
                } catch (e) {
                    return false;
                }

                success = true;
            }
        }

        return success;
    }

    private getValues(nativeBridge: NativeBridge, keys: string[]): Promise<{}> {
        const returnObject = {};
        const metaData: MetaData = new MetaData(nativeBridge);
        return metaData.hasCategory(this.getCategory()).then(exists => {
            if(!exists) {
                return Promise.resolve([]);
            }
            return Promise.all(keys.map((key) => metaData.get<any>(this.getCategory() + '.' + key, false).then(([found, value]) => {
                if(found) {
                    returnObject[key] = value;
                }
            })));
        }).then(() => {
            return returnObject;
        });
    }
}
