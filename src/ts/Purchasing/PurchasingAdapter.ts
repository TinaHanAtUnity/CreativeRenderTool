import { PromoCampaign } from 'Promo/Models/PromoCampaign';
import { Observable1 } from 'Core/Utilities/Observable';
import { Model } from 'Core/Models/Model';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';

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
export interface IOrganicPurchase{
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
    private _nativeBridge: NativeBridge;

    //(data: { [key: string]: any })
    constructor(nativeBridge: NativeBridge, data: { [key: string]: any } ) {
       this._nativeBridge = nativeBridge;

       for (const key in data) {
           if(key === 'productId'){
               this._productId = data[key];
           } else if(key === 'price'){
               this._price = data[key];
           } else if(key === 'currency'){
            this._currency = data[key];
           } else if(key === 'receiptPurchaseData'){
               this._receiptPurchaseData = data[key];
           } else if(key === 'signature'){
               this._signature = data[key];
           }
        }
    }

    public getId(): string | undefined {
        this._nativeBridge.Sdk.logDebug("JINDOU::5"+this._productId);
        return this._productId;
    }

    public getPrice(): number | undefined {
        this._nativeBridge.Sdk.logDebug("JINDOU::5"+this._price);
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

