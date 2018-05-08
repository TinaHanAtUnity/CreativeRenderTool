import { ViewConfiguration } from 'AdUnits/Containers/AdUnitContainer';
import { Campaign } from 'Models/Campaign';
import { UnityAdsError } from 'Constants/UnityAdsError';
import { FinishState } from 'Constants/FinishState';
import { NativeBridge } from 'Native/NativeBridge';
import { Diagnostics } from 'Utilities/Diagnostics';
import { Placement } from 'Models/Placement';
import { VideoAdUnit, VideoState } from 'AdUnits/VideoAdUnit';
import { AdUnitStyle } from 'Models/AdUnitStyle';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { Configuration } from 'Models/Configuration';
import { Video } from 'Models/Assets/Video';
import { ComScoreTrackingService } from 'Utilities/ComScoreTrackingService';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { ClientInfo } from 'Models/ClientInfo';

export interface IVideoEventHandlerParams<T extends VideoAdUnit = VideoAdUnit, T2 extends Campaign = Campaign, T3 extends OperativeEventManager = OperativeEventManager> {
    nativeBrige: NativeBridge;
    adUnit: T;
    campaign: T2;
    operativeEventManager: T3;
    thirdPartyEventManager: ThirdPartyEventManager;
    comScoreTrackingService: ComScoreTrackingService;
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
