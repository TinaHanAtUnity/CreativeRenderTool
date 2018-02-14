import { VastAdUnit } from 'AdUnits/VastAdUnit';
import { EventType, Session } from 'Models/Session';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { ClientInfo } from 'Models/ClientInfo';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { MoatViewabilityService } from 'Utilities/MoatViewabilityService';
import { MOAT } from 'Views/MOAT';

export class VastVideoEventHandlers {

    public static onVideoPrepared(adUnit: VastAdUnit, url: string, duration: number) {
        const moat = MoatViewabilityService.getMoat();
        if(moat) {
            moat.init(MoatViewabilityService.getMoatIds(), duration / 1000, url, MoatViewabilityService.getMoatData(), adUnit.getVolume());
        }
    }

    public static onVideoStart(thirdPartyEventManager: ThirdPartyEventManager, adUnit: VastAdUnit, clientInfo: ClientInfo, session: Session): void {
        if(session) {
            if(session.getEventSent(EventType.IMPRESSION)) {
                return;
            }
            session.setEventSent(EventType.IMPRESSION);
        }

        adUnit.sendImpressionEvent(session.getId(), clientInfo.getSdkVersion());
        adUnit.sendTrackingEvent('creativeView', session.getId(), clientInfo.getSdkVersion());
        adUnit.sendTrackingEvent('start', session.getId(), clientInfo.getSdkVersion());
        adUnit.sendTrackingEvent('impression', session.getId(), clientInfo.getSdkVersion());

        const moat = MoatViewabilityService.getMoat();
        if(moat) {
            moat.triggerViewabilityEvent('exposure', true);
            moat.triggerVideoEvent('AdPlaying', adUnit.getVolume());
        }
    }

    public static onVideoProgress(adUnit: VastAdUnit, campaign: VastCampaign, position: number) {
        const moat = MoatViewabilityService.getMoat();
        if(moat) {
            const events = adUnit.getEvents();
            const event = events.shift();
            if(event) {
                if(position / campaign.getVideo().getDuration() >= event[0]) {
                    moat.triggerVideoEvent(event[1], adUnit.getVolume());
                } else {
                    events.unshift(event);
                }
                adUnit.setEvents(events);
            }
        }
    }

    public static onVideoCompleted(thirdPartyEventManager: ThirdPartyEventManager, adUnit: VastAdUnit, clientInfo: ClientInfo, session: Session) {
        if(session) {
            if(session.getEventSent(EventType.VAST_COMPLETE)) {
                return;
            }
            session.setEventSent(EventType.VAST_COMPLETE);
        }
        adUnit.sendTrackingEvent('complete', session.getId(), clientInfo.getSdkVersion());

        const moat = MoatViewabilityService.getMoat();
        if(moat) {
            moat.triggerVideoEvent('AdVideoComplete', adUnit.getVolume());
        }

        const endScreen = adUnit.getEndScreen();
        if(endScreen) {
            endScreen.show();
        } else {
            adUnit.hide();
        }
    }

    public static onVideoStopped(adUnit: VastAdUnit) {
        const moat = MoatViewabilityService.getMoat();
        if(moat) {
            moat.triggerVideoEvent('AdStopped', adUnit.getVolume());
        }
    }

    public static onVideoPaused(adUnit: VastAdUnit) {
        const moat = MoatViewabilityService.getMoat();
        if(moat) {
            moat.triggerVideoEvent('AdPaused', adUnit.getVolume());
            moat.triggerViewabilityEvent('exposure', false);
        }
    }

    public static onVolumeChange(adUnit: VastAdUnit, volume: number, maxVolume: number) {
        const moat = MoatViewabilityService.getMoat();
        if(moat) {
            adUnit.setVolume(volume / maxVolume);
            moat.triggerVideoEvent('AdVolumeChange', adUnit.getVolume());
            moat.triggerViewabilityEvent('volume', adUnit.getVolume() * 100);
        }
    }

    public static onVideoError(adUnit: VastAdUnit) {
        const endScreen = adUnit.getEndScreen();
        if(endScreen) {
            endScreen.show();
        } else {
            adUnit.hide();
        }
    }
}
