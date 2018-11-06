import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { ICometTrackingUrlEvents } from 'Performance/Parsers/CometCampaignParser';
import { AbstractVideoOverlay } from 'Ads/Views/AbstractVideoOverlay';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { OverlayEventHandler } from 'Ads/EventHandlers/OverlayEventHandler';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { IAppStoreDownloadHelper, IDownloadParameters } from 'Ads/Utilities/AppStoreDownloadHelper';
import { VideoAdUnit, IVideoAdUnitParameters } from 'Ads/AdUnits/VideoAdUnit';
import { Campaign } from 'Ads/Models/Campaign';
import { AdUnitStyle } from 'Ads/Models/AdUnitStyle';

export interface IVideoOverlayDownloadParameters extends IDownloadParameters {
    videoProgress: number;
}

export class OverlayEventHandlerWithDownload<T extends Campaign> extends OverlayEventHandler<T> {

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
        this._downloadHelper.download(parameters);

        // TODO: Can this be here or before onDonwload, is event order ok?
        if(this._campaign instanceof PerformanceCampaign) {
            this._thirdPartyEventManager.sendPerformanceTrackingEvent(this._campaign, ICometTrackingUrlEvents.CLICK);
        }

        //TODO: is there need to skip these if app store url or id is missing?
        this.onOverlaySkip(parameters.videoProgress);
        this.setCallButtonEnabled(true);
    }

    private setCallButtonEnabled(enabled: boolean): void {
        if (this._overlay) {
            this._overlay.setCallButtonEnabled(enabled);
        }
    }
}
