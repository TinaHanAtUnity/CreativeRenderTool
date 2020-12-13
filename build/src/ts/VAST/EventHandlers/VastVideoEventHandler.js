import { VideoEventHandler } from 'Ads/EventHandlers/VideoEventHandler';
import { EventType } from 'Ads/Models/Session';
import { MoatViewabilityService } from 'Ads/Utilities/MoatViewabilityService';
import { TestEnvironment } from 'Core/Utilities/TestEnvironment';
import { TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';
import { SDKMetrics, VastMetric, VideoLengthMetric } from 'Ads/Utilities/SDKMetrics';
import { OpenMeasurementUtilities } from 'Ads/Views/OpenMeasurement/OpenMeasurementUtilities';
import { VideoPlayerState, VideoPosition } from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';
import { Platform } from 'Core/Constants/Platform';
export class VastVideoEventHandler extends VideoEventHandler {
    constructor(params) {
        super(params);
        this._omStartCalled = false;
        this._userStateChangeHasBeenSent = false;
        this._vastAdUnit = params.adUnit;
        this._vastCampaign = params.campaign;
        this._om = this._vastAdUnit.getOpenMeasurementController();
    }
    onProgress(progress) {
        super.onProgress(progress);
        const moat = MoatViewabilityService.getMoat();
        if (moat) {
            const events = this._vastAdUnit.getEvents();
            const event = events.shift();
            if (event) {
                if (progress / this._vastCampaign.getVideo().getDuration() >= event[0]) {
                    moat.triggerVideoEvent(event[1], this._vastAdUnit.getVolume());
                }
                else {
                    events.unshift(event);
                }
                this._vastAdUnit.setEvents(events);
            }
        }
    }
    onCompleted(url) {
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
        }
        else {
            this._vastAdUnit.hide();
        }
        if (this._om) {
            this._om.completed();
            this._om.sessionFinish();
        }
    }
    onPrepared(url, duration, width, height) {
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
                }
                else if (lengthDiff >= 1) {
                    SDKMetrics.reportTimingEvent(VideoLengthMetric.LengthUnderreported, lengthDiff);
                }
            }
        }
        if (this._om && !this._omStartCalled) {
            this._adUnit.getVideoViewRectangle().then((rect) => {
                if (this._om) {
                    const view = OpenMeasurementUtilities.createRectangle(rect[0], rect[1], rect[2], rect[3]);
                    if (this._platform === Platform.ANDROID) {
                        view.x = OpenMeasurementUtilities.pxToDp(view.x, this._vastAdUnit.getDeviceInfo());
                        view.y = OpenMeasurementUtilities.pxToDp(view.y, this._vastAdUnit.getDeviceInfo());
                        view.width = OpenMeasurementUtilities.pxToDp(view.width, this._vastAdUnit.getDeviceInfo());
                        view.height = OpenMeasurementUtilities.pxToDp(view.height, this._vastAdUnit.getDeviceInfo());
                    }
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
    onPlay(url) {
        super.onPlay(url);
        // was onVideoStart
        const session = this._vastCampaign.getSession();
        if (this._om) {
            this._om.resume();
            this._om.setDeviceVolume(this._vastAdUnit.getVolume());
            this._om.loaded({
                skippable: this._placement.allowSkip(),
                skipOffset: this._placement.allowSkipInSeconds(),
                autoplay: true,
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
    onPause(url) {
        super.onPause(url);
        const moat = MoatViewabilityService.getMoat();
        if (moat) {
            moat.pause(this._vastAdUnit.getVolume());
        }
        if (this._om) {
            this._om.pause();
        }
    }
    onStop(url) {
        super.onStop(url);
        const moat = MoatViewabilityService.getMoat();
        if (moat) {
            moat.stop(this._vastAdUnit.getVolume());
        }
    }
    onVolumeChange(volume, maxVolume) {
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
            }
            else {
                this._om.volumeChange(1);
            }
        }
    }
    handleFirstQuartileEvent(progress) {
        super.handleFirstQuartileEvent(progress);
        if (this._om) {
            this._om.sendFirstQuartile();
        }
        this.sendTrackingEvent(TrackingEvent.FIRST_QUARTILE);
    }
    handleMidPointEvent(progress) {
        super.handleMidPointEvent(progress);
        if (this._om) {
            this._om.sendMidpoint();
        }
        this.sendTrackingEvent(TrackingEvent.MIDPOINT);
    }
    handleThirdQuartileEvent(progress) {
        super.handleThirdQuartileEvent(progress);
        if (this._om) {
            this._om.sendThirdQuartile();
        }
        this.sendTrackingEvent(TrackingEvent.THIRD_QUARTILE);
    }
    handleCompleteEvent(url) {
        super.handleCompleteEvent(url);
        this.sendTrackingEvent(TrackingEvent.COMPLETE);
    }
    sendThirdPartyVastImpressionEvent() {
        const impressionUrls = this._vastCampaign.getImpressionUrls();
        if (impressionUrls) {
            for (const impressionUrl of impressionUrls) {
                this.sendThirdPartyEvent('vast impression', impressionUrl);
            }
        }
        this._vastAdUnit.setImpressionOccurred();
    }
    sendTrackingEvent(eventName) {
        const trackingEventUrls = this._vastCampaign.getVast().getTrackingEventUrls(eventName);
        if (trackingEventUrls) {
            for (const url of trackingEventUrls) {
                this.sendThirdPartyEvent(`vast ${eventName}`, url);
            }
        }
    }
    sendThirdPartyEvent(event, url) {
        this._thirdPartyEventManager.sendWithGet(event, this._campaign.getSession().getId(), url, this._vastCampaign.getUseWebViewUserAgentForTracking());
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdFZpZGVvRXZlbnRIYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL1ZBU1QvRXZlbnRIYW5kbGVycy9WYXN0VmlkZW9FdmVudEhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFDeEUsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBQzlFLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUdqRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFDcEUsT0FBTyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUVyRixPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSxvREFBb0QsQ0FBQztBQUM5RixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsYUFBYSxFQUFFLE1BQU0sb0RBQW9ELENBQUM7QUFDckcsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBR25ELE1BQU0sT0FBTyxxQkFBc0IsU0FBUSxpQkFBaUI7SUFReEQsWUFBWSxNQUEwRDtRQUNsRSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUFKVixtQkFBYyxHQUFHLEtBQUssQ0FBQztRQUN2QixnQ0FBMkIsR0FBRyxLQUFLLENBQUM7UUFJeEMsSUFBSSxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxhQUFhLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztRQUNyQyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsNEJBQTRCLEVBQUUsQ0FBQztJQUMvRCxDQUFDO0lBRU0sVUFBVSxDQUFDLFFBQWdCO1FBQzlCLEtBQUssQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFM0IsTUFBTSxJQUFJLEdBQUcsc0JBQXNCLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDOUMsSUFBSSxJQUFJLEVBQUU7WUFDTixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQzVDLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUM3QixJQUFJLEtBQUssRUFBRTtnQkFDUCxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsRUFBRSxDQUFDLFdBQVcsRUFBRSxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRTtvQkFDcEUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7aUJBQ2xFO3FCQUFNO29CQUNILE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7aUJBQ3pCO2dCQUNELElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQ3RDO1NBQ0o7SUFDTCxDQUFDO0lBRU0sV0FBVyxDQUFDLEdBQVc7UUFDMUIsS0FBSyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUV2QixJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxxQkFBcUIsRUFBRSxFQUFFO1lBQzNDLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMseUJBQXlCLENBQUMsQ0FBQztTQUN0RTtRQUVELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxFQUFFLENBQUM7UUFFaEQsTUFBTSxJQUFJLEdBQUcsc0JBQXNCLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDOUMsSUFBSSxJQUFJLEVBQUU7WUFDTixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztTQUNoRDtRQUVELElBQUksT0FBTyxFQUFFO1lBQ1QsSUFBSSxPQUFPLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsRUFBRTtnQkFDL0MsT0FBTzthQUNWO1lBQ0QsT0FBTyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUM7U0FDakQ7UUFFRCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ2xELElBQUksU0FBUyxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMscUJBQXFCLEVBQUUsRUFBRTtZQUN2RCxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7U0FDcEI7YUFBTTtZQUNILElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7U0FDM0I7UUFFRCxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDVixJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ3JCLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLENBQUM7U0FDNUI7SUFDTCxDQUFDO0lBRU0sVUFBVSxDQUFDLEdBQVcsRUFBRSxRQUFnQixFQUFFLEtBQWEsRUFBRSxNQUFjO1FBQzFFLEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFFL0MsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUMxQyxJQUFJLE9BQU8sSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLHVCQUF1QixFQUFFLEVBQUU7WUFDdkQsT0FBTyxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ25DLE9BQU8sQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFOUIsSUFBSSxlQUFlLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLEVBQUU7Z0JBQzVDLE9BQU8sQ0FBQyxlQUFlLENBQUMsaUJBQWlCLENBQUMsQ0FBQzthQUM5QztTQUNKO1FBRUQsTUFBTSxJQUFJLEdBQUcsc0JBQXNCLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDOUMsSUFBSSxJQUFJLEVBQUU7WUFDTixJQUFJLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFVBQVUsRUFBRSxFQUFFLFFBQVEsR0FBRyxJQUFJLEVBQUUsR0FBRyxFQUFFLHNCQUFzQixDQUFDLFdBQVcsRUFBRSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztTQUM1STtRQUVELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDcEQsSUFBSSxNQUFNLEVBQUU7WUFDUixNQUFNLGdCQUFnQixHQUFHLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUM5QyxJQUFJLGdCQUFnQixFQUFFO2dCQUNsQixNQUFNLFVBQVUsR0FBRyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQztnQkFDeEQsSUFBSSxVQUFVLElBQUksQ0FBQyxDQUFDLEVBQUU7b0JBQ2xCLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxpQkFBaUIsQ0FBQyxrQkFBa0IsRUFBRSxVQUFVLENBQUMsQ0FBQztpQkFDbEY7cUJBQU0sSUFBSSxVQUFVLElBQUksQ0FBQyxFQUFFO29CQUN4QixVQUFVLENBQUMsaUJBQWlCLENBQUMsaUJBQWlCLENBQUMsbUJBQW1CLEVBQUUsVUFBVSxDQUFDLENBQUM7aUJBQ25GO2FBQ0o7U0FDSjtRQUVELElBQUksSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUU7WUFDbEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO2dCQUMvQyxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUU7b0JBQ1YsTUFBTSxJQUFJLEdBQUcsd0JBQXdCLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUMxRixJQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssUUFBUSxDQUFDLE9BQU8sRUFBRTt3QkFDckMsSUFBSSxDQUFDLENBQUMsR0FBRyx3QkFBd0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBc0IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDO3dCQUN2RyxJQUFJLENBQUMsQ0FBQyxHQUFHLHdCQUF3QixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFzQixJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUM7d0JBQ3ZHLElBQUksQ0FBQyxLQUFLLEdBQUcsd0JBQXdCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQXNCLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQzt3QkFDL0csSUFBSSxDQUFDLE1BQU0sR0FBRyx3QkFBd0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBc0IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDO3FCQUNwSDtvQkFDRCxJQUFJLENBQUMsR0FBRyxDQUFDLGtCQUFrQixFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNqRCxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxDQUFDO29CQUN4QixJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQztpQkFDOUI7WUFDTCxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtnQkFDWCxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUU7b0JBQ1YsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsQ0FBQztvQkFDeEIsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7aUJBQzlCO1lBQ0wsQ0FBQyxDQUFDLENBQUM7U0FDTjtJQUNMLENBQUM7SUFFTSxNQUFNLENBQUMsR0FBVztRQUNyQixLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRWxCLG1CQUFtQjtRQUNuQixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBRWhELElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUNWLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDbEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZELElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDO2dCQUNaLFNBQVMsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRTtnQkFDdEMsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsa0JBQWtCLEVBQUU7Z0JBQ2hELFFBQVEsRUFBRSxJQUFJO2dCQUNkLFFBQVEsRUFBRSxhQUFhLENBQUMsVUFBVSxDQUFDLDBCQUEwQjthQUNoRSxDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7WUFDNUQsSUFBSSxDQUFDLElBQUksQ0FBQywyQkFBMkIsRUFBRTtnQkFDbkMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDekQsSUFBSSxDQUFDLDJCQUEyQixHQUFHLElBQUksQ0FBQzthQUMzQztTQUNKO1FBRUQsTUFBTSxJQUFJLEdBQUcsc0JBQXNCLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDOUMsSUFBSSxJQUFJLEVBQUU7WUFDTixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztTQUMzQztRQUVELElBQUksT0FBTyxFQUFFO1lBQ1QsSUFBSSxPQUFPLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBRTtnQkFDNUMsT0FBTzthQUNWO1lBQ0QsT0FBTyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDOUM7UUFFRCxJQUFJLENBQUMsaUNBQWlDLEVBQUUsQ0FBQztRQUN6QyxJQUFJLENBQUMsaUJBQWlCLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3BELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDNUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNyRCxDQUFDO0lBRU0sT0FBTyxDQUFDLEdBQVc7UUFDdEIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVuQixNQUFNLElBQUksR0FBRyxzQkFBc0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUM5QyxJQUFJLElBQUksRUFBRTtZQUNOLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1NBQzVDO1FBRUQsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ1YsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztTQUNwQjtJQUNMLENBQUM7SUFFTSxNQUFNLENBQUMsR0FBVztRQUNyQixLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRWxCLE1BQU0sSUFBSSxHQUFHLHNCQUFzQixDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzlDLElBQUksSUFBSSxFQUFFO1lBQ04sSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7U0FDM0M7SUFDTCxDQUFDO0lBRU0sY0FBYyxDQUFDLE1BQWMsRUFBRSxTQUFpQjtRQUNuRCxNQUFNLElBQUksR0FBRyxzQkFBc0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUM5QyxJQUFJLElBQUksRUFBRTtZQUNOLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUMsQ0FBQztZQUMvQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztTQUNuRDtRQUVELElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUNWLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUMsQ0FBQztZQUMvQyxJQUFJLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7WUFDdkQsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLG1CQUFtQixFQUFFLEVBQUU7Z0JBQ3hDLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQzVCO2lCQUFNO2dCQUNILElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQzVCO1NBQ0o7SUFDTCxDQUFDO0lBRVMsd0JBQXdCLENBQUMsUUFBZ0I7UUFDL0MsS0FBSyxDQUFDLHdCQUF3QixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3pDLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUNWLElBQUksQ0FBQyxHQUFHLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztTQUNoQztRQUNELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDekQsQ0FBQztJQUVTLG1CQUFtQixDQUFDLFFBQWdCO1FBQzFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNwQyxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDVixJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxDQUFDO1NBQzNCO1FBQ0QsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBRVMsd0JBQXdCLENBQUMsUUFBZ0I7UUFDL0MsS0FBSyxDQUFDLHdCQUF3QixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3pDLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUNWLElBQUksQ0FBQyxHQUFHLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztTQUNoQztRQUNELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDekQsQ0FBQztJQUVTLG1CQUFtQixDQUFDLEdBQVc7UUFDckMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQy9CLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDbkQsQ0FBQztJQUVPLGlDQUFpQztRQUNyQyxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDOUQsSUFBSSxjQUFjLEVBQUU7WUFDaEIsS0FBSyxNQUFNLGFBQWEsSUFBSSxjQUFjLEVBQUU7Z0JBQ3hDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxpQkFBaUIsRUFBRSxhQUFhLENBQUMsQ0FBQzthQUM5RDtTQUNKO1FBQ0QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO0lBQzdDLENBQUM7SUFFTyxpQkFBaUIsQ0FBQyxTQUF3QjtRQUM5QyxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDdkYsSUFBSSxpQkFBaUIsRUFBRTtZQUNuQixLQUFLLE1BQU0sR0FBRyxJQUFJLGlCQUFpQixFQUFFO2dCQUNqQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsUUFBUSxTQUFTLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQzthQUN0RDtTQUNKO0lBQ0wsQ0FBQztJQUVPLG1CQUFtQixDQUFDLEtBQWEsRUFBRSxHQUFXO1FBQ2xELElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsaUNBQWlDLEVBQUUsQ0FBQyxDQUFDO0lBQ3RKLENBQUM7Q0FDSiJ9