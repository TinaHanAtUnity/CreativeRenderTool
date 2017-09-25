import { VastAdUnit } from 'AdUnits/VastAdUnit';
import { EventType } from 'Models/Session';
import { EventManager } from 'Managers/EventManager';
import { ClientInfo } from 'Models/ClientInfo';

export class VastVideoEventHandlers {

    public static onVideoStart(eventManager: EventManager, adUnit: VastAdUnit, clientInfo: ClientInfo): void {
        if(adUnit.getCampaign().getSession()) {
            if(adUnit.getCampaign().getSession().getEventSent(EventType.IMPRESSION)) {
                return;
            }
            adUnit.getCampaign().getSession().setEventSent(EventType.IMPRESSION);
        }
        adUnit.sendImpressionEvent(eventManager, adUnit.getCampaign().getSession().getId(), clientInfo.getSdkVersion());
        adUnit.sendTrackingEvent(eventManager, 'creativeView', adUnit.getCampaign().getSession().getId(), clientInfo.getSdkVersion());
        adUnit.sendTrackingEvent(eventManager, 'start', adUnit.getCampaign().getSession().getId(), clientInfo.getSdkVersion());
    }

    public static onVideoCompleted(eventManager: EventManager, adUnit: VastAdUnit, clientInfo: ClientInfo) {
        if(adUnit.getCampaign().getSession()) {
            if(adUnit.getCampaign().getSession().getEventSent(EventType.VAST_COMPLETE)) {
                return;
            }
            adUnit.getCampaign().getSession().setEventSent(EventType.VAST_COMPLETE);
        }
        adUnit.sendTrackingEvent(eventManager, 'complete', adUnit.getCampaign().getSession().getId(), clientInfo.getSdkVersion());

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
