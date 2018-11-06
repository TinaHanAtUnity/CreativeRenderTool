import { AbstractAdUnit, IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { GDPREventHandler } from 'Ads/EventHandlers/GDPREventHandler';
import { AdUnitStyle } from 'Ads/Models/AdUnitStyle';
import { Campaign } from 'Ads/Models/Campaign';
import { IEndScreenHandler } from 'Ads/Views/EndScreen';
import { StoreName } from 'Performance/Models/PerformanceCampaign';
import { IAppStoreDownloadHelper, IDownloadParameters } from 'Ads/Utilities/AppStoreDownloadHelper';

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

    protected _adUnit: T2;
    protected _campaign: T;

    private _downloadHelper: IAppStoreDownloadHelper;

    constructor(adUnit: T2, parameters: IAdUnitParameters<T>, downloadHelper: IAppStoreDownloadHelper) {
        super(parameters.gdprManager, parameters.coreConfig, parameters.adsConfig);
        this._adUnit = adUnit;
        this._downloadHelper = downloadHelper;
    }

    public onEndScreenDownload(parameters: IDownloadParameters): void {
        this._downloadHelper.download(parameters);
    }

    public onEndScreenClose(): void {
        this._adUnit.hide();
    }

    public abstract onKeyEvent(keyCode: number): void;
}
