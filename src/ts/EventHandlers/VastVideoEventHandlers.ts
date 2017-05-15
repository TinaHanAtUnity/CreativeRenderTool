import { VastAdUnit } from 'AdUnits/VastAdUnit';
import { SessionManager } from 'Managers/SessionManager';
import { EventType } from 'Models/Session';

export class VastVideoEventHandlers {

    public static onVideoStart(sessionManager: SessionManager, adUnit: VastAdUnit): void {
        if (sessionManager.getSession()) {
            if (sessionManager.getSession().getEventSent(EventType.IMPRESSION)) {
                return;
            }
            sessionManager.getSession().setEventSent(EventType.IMPRESSION);
        }
        adUnit.sendImpressionEvent(sessionManager.getEventManager(), sessionManager.getSession().getId(), sessionManager.getClientInfo().getSdkVersion());
        adUnit.sendTrackingEvent(sessionManager.getEventManager(), 'creativeView', sessionManager.getSession().getId(), sessionManager.getClientInfo().getSdkVersion());
        adUnit.sendTrackingEvent(sessionManager.getEventManager(), 'start', sessionManager.getSession().getId(), sessionManager.getClientInfo().getSdkVersion());
    }

    public static onVideoCompleted(sessionManager: SessionManager, adUnit: VastAdUnit) {
        if (sessionManager.getSession()) {
            if (sessionManager.getSession().getEventSent(EventType.VAST_COMPLETE)) {
                return;
            }
            sessionManager.getSession().setEventSent(EventType.VAST_COMPLETE);
        }
        adUnit.sendTrackingEvent(sessionManager.getEventManager(), 'complete', sessionManager.getSession().getId(), sessionManager.getClientInfo().getSdkVersion());

        const endScreen = adUnit.getEndScreen();
        if (endScreen) {
            endScreen.show();
        } else {
            adUnit.hide();
        }
    }

    public static onVideoError(adUnit: VastAdUnit) {
        const endScreen = adUnit.getEndScreen();
        if (endScreen) {
            endScreen.show();
        } else {
            adUnit.hide();
        }
    }
}
