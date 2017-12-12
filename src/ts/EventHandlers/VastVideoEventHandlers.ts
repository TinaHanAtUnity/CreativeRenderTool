import { VastAdUnit } from 'AdUnits/VastAdUnit';
import { EventType } from 'Models/Session';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { ClientInfo } from 'Models/ClientInfo';
import { VastCampaign } from 'Models/Vast/VastCampaign';

export class VastVideoEventHandlers {

    public static onVideoPrepared(adUnit: VastAdUnit, url: string, duration: number, moatData: any, moatIds: any) {
        const moat = adUnit.getMoat();
        if(moat) {
            moat.init(moatIds, duration / 1000, url, moatData, adUnit.getVolume());
        }
    }

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
                if(position / (<VastCampaign>adUnit.getCampaign()).getVideo().getDuration() >= event[0]) {
                    moat.triggerVideoEvent(event[1], adUnit.getVolume());
                } else {
                    events.unshift(event);
                }
                adUnit.setEvents(events);
            }
        }
    }

    public static onVideoCompleted(thirdPartyEventManager: ThirdPartyEventManager, adUnit: VastAdUnit, clientInfo: ClientInfo) {
        if(adUnit.getCampaign().getSession()) {
            if(adUnit.getCampaign().getSession().getEventSent(EventType.VAST_COMPLETE)) {
                return;
            }
            adUnit.getCampaign().getSession().setEventSent(EventType.VAST_COMPLETE);
        }
        adUnit.sendTrackingEvent('complete', adUnit.getCampaign().getSession().getId(), clientInfo.getSdkVersion());

        const moat = adUnit.getMoat();
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
