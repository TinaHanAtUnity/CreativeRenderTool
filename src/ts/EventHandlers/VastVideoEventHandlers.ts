import { VastAdUnit } from 'AdUnits/VastAdUnit';
import { SessionManager } from 'Managers/SessionManager';
import { EventType } from 'Models/Session';

export class VastVideoEventHandlers {

    public static onVideoStart(sessionManager: SessionManager, adUnit: VastAdUnit): void {
        if(adUnit.getCampaign().getSession()) {
            if(adUnit.getCampaign().getSession().getEventSent(EventType.IMPRESSION)) {
                return;
            }
            adUnit.getCampaign().getSession().setEventSent(EventType.IMPRESSION);
        }
        adUnit.sendImpressionEvent(sessionManager.getEventManager(), adUnit.getCampaign().getSession().getId(), sessionManager.getClientInfo().getSdkVersion());
        adUnit.sendTrackingEvent(sessionManager.getEventManager(), 'creativeView', adUnit.getCampaign().getSession().getId(), sessionManager.getClientInfo().getSdkVersion());
        adUnit.sendTrackingEvent(sessionManager.getEventManager(), 'start', adUnit.getCampaign().getSession().getId(), sessionManager.getClientInfo().getSdkVersion());
    }

    public static onVideoCompleted(sessionManager: SessionManager, adUnit: VastAdUnit) {
        if(adUnit.getCampaign().getSession()) {
            if(adUnit.getCampaign().getSession().getEventSent(EventType.VAST_COMPLETE)) {
                return;
            }
            adUnit.getCampaign().getSession().setEventSent(EventType.VAST_COMPLETE);
        }
        adUnit.sendTrackingEvent(sessionManager.getEventManager(), 'complete', adUnit.getCampaign().getSession().getId(), sessionManager.getClientInfo().getSdkVersion());

        const endScreen = adUnit.getEndScreen();
        if(endScreen) {
            endScreen.show();
        } else {
            adUnit.hide();
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
