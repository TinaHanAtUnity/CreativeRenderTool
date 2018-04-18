import { VastAdUnit } from 'AdUnits/VastAdUnit';
import { EventType } from 'Models/Session';
import { ClientInfo } from 'Models/ClientInfo';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { MoatViewabilityService } from 'Utilities/MoatViewabilityService';
import { VideoEventHandler } from 'EventHandlers/VideoEventHandler';
import { IVideoEventHandlerParams } from 'EventHandlers/BaseVideoEventHandler';
import { TestEnvironment } from 'Utilities/TestEnvironment';

export class VastVideoEventHandler extends VideoEventHandler {

    private _vastAdUnit: VastAdUnit;
    private _vastCampaign: VastCampaign;
    private _clientInfo: ClientInfo;

    constructor(params: IVideoEventHandlerParams) {
        super(params);
        this._vastAdUnit = <VastAdUnit>params.adUnit;
        this._vastCampaign = <VastCampaign>params.campaign;
        this._clientInfo = params.clientInfo;
    }

    public onProgress(progress: number): void {
        super.onProgress(progress);

        const moat = MoatViewabilityService.getMoat();
        if(moat) {
            const events = this._vastAdUnit.getEvents();
            const event = events.shift();
            if(event) {
                if(progress / this._vastCampaign.getVideo().getDuration() >= event[0]) {
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

        const session = this._vastCampaign.getSession();

        if(session) {
            if(session.getEventSent(EventType.VAST_COMPLETE)) {
                return;
            }
            session.setEventSent(EventType.VAST_COMPLETE);
        }

        const moat = MoatViewabilityService.getMoat();
        if(moat) {
            moat.triggerVideoEvent('AdVideoComplete', this._vastAdUnit.getVolume());
        }

        const endScreen = this._vastAdUnit.getEndScreen();
        if(endScreen) {
            endScreen.show();
        } else {
            this._vastAdUnit.hide();
        }
    }

    public onPrepared(url: string, duration: number, width: number, height: number): void {
        super.onPrepared(url, duration, width, height);

        const overlay = this._adUnit.getOverlay();
        if(overlay && this._vastAdUnit.getVideoClickThroughURL()) {
            overlay.setCallButtonVisible(true);
            overlay.setFadeEnabled(false);

            if(TestEnvironment.get('debugOverlayEnabled')) {
                overlay.setDebugMessage('Programmatic Ad');
            }
        }

        const moat = MoatViewabilityService.getMoat();
        if(moat) {
            moat.init(MoatViewabilityService.getMoatIds(), duration / 1000, url, MoatViewabilityService.getMoatData(), this._vastAdUnit.getVolume());
        }
    }

    public onPlay(url: string): void {
        super.onPlay(url);

        // was onVideoStart
        const session = this._vastCampaign.getSession();

        if(session) {
            if(session.getEventSent(EventType.IMPRESSION)) {
                return;
            }
            session.setEventSent(EventType.IMPRESSION);
        }

        this._vastAdUnit.sendImpressionEvent(session.getId(), this._clientInfo.getSdkVersion());
        this._vastAdUnit.sendTrackingEvent('creativeView', session.getId(), this._clientInfo.getSdkVersion());
        this._vastAdUnit.sendTrackingEvent('start', session.getId(), this._clientInfo.getSdkVersion());
        this._vastAdUnit.sendTrackingEvent('impression', session.getId(), this._clientInfo.getSdkVersion());

        const moat = MoatViewabilityService.getMoat();
        if(moat) {
            moat.triggerViewabilityEvent('exposure', true);
            moat.triggerVideoEvent('AdPlaying', this._vastAdUnit.getVolume());
        }
    }

    public onPause(url: string): void {
        super.onPause(url);

        const moat = MoatViewabilityService.getMoat();
        if(moat) {
            moat.triggerVideoEvent('AdPaused', this._vastAdUnit.getVolume());
            moat.triggerViewabilityEvent('exposure', false);
        }
    }

    public onStop(url: string): void {
        super.onStop(url);

        const moat = MoatViewabilityService.getMoat();
        if(moat) {
            moat.triggerVideoEvent('AdStopped', this._vastAdUnit.getVolume());
        }
    }

    public onVolumeChange(volume: number, maxVolume: number) {
        const moat = MoatViewabilityService.getMoat();
        if(moat) {
            this._vastAdUnit.setVolume(volume / maxVolume);
            moat.triggerVideoEvent('AdVolumeChange', this._vastAdUnit.getVolume());
            moat.triggerViewabilityEvent('volume', this._vastAdUnit.getVolume() * 100);
        }
    }

    protected handleFirstQuartileEvent(progress: number): void {
        super.handleFirstQuartileEvent(progress);
        this.sendThirdPartyTrackingEvent('firstQuartile');
    }

    protected handleMidPointEvent(progress: number): void {
        super.handleMidPointEvent(progress);
        this.sendThirdPartyTrackingEvent('midpoint');
    }

    protected handleThirdQuartileEvent(progress: number): void {
        super.handleThirdQuartileEvent(progress);
        this.sendThirdPartyTrackingEvent('thirdQuartile');
    }

    protected handleVideoError(errorType?: string, errorData?: any) {
        super.handleVideoError(errorType, errorData);

        const endScreen = this._vastAdUnit.getEndScreen();
        if(endScreen) {
            endScreen.show();
        } else {
            this._vastAdUnit.hide();
        }
    }

    protected handleCompleteEvent(url: string): void {
        super.handleCompleteEvent(url);
        const session = this._vastCampaign.getSession();
        this._vastAdUnit.sendTrackingEvent('complete', session.getId(), this._clientInfo.getSdkVersion());
    }

    private sendThirdPartyTrackingEvent(eventName: string): void {
        const trackingEventUrls = this._vastCampaign.getVast().getTrackingEventUrls(eventName);
        if (trackingEventUrls) {
            for (const url of trackingEventUrls) {
                this.sendThirdPartyEvent(`vast ${eventName}`, url);
            }
        }
    }

    private sendThirdPartyEvent(event: string, url: string): void {
        url = url.replace(/%ZONE%/, this._placement.getId());
        url = url.replace(/%SDK_VERSION%/, this._clientInfo.getSdkVersion().toString());
        this._thirdPartyEventManager.sendEvent(event, this._campaign.getSession().getId(), url, this._vastCampaign.getUseWebViewUserAgentForTracking());
    }
}
