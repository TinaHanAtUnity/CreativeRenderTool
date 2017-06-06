import { VastAdUnit } from 'AdUnits/VastAdUnit';
import { SessionManager } from 'Managers/SessionManager';
import { EventType } from 'Models/Session';

export class VastVideoEventHandlers {

    public static onVideoPrepared(adUnit: VastAdUnit, duration: number) {
        adUnit.setRealDuration(duration);
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
            moat.triggerEvent('AdPlaying', adUnit.getVolume());
        }
    }

    public static onVideoProgress(adUnit: VastAdUnit, position: number) {
        const moat = adUnit.getMoat();
        if(moat) {
            const events = adUnit.getEvents();
            const event = events.shift();
            if(event) {
                if(position / adUnit.getRealDuration() >= event[0]) {
                    moat.triggerEvent(event[1], adUnit.getVolume());
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
            moat.triggerEvent('AdVideoComplete', adUnit.getVolume());
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
            moat.triggerEvent('AdStopped', adUnit.getVolume());
        }
    }

    public static onVideoPaused(adUnit: VastAdUnit) {
        const moat = adUnit.getMoat();
        if(moat) {
            moat.triggerEvent('AdPaused', adUnit.getVolume());
        }
    }

    public static onVolumeChange(adUnit: VastAdUnit, volume: number, maxVolume: number) {
        const moat = adUnit.getMoat();
        if(moat) {
            adUnit.setVolume(volume);
            moat.triggerEvent('AdVolumeChange', adUnit.getVolume());
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
