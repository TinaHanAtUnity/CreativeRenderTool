import { VastAdUnit } from 'AdUnits/VastAdUnit';
import { SessionManager } from 'Managers/SessionManager';
import { EventType } from 'Models/Session';

export class VastVideoEventHandlers {

    public static onVideoPrepared(adUnit: VastAdUnit, url: string, duration: number, moatData: any) {
        adUnit.setRealDuration(duration);
        const ids = {
            "level1": "_ADVERTISER_",
            "level2": "_CAMPAIGN_",
            "level3": "_LINE_ITEM_",
            "level4": "_CREATIVE_"
        };
        const moat = adUnit.getMoat();
        if(moat) {
            moat.init(ids, duration / 1000, url, moatData);
        }
    }

    public static onVideoPlaying(sessionManager: SessionManager, adUnit: VastAdUnit): void {
        if (sessionManager.getSession()) {
            if (sessionManager.getSession().getEventSent(EventType.IMPRESSION)) {
                return;
            }
            sessionManager.getSession().setEventSent(EventType.IMPRESSION);
        }
        adUnit.sendImpressionEvent(sessionManager.getEventManager(), sessionManager.getSession().getId(), sessionManager.getClientInfo().getSdkVersion());
        adUnit.sendTrackingEvent(sessionManager.getEventManager(), 'creativeView', sessionManager.getSession().getId(), sessionManager.getClientInfo().getSdkVersion());
        adUnit.sendTrackingEvent(sessionManager.getEventManager(), 'start', sessionManager.getSession().getId(), sessionManager.getClientInfo().getSdkVersion());

        const moat = adUnit.getMoat();
        if(moat) {
            moat.triggerViewabilityEvent('exposure', true);
            moat.triggerVideoEvent('AdPlaying', adUnit.getVolume());
        }
    }

    public static onVideoProgress(adUnit: VastAdUnit, position: number) {
        const moat = adUnit.getMoat();
        if(moat) {
            const events = adUnit.getEvents();
            const event = events.shift();
            if(event) {
                if(position / adUnit.getRealDuration() >= event[0]) {
                    moat.triggerVideoEvent(event[1], adUnit.getVolume());
                } else {
                    events.unshift(event);
                }
                adUnit.setEvents(events);
            }
        }
    }

    public static onVideoCompleted(sessionManager: SessionManager, adUnit: VastAdUnit) {
        if (sessionManager.getSession()) {
            if (sessionManager.getSession().getEventSent(EventType.VAST_COMPLETE)) {
                return;
            }
            sessionManager.getSession().setEventSent(EventType.VAST_COMPLETE);
        }
        adUnit.sendTrackingEvent(sessionManager.getEventManager(), 'complete', sessionManager.getSession().getId(), sessionManager.getClientInfo().getSdkVersion());

        const moat = adUnit.getMoat();
        if(moat) {
            moat.triggerVideoEvent('AdVideoComplete', adUnit.getVolume());
        }

        const endScreen = adUnit.getEndScreen();
        if (endScreen) {
            endScreen.show();
        } else {
            adUnit.hide();
        }
    }

    public static onVideoStopped(adUnit: VastAdUnit) {
        const moat = adUnit.getMoat();
        if(moat) {
            moat.triggerVideoEvent('AdStopped', adUnit.getVolume());
        }
    }

    public static onVideoPaused(adUnit: VastAdUnit) {
        const moat = adUnit.getMoat();
        if(moat) {
            moat.triggerVideoEvent('AdPaused', adUnit.getVolume());
            moat.triggerViewabilityEvent('exposure', false);
        }
    }

    public static onVolumeChange(adUnit: VastAdUnit, volume: number, maxVolume: number) {
        const moat = adUnit.getMoat();
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
