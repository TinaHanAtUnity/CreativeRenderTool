import { Model, ISchema } from 'Core/Models/Model';

export interface IStoreTransaction {
    ts: number;
    receipt: string;
    productId: string;
    price: number;
    currency: string;
    transactionId: string;
}

export class StoreTransaction extends Model<IStoreTransaction> {
    public static Schema: ISchema<IStoreTransaction> = {
        ts: ['number'],
        receipt: ['string'],
        productId: ['string'],
        price: ['number'],
        currency: ['string'],
        transactionId: ['string']
    };

    constructor(timestamp: number, productId: string, price: number, currency: string, receipt: string, transactionId: string) {
        super('StoreTransaction', StoreTransaction.Schema, {
            ts: timestamp,
            receipt: receipt,
            productId: productId,
            price: price,
            currency: currency,
            transactionId: transactionId
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

    public getPrice(): number {
        return this.get('price');
    }

    public getCurrency(): string {
        return this.get('currency');
    }

    public getTransactionId(): string {
        return this.get('transactionId');
    }

    public getDTO() {
        return {
            ts: this.getTimestamp(),
            receipt: this.getReceipt(),
            productId: this.getProductId(),
            amount: this.getPrice(),
            currency: this.getCurrency(),
            transactionId: this.getTransactionId()
        };
    }
}
