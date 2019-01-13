import { AbstractAdUnit, IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { GDPREventHandler } from 'Ads/EventHandlers/GDPREventHandler';
import { IAdsApi } from 'Ads/IAds';
import { AdUnitStyle } from 'Ads/Models/AdUnitStyle';
import { Campaign } from 'Ads/Models/Campaign';
import { IStoreHandler, IStoreHandlerDownloadParameters } from 'Ads/EventHandlers/StoreHandlers/StoreHandler';
import { IEndScreenHandler } from 'Ads/Views/EndScreen';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { StoreName } from 'Performance/Models/PerformanceCampaign';

export interface IEndScreenDownloadParameters {
    clickAttributionUrl: string | undefined;
    clickAttributionUrlFollowsRedirects: boolean | undefined;
    bypassAppSheet: boolean | undefined;
    appStoreId: string | undefined;
    store: StoreName | undefined;
    appDownloadUrl?: string | undefined;
    adUnitStyle?: AdUnitStyle;
}

export abstract class EndScreenEventHandler<T extends Campaign, T2 extends AbstractAdUnit> extends GDPREventHandler implements IEndScreenHandler {

    protected _platform: Platform;
    protected _core: ICoreApi;
    protected _ads: IAdsApi;
    protected _adUnit: T2;
    protected _campaign: T;

    private _storeHandler: IStoreHandler;

    constructor(adUnit: T2, parameters: IAdUnitParameters<T>, storeHandler: IStoreHandler) {
        super(parameters.privacyManager, parameters.coreConfig, parameters.adsConfig);
        this._adUnit = adUnit;
        this._storeHandler = storeHandler;
    }

    public onEndScreenDownload(parameters: IStoreHandlerDownloadParameters): void {
        this._storeHandler.onDownload(parameters);
    }

    public onEndScreenClose(): void {
        this._adUnit.hide();
    }

    public abstract onKeyEvent(keyCode: number): void;

}
