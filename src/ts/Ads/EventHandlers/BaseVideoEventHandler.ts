import { ViewConfiguration } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { Campaign } from 'Ads/Models/Campaign';
import { UnityAdsError } from 'Common/Constants/UnityAdsError';
import { FinishState } from 'Common/Constants/FinishState';
import { NativeBridge } from 'Common/Native/NativeBridge';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { Placement } from 'Ads/Models/Placement';
import { VideoAdUnit, VideoState } from 'Ads/AdUnits/VideoAdUnit';
import { AdUnitStyle } from 'Ads/Models/AdUnitStyle';
import { OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { Configuration } from 'Core/Models/Configuration';
import { Video } from 'Ads/Models/Assets/Video';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { ClientInfo } from 'Core/Models/ClientInfo';

export interface IVideoEventHandlerParams<T extends VideoAdUnit = VideoAdUnit, T2 extends Campaign = Campaign, T3 extends OperativeEventManager = OperativeEventManager> {
    nativeBrige: NativeBridge;
    adUnit: T;
    campaign: T2;
    operativeEventManager: T3;
    thirdPartyEventManager: ThirdPartyEventManager;
    configuration: Configuration;
    placement: Placement;
    video: Video;
    adUnitStyle?: AdUnitStyle;
    clientInfo: ClientInfo;
}

export abstract class BaseVideoEventHandler {

    protected _nativeBridge: NativeBridge;
    protected _adUnit: VideoAdUnit;
    protected _campaign: Campaign;
    protected _video: Video;

    constructor(params: IVideoEventHandlerParams) {
        this._nativeBridge = params.nativeBrige;
        this._adUnit = params.adUnit;
        this._campaign = params.campaign;
        this._video = params.video;
    }

    protected updateViewsOnVideoError() {
        this._adUnit.getContainer().reconfigure(ViewConfiguration.ENDSCREEN);
    }

    protected afterVideoCompleted() {
        this._adUnit.getContainer().reconfigure(ViewConfiguration.ENDSCREEN);

        const overlay = this._adUnit.getOverlay();
        if(overlay) {
            overlay.hide();
        }
        this._adUnit.onFinish.trigger();
    }

    protected handleVideoError(errorType?: string, errorData?: any) {
        if(this._adUnit.getVideoState() !== VideoState.ERRORED) {
            const previousState = this._adUnit.getVideoState();
            this._adUnit.setVideoState(VideoState.ERRORED);

            if(errorType && errorData) {
                Diagnostics.trigger(errorType, errorData, this._campaign.getSession());
            }

            this._adUnit.setFinishState(FinishState.ERROR);

            this.updateViewsOnVideoError();

            const overlay = this._adUnit.getOverlay();
            if(overlay) {
                overlay.hide();
            }

            this._adUnit.onError.trigger();
            this._adUnit.onFinish.trigger();

            if(previousState === VideoState.NOT_READY || previousState === VideoState.PREPARING) {
                this._adUnit.hide();
                this._nativeBridge.Listener.sendErrorEvent(UnityAdsError[UnityAdsError.VIDEO_PLAYER_ERROR], 'Video player prepare error');
            } else {
                this._nativeBridge.Listener.sendErrorEvent(UnityAdsError[UnityAdsError.VIDEO_PLAYER_ERROR], 'Video player error');
            }
        }
    }

    protected getVideoOrientation(): string | undefined {
        return undefined;
    }
}
