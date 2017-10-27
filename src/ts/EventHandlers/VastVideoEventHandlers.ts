import { VastAdUnit } from 'AdUnits/VastAdUnit';
import { EventType } from 'Models/Session';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { ClientInfo } from 'Models/ClientInfo';

export class VastVideoEventHandlers {

    public static onVideoStart(thirdPartyEventManager: ThirdPartyEventManager, adUnit: VastAdUnit, clientInfo: ClientInfo): void {
        if(adUnit.getCampaign().getSession()) {
            if(adUnit.getCampaign().getSession().getEventSent(EventType.IMPRESSION)) {
                return;
            }
            adUnit.getCampaign().getSession().setEventSent(EventType.IMPRESSION);
        }
        adUnit.sendImpressionEvent(adUnit.getCampaign().getSession().getId(), clientInfo.getSdkVersion());
        adUnit.sendTrackingEvent('creativeView', adUnit.getCampaign().getSession().getId(), clientInfo.getSdkVersion());
        adUnit.sendTrackingEvent('start', adUnit.getCampaign().getSession().getId(), clientInfo.getSdkVersion());
    }

    public static onVideoCompleted(thirdPartyEventManager: ThirdPartyEventManager, adUnit: VastAdUnit, clientInfo: ClientInfo) {
        if(adUnit.getCampaign().getSession()) {
            if(adUnit.getCampaign().getSession().getEventSent(EventType.VAST_COMPLETE)) {
                return;
            }
            adUnit.getCampaign().getSession().setEventSent(EventType.VAST_COMPLETE);
        }
        adUnit.sendTrackingEvent('complete', adUnit.getCampaign().getSession().getId(), clientInfo.getSdkVersion());

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
