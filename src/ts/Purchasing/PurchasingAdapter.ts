import { PromoCampaign } from 'Promo/Models/PromoCampaign';
import { Observable1 } from 'Core/Utilities/Observable';

export interface ITransactionDetails {
    productId: string;
    transactionId: string;
    receipt: string;
    price: number;
    currency: string;
    extras: any;
}

export interface ITransactionErrorDetails {
    transactionError: string;
    exceptionMessage: string;
    store: string;
    storeSpecificErrorCode: string;
    extras: any;
}

export interface IProduct {
    productId: string;
    localizedPriceString: string;
    localizedTitle: string;
    productType: string | undefined;
    isoCurrencyCode: string | undefined;
    localizedPrice: number | undefined;
}
export interface IPurchasingAdapter {
    initialize(): Promise<void>;
    purchaseItem(productId: string, campaign: PromoCampaign, placementId: string, isNative: boolean): Promise<ITransactionDetails>;
    refreshCatalog(): Promise<IProduct[]>;
    onPromoClosed(campaign: PromoCampaign, placementId: string): void;

    onCatalogRefreshed: Observable1<IProduct[]>;
}
export interface IOrganicPurchase {
    productId: string;
    price: number;
    currency: string;
    receiptPurchaseData:string;
    signature:string;
}

export class OrganicPurchase {
    private _productId: string | undefined;
    private _price: number | undefined;
    private _currency: string | undefined;
    private _receiptPurchaseData: string | undefined;
    private _signature: string | undefined;

    constructor(data: {[key: string]: any}) {

       for (const key in data) {
            switch(key) {
                case 'productId':
                    this._productId = data[key];
                    break;
                case 'price':
                    this._price = data[key];
                    break;
                case 'currency':
                    this._currency = data[key];
                    break;
                case 'receiptPurchaseData':
                    this._receiptPurchaseData = data[key];
                    break;
                case 'signature':
                    this._signature = data[key];
                    break;
                default:
                    break;
            }
        }
    }

    public getId(): string | undefined {
        return this._productId;
    }

    public getPrice(): number | undefined {
        return this._price;
    }

    public getCurrency(): string | undefined {
        return this._currency;
    }

    public getReceipt(): string | undefined {
        return this._receiptPurchaseData;
    }

    public getSignature(): string | undefined {
        return this._signature;
    }
}
