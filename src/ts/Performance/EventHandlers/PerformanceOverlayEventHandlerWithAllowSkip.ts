import { OverlayEventHandler } from 'Ads/EventHandlers/OverlayEventHandler';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { ICometTrackingUrlEvents } from 'Performance/Parsers/CometCampaignParser';
import { PerformanceOverlayEventHandler } from 'Performance/EventHandlers/PerformanceOverlayEventHandler';
import { ABGroup } from 'Core/Models/ABGroup';
import { Orientation, ViewConfiguration } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { IOperativeEventParams } from 'Ads/Managers/OperativeEventManager';
import { CampaignAssetInfo } from 'Ads/Utilities/CampaignAssetInfo';
import { Campaign } from 'Ads/Models/Campaign';
import { Video } from 'Ads/Models/Assets/Video';
import { WebViewError } from 'Core/Errors/WebViewError';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { FinishState } from 'Core/Constants/FinishState';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { VideoState } from 'Ads/AdUnits/VideoAdUnit';

export class PerformanceOverlayEventHandlerWithAllowSkip extends PerformanceOverlayEventHandler {

    private _forceOrientation: Orientation;
    private _video: Video;

    constructor(nativeBridge: NativeBridge, adUnit: PerformanceAdUnit, parameters: IPerformanceAdUnitParameters) {
        super(nativeBridge, adUnit, parameters);

        this._forceOrientation = parameters.forceOrientation;
        this._video = parameters.video;
    }

    private getOperativeEventParams(): IOperativeEventParams {
        return {
            placement: this._placement,
            videoOrientation: this.getVideoOrientation(),
            adUnitStyle: this._adUnitStyle,
            asset: this._video
        };
    }

    private sendSkipEventToKafka(videoPosition: number) {
        const videoDuration = this._video.getDuration();
        const currentSession = this._campaign.getSession();

        const kafkaObject: any = {};
        kafkaObject.type = 'rewarded_video_early_skip';
        kafkaObject.auctionId = currentSession.getId();
        kafkaObject.number1 = videoDuration / 1000;
        kafkaObject.number2 = videoPosition / 1000;
        kafkaObject.number3 = videoPosition / videoDuration;

        HttpKafka.sendEvent('ads.sdk2.events.aui.experiments.json', KafkaCommonObjectType.ANONYMOUS, kafkaObject);
    }

    // This is used by the Android backbutton when skipping the video
    protected canSkipVideo(): boolean {
        if (!this._adUnit.isShowing() || !this._adUnit.canPlayVideo()) {
            return false;
        }

        const position = this._video.getPosition();

        // Use the same value as in the VideoAdUnit.ts prepareOverlay()
        const allowSkipInMs = 5000;
        return position >= allowSkipInMs;
    }

    public onOverlaySkip(position: number): void {
        this._nativeBridge.VideoPlayer.pause();
        this.sendSkipEventToKafka(position);

        const params = this.getOperativeEventParams();
        this._operativeEventManager.sendThirdQuartile(params);

        // Needed for the view attribution
        this._operativeEventManager.sendView(params);

        this._adUnit.setVideoState(VideoState.COMPLETED);
        this._adUnit.setFinishState(FinishState.COMPLETED);

        this._adUnit.getContainer().reconfigure(ViewConfiguration.ENDSCREEN);

        const overlay = this._adUnit.getOverlay();
        if (overlay) {
            overlay.hide();
        }

        this._adUnit.onFinish.trigger();

        const endScreen = this._performanceAdUnit.getEndScreen();
        if (endScreen) {
            endScreen.show();
        }

        this._performanceAdUnit.onFinish.trigger();
        this._thirdPartyEventManager.sendPerformanceTrackingEvent(this._campaign, ICometTrackingUrlEvents.THIRD_QUARTILE);
        this._thirdPartyEventManager.sendPerformanceTrackingEvent(this._campaign, ICometTrackingUrlEvents.COMPLETE);
    }
}
