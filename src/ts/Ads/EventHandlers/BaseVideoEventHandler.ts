import { ViewConfiguration } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { VideoAdUnit, VideoState } from 'Ads/AdUnits/VideoAdUnit';
import { OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { AdUnitStyle } from 'Ads/Models/AdUnitStyle';
import { Video } from 'Ads/Models/Assets/Video';
import { Campaign } from 'Ads/Models/Campaign';
import { Placement } from 'Ads/Models/Placement';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { FinishState } from 'Core/Constants/FinishState';
import { UnityAdsError } from 'Core/Constants/UnityAdsError';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { IAdsApi } from '../Ads';
import { ICoreApi } from '../../Core/Core';
import { Platform } from '../../Core/Constants/Platform';

export interface IVideoEventHandlerParams<T extends VideoAdUnit = VideoAdUnit, T2 extends Campaign = Campaign, T3 extends OperativeEventManager = OperativeEventManager> {
    nativeBrige: NativeBridge;
    adUnit: T;
    campaign: T2;
    operativeEventManager: T3;
    thirdPartyEventManager: ThirdPartyEventManager;
    platform: Platform;
    core: ICoreApi;
    ads: IAdsApi;
    coreConfig: CoreConfiguration;
    adsConfig: AdsConfiguration;
    placement: Placement;
    video: Video;
    adUnitStyle?: AdUnitStyle;
    clientInfo: ClientInfo;
}

export abstract class BaseVideoEventHandler {

    protected _platform: Platform;
    protected _core: ICoreApi;
    protected _ads: IAdsApi;
    protected _adUnit: VideoAdUnit;
    protected _campaign: Campaign;
    protected _video: Video;

    constructor(params: IVideoEventHandlerParams) {
        this._platform = params.platform;
        this._core = params.core;
        this._ads = params.ads;
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
                SessionDiagnostics.trigger(errorType, errorData, this._campaign.getSession());
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
                this._ads.Listener.sendErrorEvent(UnityAdsError[UnityAdsError.VIDEO_PLAYER_ERROR], 'Video player prepare error');
            } else {
                this._adUnit.onVideoError();
                this._ads.Listener.sendErrorEvent(UnityAdsError[UnityAdsError.VIDEO_PLAYER_ERROR], 'Video player error');
            }
        }
    }

    protected getVideoOrientation(): string | undefined {
        return undefined;
    }
}
