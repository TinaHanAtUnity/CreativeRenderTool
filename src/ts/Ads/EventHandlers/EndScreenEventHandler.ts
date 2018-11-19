import { AbstractAdUnit, IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { GDPREventHandler } from 'Ads/EventHandlers/GDPREventHandler';
import { IAdsApi } from 'Ads/IAds';
import { AdUnitStyle } from 'Ads/Models/AdUnitStyle';
import { Campaign } from 'Ads/Models/Campaign';
import { IAppStoreDownloadHelper, IAppStoreDownloadParameters } from 'Ads/Utilities/AppStoreDownloadHelper';
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

    private _downloadHelper: IAppStoreDownloadHelper;

    constructor(adUnit: T2, parameters: IAdUnitParameters<T>, downloadHelper: IAppStoreDownloadHelper) {
        super(parameters.gdprManager, parameters.coreConfig, parameters.adsConfig);
        this._adUnit = adUnit;
        this._downloadHelper = downloadHelper;
    }

    public onEndScreenDownload(parameters: IAppStoreDownloadParameters): void {
        this._downloadHelper.onDownload(parameters);
    }

    public onEndScreenClose(): void {
        this._adUnit.hide();
    }

    public abstract onKeyEvent(keyCode: number): void;
}
