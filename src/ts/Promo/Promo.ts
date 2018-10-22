import { IApiModule, IModuleApi } from 'Core/Modules/IApiModule';
import { PurchasingApi } from 'Promo/Native/Purchasing';
import { PurchasingUtilities } from 'Promo/Utilities/PurchasingUtilities';
import { IParserModule } from '../Ads/Modules/IParserModule';
import { PromoCampaignParser } from './Parsers/PromoCampaignParser';
import { PromoAdUnitFactory } from './AdUnits/PromoAdUnitFactory';
import { IAds } from '../Ads/IAds';
import { ICore } from '../Core/ICore';
import { IPurchasing } from '../Purchasing/IPurchasing';
import { PromoEvents } from './Utilities/PromoEvents';
import { IAnalytics } from '../Analytics/IAnalytics';
import { IPromo, IPromoApi } from './IPromo';

export class Promo implements IParserModule, IPromo {

    public readonly Api: IPromoApi;

    public readonly PromoEvents: PromoEvents;

    private readonly _core: ICore;
    private readonly _ads: IAds;

    private readonly _parser: PromoCampaignParser;
    private readonly _adUnitFactory: PromoAdUnitFactory;

    constructor(core: ICore, ads: IAds, purchasing: IPurchasing, analytics: IAnalytics) {
        this._core = core;
        this._ads = ads;

        this.Api = {
            Purchasing: new PurchasingApi(this._core.NativeBridge)
        };

        this.PromoEvents = new PromoEvents(core.NativeBridge.getPlatform(), core.Api, core.Config, ads.Config, core.ClientInfo, core.DeviceInfo, analytics.AnalyticsStorage);
        PurchasingUtilities.initialize(this._core.Api, this.Api, purchasing.Api, this._core.ClientInfo, this._core.Config, this._ads.Config, this._ads.PlacementManager, this._ads.CampaignManager, this.PromoEvents, core.RequestManager, analytics.AnalyticsManager);
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
