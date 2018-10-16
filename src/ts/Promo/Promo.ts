import { Ads, AdsModule } from 'Ads/Ads';
import { IAPIModule, IModuleApi } from 'Core/Modules/IApiModule';
import { PurchasingApi } from 'Promo/Native/Purchasing';
import { PurchasingUtilities } from 'Promo/Utilities/PurchasingUtilities';
import { IParserModule } from '../Ads/Modules/IParserModule';
import { PromoCampaignParser } from './Parsers/PromoCampaignParser';
import { PromoAdUnitFactory } from './AdUnits/PromoAdUnitFactory';

export interface IPromoApi extends IModuleApi {
    Purchasing: PurchasingApi;
}

export class Promo extends AdsModule implements IAPIModule, IParserModule {

    public readonly Api: IPromoApi;

    private readonly _parser: PromoCampaignParser;
    private readonly _adUnitFactory: PromoAdUnitFactory;

    constructor(ads: Ads) {
        super(ads);

        this.Api = {
            Purchasing: new PurchasingApi(this.Core.NativeBridge)
        };
    }

    public initialize(): Promise<void> {
        PurchasingUtilities.initialize(this.Ads.Core.Api, this.Api, this.Ads.Core.ClientInfo, this.Ads.Core.Config, this.Ads.Config, this.Ads.PlacementManager);
        PurchasingUtilities.sendPurchaseInitializationEvent();
        this.Api.Purchasing.onIAPSendEvent.subscribe((iapPayload) => PurchasingUtilities.handleSendIAPEvent(iapPayload));
        this._initialized = true;
        return Promise.resolve();
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
