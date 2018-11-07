import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { ICometTrackingUrlEvents } from 'Performance/Parsers/CometCampaignParser';
import { AbstractVideoOverlay } from 'Ads/Views/AbstractVideoOverlay';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { OverlayEventHandler } from 'Ads/EventHandlers/OverlayEventHandler';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { IAppStoreDownloadHelper, IAppStoreDownloadParameters } from 'Ads/Utilities/AppStoreDownloadHelper';
import { VideoAdUnit, IVideoAdUnitParameters } from 'Ads/AdUnits/VideoAdUnit';
import { Campaign } from 'Ads/Models/Campaign';
import { AdUnitStyle } from 'Ads/Models/AdUnitStyle';

export interface IVideoOverlayDownloadParameters extends IAppStoreDownloadParameters {
    videoProgress: number;
}

export class OverlayEventHandlerWithDownloadSupport<T extends Campaign> extends OverlayEventHandler<T> {

    private _downloadHelper: IAppStoreDownloadHelper;
    private _overlay: AbstractVideoOverlay | undefined;
    protected _thirdPartyEventManager: ThirdPartyEventManager;

    constructor(nativeBridge: NativeBridge, adUnit: VideoAdUnit<T>, parameters: IVideoAdUnitParameters<T>, downloadHelper: IAppStoreDownloadHelper, adUnitStyle?: AdUnitStyle) {
        super(nativeBridge, adUnit, parameters, adUnitStyle);
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
        this._overlay = this._adUnit.getOverlay();
        this._downloadHelper = downloadHelper;
    }

    public onOverlayDownload(parameters: IVideoOverlayDownloadParameters): void {
        this.setCallButtonEnabled(false);
        this._downloadHelper.onDownload(parameters);
        this.onOverlaySkip(parameters.videoProgress);
        this.setCallButtonEnabled(true);
    }

    private setCallButtonEnabled(enabled: boolean): void {
        if (this._overlay) {
            this._overlay.setCallButtonEnabled(enabled);
        }
    }
}
