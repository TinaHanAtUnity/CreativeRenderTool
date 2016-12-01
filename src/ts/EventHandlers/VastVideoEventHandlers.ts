import { VastAdUnit } from 'AdUnits/VastAdUnit';
import { SessionManager } from 'Managers/SessionManager';

export class VastVideoEventHandlers {

    public static onVideoStart(sessionManager: SessionManager, adUnit: VastAdUnit): void {
        if (sessionManager.getSession()) {
            if (sessionManager.getSession().impressionSent) {
                return;
            }
            sessionManager.getSession().impressionSent = true;
        }
        adUnit.sendImpressionEvent(sessionManager.getEventManager(), sessionManager.getSession().getId(), sessionManager.getClientInfo().getSdkVersion());
        adUnit.sendTrackingEvent(sessionManager.getEventManager(), 'creativeView', sessionManager.getSession().getId());
        adUnit.sendTrackingEvent(sessionManager.getEventManager(), 'start', sessionManager.getSession().getId());
    }

    public static onVideoCompleted(sessionManager: SessionManager, adUnit: VastAdUnit) {
        if (sessionManager.getSession()) {
            if (sessionManager.getSession().vastCompleteSent) {
                return;
            }
            sessionManager.getSession().vastCompleteSent = true;
        }
        adUnit.sendTrackingEvent(sessionManager.getEventManager(), 'complete', sessionManager.getSession().getId());

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
