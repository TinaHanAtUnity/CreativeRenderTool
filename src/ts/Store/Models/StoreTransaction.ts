import { Model, ISchema } from 'Core/Models/Model';

export interface IStoreTransaction {
    ts: number;
    receipt: string;
    productId: string;
    amount: number;
    currency: string;
}

export class StoreTransaction extends Model<IStoreTransaction> {
    public static Schema: ISchema<IStoreTransaction> = {
        ts: ['number'],
        receipt: ['string'],
        productId: ['string'],
        amount: ['number'],
        currency: ['string']
    };

    constructor(timestamp: number, productId: string, amount: number, currency: string, receipt: string) {
        super('StoreTransaction', StoreTransaction.Schema, {
            ts: timestamp,
            receipt: receipt,
            productId: productId,
            amount: amount,
            currency: currency
        });
    }

    public getTimestamp(): number {
        return this.get('ts');
    }

    public getReceipt(): string {
        return this.get('receipt');
    }

    public getProductId(): string {
        return this.get('productId');
    }

    public getAmount(): number {
        return this.get('amount');
    }

    public getCurrency(): string {
        return this.get('currency');
    }

    public getDTO() {
        return {
            ts: this.getTimestamp(),
            receipt: this.getReceipt(),
            productId: this.getProductId(),
            amount: this.getAmount(),
            currency: this.getCurrency()
        };
    }
}
