import { IAds } from 'Ads/IAds';
import { IParserModule } from 'Ads/Modules/IParserModule';
import { IAnalytics } from 'Analytics/IAnalytics';
import { ICore } from 'Core/ICore';
import { PromoAdUnitFactory } from 'Promo/AdUnits/PromoAdUnitFactory';
import { IPromo, IPromoApi } from 'Promo/IPromo';
import { PurchasingApi } from 'Promo/Native/Purchasing';
import { PromoCampaignParser } from 'Promo/Parsers/PromoCampaignParser';
import { PromoEvents } from 'Promo/Utilities/PromoEvents';
import { PurchasingUtilities } from 'Promo/Utilities/PurchasingUtilities';
import { IPurchasing } from 'Purchasing/IPurchasing';

export class Promo implements IParserModule, IPromo {

    public readonly Api: IPromoApi;

    public readonly PromoEvents: PromoEvents;

    private readonly _core: ICore;
    private readonly _ads: IAds;
    private readonly _purchasing: IPurchasing;
    private readonly _analytics: IAnalytics;

    private readonly _parser: PromoCampaignParser;
    private readonly _adUnitFactory: PromoAdUnitFactory;

    constructor(core: ICore, ads: IAds, purchasing: IPurchasing, analytics: IAnalytics) {
        this._core = core;
        this._ads = ads;
        this._purchasing = purchasing;
        this._analytics = analytics;

        this.Api = {
            Purchasing: new PurchasingApi(this._core.NativeBridge)
        };

        this._parser = new PromoCampaignParser();
        this._adUnitFactory = new PromoAdUnitFactory();

        this.PromoEvents = new PromoEvents(core.NativeBridge.getPlatform(), core.Api, core.Config, ads.Config, core.ClientInfo, core.DeviceInfo, analytics.AnalyticsStorage);
    }

    public initialize() {
        PurchasingUtilities.initialize(this._core.Api, this.Api, this._purchasing.Api, this._core.ClientInfo, this._core.Config, this._ads.Config, this._ads.PlacementManager, this._ads.CampaignManager, this.PromoEvents, this._core.RequestManager, this._analytics.AnalyticsManager);
    }

    public canParse(contentType: string) {
        return contentType === PromoCampaignParser.ContentType;
    }

    public getParser(contentType: string) {
        return this._parser;
    }

    public getParsers() {
        return [this._parser];
    }

    public getAdUnitFactory() {
        return this._adUnitFactory;
    }

}
