import { OverlayEventHandler } from 'Ads/EventHandlers/OverlayEventHandler';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { ICometTrackingUrlEvents } from 'Performance/Parsers/CometCampaignParser';
import { PerformanceOverlayEventHandler } from 'Performance/EventHandlers/PerformanceOverlayEventHandler';
import { ABGroup } from 'Core/Models/ABGroup';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { IOperativeEventParams } from 'Ads/Managers/OperativeEventManager';
import { CampaignAssetInfo } from 'Ads/Utilities/CampaignAssetInfo';
import { Campaign } from 'Ads/Models/Campaign';
import { Video } from 'Ads/Models/Assets/Video';
import { WebViewError } from 'Core/Errors/WebViewError';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { FinishState } from 'Core/Constants/FinishState';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';

export class PerformanceOverlayEventHandlerWithAllowSkip extends PerformanceOverlayEventHandler {

    private _forceOrientation: Orientation;

    constructor(nativeBridge: NativeBridge, adUnit: PerformanceAdUnit, parameters: IPerformanceAdUnitParameters) {
        super(nativeBridge, adUnit, parameters);

        this._forceOrientation = parameters.forceOrientation;
    }

    private getOperativeEventParams(): IOperativeEventParams {
        const video = this.getVideo();

        return {
            placement: this._placement,
            videoOrientation: this.getVideoOrientation(),
            adUnitStyle: this._adUnitStyle,
            asset: video
        };
    }

    private getVideo(): Video {
        const video = CampaignAssetInfo.getOrientedVideo(this._campaign, this._forceOrientation);
        if (!video) {
            // TODO: What's the best way to handle this? (Copied from AdUnitFactory.ts)
            throw new WebViewError('Unable to select an oriented video');
        }

        return video;
    }

    private sendSkipEventToKafka() {
        const video = this.getVideo();
        const videoDuration = video.getDuration();
        const videoPosition = video.getPosition();
        const currentSession = this._campaign.getSession();
        const kafkaObject: any = {};
        kafkaObject.type = 'rewarded_video_early_skip';
        kafkaObject.auctionId = currentSession.getId();
        kafkaObject.number1 = videoDuration / 1000;
        kafkaObject.number2 = videoPosition / 1000;
        kafkaObject.number3 = videoPosition / videoDuration;

        HttpKafka.sendEvent('ads.sdk2.events.aui.experiments.json', KafkaCommonObjectType.ANONYMOUS, kafkaObject);
    }

    protected canSkipVideo(): boolean {
        // TODO: Is there a lot of non-rewarded videos that have no skip rule and does it matter if we override it?
        if (!this._adUnit.isShowing() || !this._adUnit.canPlayVideo()) {
            return false;
        }

        const position = this._adUnit.getVideo().getPosition();
        const allowSkipInMs = this._placement.allowSkipInSeconds() * 1000;
        return position >= allowSkipInMs;
    }

    public onOverlaySkip(position: number): void {
        // TODO: Is it ok that in OverlayEventHandler operativeEventManager.sendSkip is called and in PerformanceOverlayEventHandler
        // thirdPartyEventManager.sendPerformanceTrackingEvent is called with ICometTrackingUrlEvents.SKIP?
        super.onOverlaySkip(position);
        // According to our documentation checking finish state is the correct way to decide do we give a reward or not. Are developers
        // using also some other ways to do this, for example checking if the video did play fully or can they access that information?
        this._adUnit.setFinishState(FinishState.COMPLETED);
        this.sendSkipEventToKafka();

        /* First idea was that we need to send the third quartile event but most likely not needed
        TODO: Confirm is any of this needed
        const params = this.getOperativeEventParams();
        this._nativeBridge.Sdk.logInfo('Send third quartile and view events: ' + JSON.stringify(params));
        this._operativeEventManager.sendThirdQuartile(params);
        this._operativeEventManager.sendView(params);
        */
    }
}
