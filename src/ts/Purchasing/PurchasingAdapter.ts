import { Observable1 } from 'Core/Utilities/Observable';
import { PromoCampaign } from 'Promo/Models/PromoCampaign';

export interface ITransactionDetails {
    productId: string;
    transactionId: string;
    receipt: string;
    price: number;
    currency: string;
    extras: unknown;
}

export interface ITransactionErrorDetails {
    transactionError: string;
    exceptionMessage: string;
    store: string;
    storeSpecificErrorCode: string;
    extras: unknown;
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
