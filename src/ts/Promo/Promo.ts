import { IApiModule, IModuleApi } from 'Core/Modules/IApiModule';
import { PurchasingApi } from 'Promo/Native/Purchasing';
import { PurchasingUtilities } from 'Promo/Utilities/PurchasingUtilities';
import { IParserModule } from '../Ads/Modules/IParserModule';
import { PromoCampaignParser } from './Parsers/PromoCampaignParser';
import { PromoAdUnitFactory } from './AdUnits/PromoAdUnitFactory';
import { IAds } from '../Ads/IAds';
import { ICore } from '../Core/ICore';

export interface IPromoApi extends IModuleApi {
    Purchasing: PurchasingApi;
}

export class Promo implements IParserModule, IApiModule {

    public readonly Api: IPromoApi;

    private readonly _core: ICore;
    private readonly _ads: IAds;

    private readonly _parser: PromoCampaignParser;
    private readonly _adUnitFactory: PromoAdUnitFactory;

    constructor(core: ICore, ads: IAds) {
        this._core = core;
        this._ads = ads;

        this.Api = {
            Purchasing: new PurchasingApi(this._core.NativeBridge)
        };

        PurchasingUtilities.initialize(this._core.Api, this.Api, this._core.ClientInfo, this._core.Config, this._ads.Config, this._ads.PlacementManager);
        PurchasingUtilities.sendPurchaseInitializationEvent();
        this.Api.Purchasing.onIAPSendEvent.subscribe((iapPayload) => PurchasingUtilities.handleSendIAPEvent(iapPayload));

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
