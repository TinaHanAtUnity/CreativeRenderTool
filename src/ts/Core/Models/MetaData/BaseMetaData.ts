import { ISchema, Model } from 'Core/Models/Model';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { MetaData } from 'Core/Utilities/MetaData';

export interface IMetaData {
    category: string;
    keys: string[];
}

export abstract class BaseMetaData<T extends IMetaData = IMetaData> extends Model<T> {
    public static Schema: ISchema<IMetaData> = {
        category: ['string'],
        keys: ['array']
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

    protected setValues(data: { [key: string]: unknown }): boolean {
        let success = false;
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                try {
                    this.set(<unknown>key, data[key]);
                } catch (e) {
                    return false;
                }

                success = true;
            }
        }

        return success;
    }

    private getValues(nativeBridge: NativeBridge, keys: string[]): Promise<{}> {
        const returnObject: { [key: string]: unknown } = {};
        const metaData: MetaData = new MetaData(nativeBridge);
        return metaData.hasCategory(this.getCategory()).then(exists => {
            if(!exists) {
                return Promise.resolve([]);
            }
            return Promise.all(keys.map((key) => metaData.get<unknown>(this.getCategory() + '.' + key, false).then(([found, value]) => {
                if(found) {
                    returnObject[key] = value;
                }
            })));
        }).then(() => {
            return returnObject;
        });
    }
}
