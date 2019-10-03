import { IAds } from 'Ads/IAds';
import { AbstractParserModule, IContentTypeHandler } from 'Ads/Modules/AbstractParserModule';
import { ICore } from 'Core/ICore';
import { PromoAdUnitFactory } from 'Promo/AdUnits/PromoAdUnitFactory';
import { IPromo, IPromoApi } from 'Promo/IPromo';
import { PurchasingApi } from 'Promo/Native/Purchasing';
import { PromoCampaignParser } from 'Promo/Parsers/PromoCampaignParser';
import { PromoEvents } from 'Promo/Utilities/PromoEvents';
import { PurchasingUtilities } from 'Promo/Utilities/PurchasingUtilities';
import { IPurchasing } from 'Purchasing/IPurchasing';
import { PromoAdUnitParametersFactory } from 'Promo/AdUnits/PromoAdUnitParametersFactory';
import { OrganicPurchaseManager } from 'Purchasing/OrganicPurchaseManager';

export class Promo extends AbstractParserModule implements IPromo {

    public readonly Api: IPromoApi;

    public readonly PromoEvents: PromoEvents;
    public readonly OrganicPurchaseManager: OrganicPurchaseManager;

    private readonly _core: ICore;
    private readonly _ads: IAds;
    private readonly _purchasing: IPurchasing;

    constructor(core: ICore, ads: IAds, purchasing: IPurchasing) {
        const contentTypeHandlerMap: { [key: string]: IContentTypeHandler } = {};
        contentTypeHandlerMap[PromoCampaignParser.ContentType] = {
            parser: new PromoCampaignParser(core),
            factory: new PromoAdUnitFactory(new PromoAdUnitParametersFactory(purchasing.Api, core, ads))
        };
        super(contentTypeHandlerMap);

        this._core = core;
        this._ads = ads;
        this._purchasing = purchasing;

        this.Api = {
            Purchasing: new PurchasingApi(this._core.NativeBridge)
        };

        this.PromoEvents = new PromoEvents(core.NativeBridge.getPlatform(), core.Api, core.Config, ads.PrivacySDK, core.ClientInfo, core.DeviceInfo, ads.Analytics.AnalyticsStorage);
        this.OrganicPurchaseManager = new OrganicPurchaseManager(core.Api.Storage, this.PromoEvents, core.RequestManager);
    }

    public initialize() {
        this.OrganicPurchaseManager.initialize();
        PurchasingUtilities.initialize(this._core.Api, this.Api, this._purchasing.Api, this._core.ClientInfo, this._core.Config, this._ads.Config, this._ads.PlacementManager, this._ads.CampaignManager, this.PromoEvents, this._core.RequestManager, this._core.MetaDataManager, this._ads.Analytics.AnalyticsManager, this._ads.PrivacySDK);
    }

}
