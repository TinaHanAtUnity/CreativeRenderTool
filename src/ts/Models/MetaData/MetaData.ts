import { ISchema, Model } from 'Models/Model';

export interface IMetaData {
    category: string;
    keys: string[];
}

export abstract class MetaData<T extends IMetaData = IMetaData> extends Model<T> {
    public static Schema: ISchema<IMetaData> = {
        category: ['string'],
        keys: ['array']
    };

    constructor(schema: ISchema<T>) {
        super(schema);
    }
}
