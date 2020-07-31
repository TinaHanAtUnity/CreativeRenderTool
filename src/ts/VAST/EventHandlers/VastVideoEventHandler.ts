import { IVideoEventHandlerParams } from 'Ads/EventHandlers/BaseVideoEventHandler';
import { VideoEventHandler } from 'Ads/EventHandlers/VideoEventHandler';
import { EventType } from 'Ads/Models/Session';
import { MoatViewabilityService } from 'Ads/Utilities/MoatViewabilityService';
import { TestEnvironment } from 'Core/Utilities/TestEnvironment';
import { VastAdUnit } from 'VAST/AdUnits/VastAdUnit';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';
import { SDKMetrics, VastMetric, VideoLengthMetric } from 'Ads/Utilities/SDKMetrics';
import { VastOpenMeasurementController } from 'Ads/Views/OpenMeasurement/VastOpenMeasurementController';
import { OpenMeasurementUtilities } from 'Ads/Views/OpenMeasurement/OpenMeasurementUtilities';
import { VideoPlayerState, VideoPosition } from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';

export class VastVideoEventHandler extends VideoEventHandler {

    private _vastAdUnit: VastAdUnit;
    private _vastCampaign: VastCampaign;
    private _om?: VastOpenMeasurementController;
    private _omStartCalled = false;
    private _userStateChangeHasBeenSent = false;

    constructor(params: IVideoEventHandlerParams<VastAdUnit, VastCampaign>) {
        super(params);
        this._vastAdUnit = params.adUnit;
        this._vastCampaign = params.campaign;
        this._om = this._vastAdUnit.getOpenMeasurementController();
    }

    public onProgress(progress: number): void {
        super.onProgress(progress);

        const moat = MoatViewabilityService.getMoat();
        if (moat) {
            const events = this._vastAdUnit.getEvents();
            const event = events.shift();
            if (event) {
                if (progress / this._vastCampaign.getVideo().getDuration() >= event[0]) {
                    moat.triggerVideoEvent(event[1], this._vastAdUnit.getVolume());
                } else {
                    events.unshift(event);
                }
                this._vastAdUnit.setEvents(events);
            }
        }
    }

    public onCompleted(url: string): void {
        super.onCompleted(url);

        if (!this._vastAdUnit.hasImpressionOccurred()) {
            SDKMetrics.reportMetricEvent(VastMetric.VastVideoImpressionFailed);
        }

        const session = this._vastCampaign.getSession();

        const moat = MoatViewabilityService.getMoat();
        if (moat) {
            moat.completed(this._vastAdUnit.getVolume());
        }

        if (session) {
            if (session.getEventSent(EventType.VAST_COMPLETE)) {
                return;
            }
            session.setEventSent(EventType.VAST_COMPLETE);
        }

        const endScreen = this._vastAdUnit.getEndScreen();
        if (endScreen && this._vastAdUnit.hasImpressionOccurred()) {
            endScreen.show();
        } else {
            this._vastAdUnit.hide();
        }

        if (this._om) {
            this._om.completed();
            this._om.sessionFinish();
        }
    }

    public onPrepared(url: string, duration: number, width: number, height: number): void {
        super.onPrepared(url, duration, width, height);

        const overlay = this._adUnit.getOverlay();
        if (overlay && this._vastAdUnit.getVideoClickThroughURL()) {
            overlay.setCallButtonVisible(true);
            overlay.setFadeEnabled(false);

            if (TestEnvironment.get('debugOverlayEnabled')) {
                overlay.setDebugMessage('Programmatic Ad');
            }
        }

        const moat = MoatViewabilityService.getMoat();
        if (moat) {
            moat.init(MoatViewabilityService.getMoatIds(), duration / 1000, url, MoatViewabilityService.getMoatData(), this._vastAdUnit.getVolume());
        }

        const vastAd = this._vastCampaign.getVast().getAd();
        if (vastAd) {
            const reportedDuration = vastAd.getDuration();
            if (reportedDuration) {
                const lengthDiff = (duration / 1000) - reportedDuration;
                if (lengthDiff <= -1) {
                    SDKMetrics.reportTimingEvent(VideoLengthMetric.LengthOverreported, lengthDiff);
                } else if (lengthDiff >= 1) {
                    SDKMetrics.reportTimingEvent(VideoLengthMetric.LengthUnderreported, lengthDiff);
                }
            }
        }

        if (this._om && !this._omStartCalled) {
            this._adUnit.getVideoViewRectangle().then((rect) => {
                if (this._om) {
                    const view = OpenMeasurementUtilities.createRectangle(rect[0], rect[1], rect[2], rect[3]);
                    this._om.getOMAdViewBuilder().setVideoView(view);
                    this._om.sessionStart();
                    this._omStartCalled = true;
                }
            }).catch((e) => {
                if (this._om) {
                    this._om.sessionStart();
                    this._omStartCalled = true;
                }
            });
        }
    }

    public onPlay(url: string): void {
        super.onPlay(url);

        // was onVideoStart
        const session = this._vastCampaign.getSession();

        if (this._om) {
            this._om.resume();
            this._om.setDeviceVolume(this._vastAdUnit.getVolume());
            this._om.loaded({
                skippable: this._placement.allowSkip(),
                skipOffset: this._placement.allowSkipInSeconds(),
                autoplay: true, // Always autoplay for video
                position: VideoPosition.STANDALONE // Always standalone video
            });
            this._om.start(this._vastCampaign.getVideo().getDuration());
            if (!this._userStateChangeHasBeenSent) {
                this._om.playerStateChanged(VideoPlayerState.FULLSCREEN);
                this._userStateChangeHasBeenSent = true;
            }
        }

        const moat = MoatViewabilityService.getMoat();
        if (moat) {
            moat.play(this._vastAdUnit.getVolume());
        }

        if (session) {
            if (session.getEventSent(EventType.IMPRESSION)) {
                return;
            }
            session.setEventSent(EventType.IMPRESSION);
        }

        this.sendThirdPartyVastImpressionEvent();
        this.sendTrackingEvent(TrackingEvent.CREATIVE_VIEW);
        this.sendTrackingEvent(TrackingEvent.START);
        this.sendTrackingEvent(TrackingEvent.IMPRESSION);
    }

    public onPause(url: string): void {
        super.onPause(url);

        const moat = MoatViewabilityService.getMoat();
        if (moat) {
            moat.pause(this._vastAdUnit.getVolume());
        }

        if (this._om) {
            this._om.pause();
        }
    }

    public onStop(url: string): void {
        super.onStop(url);

        const moat = MoatViewabilityService.getMoat();
        if (moat) {
            moat.stop(this._vastAdUnit.getVolume());
        }
    }

    public onVolumeChange(volume: number, maxVolume: number) {
        const moat = MoatViewabilityService.getMoat();
        if (moat) {
            this._vastAdUnit.setVolume(volume / maxVolume);
            moat.volumeChange(this._vastAdUnit.getVolume());
        }

        if (this._om) {
            this._vastAdUnit.setVolume(volume / maxVolume);
            this._om.setDeviceVolume(this._vastAdUnit.getVolume());
            if (this._vastAdUnit.getVideoPlayerMuted()) {
                this._om.volumeChange(0);
            } else {
                this._om.volumeChange(1);
            }
        }
    }

    protected handleFirstQuartileEvent(progress: number): void {
        super.handleFirstQuartileEvent(progress);
        if (this._om) {
            this._om.sendFirstQuartile();
        }
        this.sendTrackingEvent(TrackingEvent.FIRST_QUARTILE);
    }

    protected handleMidPointEvent(progress: number): void {
        super.handleMidPointEvent(progress);
        if (this._om) {
            this._om.sendMidpoint();
        }
        this.sendTrackingEvent(TrackingEvent.MIDPOINT);
    }

    protected handleThirdQuartileEvent(progress: number): void {
        super.handleThirdQuartileEvent(progress);
        if (this._om) {
            this._om.sendThirdQuartile();
        }
        this.sendTrackingEvent(TrackingEvent.THIRD_QUARTILE);
    }

    protected handleCompleteEvent(url: string): void {
        super.handleCompleteEvent(url);
        this.sendTrackingEvent(TrackingEvent.COMPLETE);
    }

    private sendThirdPartyVastImpressionEvent(): void {
        const impressionUrls = this._vastCampaign.getImpressionUrls();
        if (impressionUrls) {
            for (const impressionUrl of impressionUrls) {
                this.sendThirdPartyEvent('vast impression', impressionUrl);
            }
        }
        this._vastAdUnit.setImpressionOccurred();
    }

    private sendTrackingEvent(eventName: TrackingEvent): void {
        const trackingEventUrls = this._vastCampaign.getVast().getTrackingEventUrls(eventName);
        if (trackingEventUrls) {
            for (const url of trackingEventUrls) {
                this.sendThirdPartyEvent(`vast ${eventName}`, url);
            }
        }
    }

    private sendThirdPartyEvent(event: string, url: string): void {
        this._thirdPartyEventManager.sendWithGet(event, this._campaign.getSession().getId(), url, this._vastCampaign.getUseWebViewUserAgentForTracking());
    }
}
