import { IPurchasingAdapter, ITransactionDetails, IProduct } from 'Purchasing/PurchasingAdapter';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { PromoCampaign } from 'Promo/Models/PromoCampaign';
import { ICoreApi } from 'Core/ICore';
import { Observable1 } from 'Core/Utilities/Observable';

export class TestModePurchasingAdapter implements IPurchasingAdapter {

    public readonly onCatalogRefreshed = new Observable1<IProduct[]>();
    private _core: ICoreApi;

    constructor(core: ICoreApi) {
        this._core = core;
    }

    public initialize(): Promise<void> {
        return Promise.resolve();
    }

    public purchaseItem(thirdPartyEventManager: ThirdPartyEventManager, productId: string, campaign: PromoCampaign, placementId: string, isNative: boolean): Promise<ITransactionDetails> {
        return Promise.resolve(<ITransactionDetails>{});
    }

    public refreshCatalog(): Promise<IProduct[]> {
        const productArray: IProduct[] = [{
            productId: 'com.unity3d.testmode.product',
            localizedPriceString: '$9.99',
            localizedTitle: 'IAP Promotion Test Product',
            productType: 'consumable',
            isoCurrencyCode: 'usd',
            localizedPrice: 9.99
        }];

        return Promise.resolve(productArray);
    }

    public onPromoClosed(thirdPartyEventManager: ThirdPartyEventManager, campaign: PromoCampaign, placementId: string): void {
        this._core.Sdk.logInfo('Closing Test Promo ad unit');
    }
}
