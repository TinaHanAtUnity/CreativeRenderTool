import { IVideoAdUnitParameters, VideoAdUnit } from 'Ads/AdUnits/VideoAdUnit';
import { OverlayEventHandler } from 'Ads/EventHandlers/OverlayEventHandler';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { AdUnitStyle } from 'Ads/Models/AdUnitStyle';
import { Campaign } from 'Ads/Models/Campaign';
import { IStoreHandler, IStoreHandlerDownloadParameters } from 'Ads/EventHandlers/StoreHandlers/StoreHandler';
import { AbstractVideoOverlay } from 'Ads/Views/AbstractVideoOverlay';
import { IOperativeEventParams } from 'Ads/Managers/OperativeEventManager';

export interface IVideoOverlayDownloadParameters extends IStoreHandlerDownloadParameters {
    videoProgress: number;
    skipEnabled: boolean;
}

export class OverlayEventHandlerWithDownloadSupport<T extends Campaign> extends OverlayEventHandler<T> {

    private _storeHandler: IStoreHandler;
    private _overlay: AbstractVideoOverlay | undefined;
    protected _thirdPartyEventManager: ThirdPartyEventManager;

    constructor(adUnit: VideoAdUnit<T>, parameters: IVideoAdUnitParameters<T>, storeHandler: IStoreHandler, adUnitStyle?: AdUnitStyle) {
        super(adUnit, parameters, adUnitStyle);
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
        this._overlay = this._adUnit.getOverlay();
        this._storeHandler = storeHandler;

    }

    public onOverlayDownload(parameters: IVideoOverlayDownloadParameters): void {
        this.setCallButtonEnabled(false);
        this._storeHandler.onDownload(parameters);
        if (parameters.skipEnabled) {
            this.onOverlaySkip(parameters.videoProgress);
        } else {
            // This is for the install now button test in rewarded ad video overlay
            this._operativeEventManager.sendThirdQuartile(this.getOperativeEventParams(parameters));
        }
        this.setCallButtonEnabled(true);
    }

    private setCallButtonEnabled(enabled: boolean): void {
        if (this._overlay) {
            this._overlay.setCallButtonEnabled(enabled);
        }
    }

    private getOperativeEventParams(parameters: IVideoOverlayDownloadParameters): IOperativeEventParams {
        return {
            placement: this._placement,
            videoOrientation: this.getVideoOrientation(),
            adUnitStyle: parameters.adUnitStyle,
            asset: this._adUnit.getVideo()
        };
    }
}
