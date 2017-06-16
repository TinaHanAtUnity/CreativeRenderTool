import { VastAdUnit } from 'AdUnits/VastAdUnit';
import { SessionManager } from 'Managers/SessionManager';
import { NativeBridge } from 'Native/NativeBridge';
import { Platform } from 'Constants/Platform';

export class VastOverlayEventHandlers {

    public static onSkip(adUnit: VastAdUnit) {
        const endScreen = adUnit.getEndScreen();
        if (endScreen) {
            endScreen.show();
            adUnit.onFinish.trigger();
        } else {
            adUnit.hide();
        }
    }

    public static onMute(sessionManager: SessionManager, adUnit: VastAdUnit, muted: boolean): void {
        adUnit.setMuted(muted);
        if (muted) {
            const moat = adUnit.getMoat();
            if(moat) {
                moat.triggerEvent('AdVolumeChange', 0);
            }
            adUnit.sendTrackingEvent(sessionManager.getEventManager(), 'mute', sessionManager.getSession().getId(), sessionManager.getClientInfo().getSdkVersion());
        } else {
            const moat = adUnit.getMoat();
            if(moat) {
                moat.triggerEvent('AdVolumeChange', adUnit.getVolume());
            }
            adUnit.sendTrackingEvent(sessionManager.getEventManager(), 'unmute', sessionManager.getSession().getId(), sessionManager.getClientInfo().getSdkVersion());
        }
    }

    public static onCallButton(nativeBridge: NativeBridge, sessionManager: SessionManager, adUnit: VastAdUnit): void {
        nativeBridge.Listener.sendClickEvent(adUnit.getPlacement().getId());

        adUnit.sendVideoClickTrackingEvent(sessionManager.getEventManager(), sessionManager.getSession().getId(), sessionManager.getClientInfo().getSdkVersion());

        const clickThroughURL = adUnit.getVideoClickThroughURL();
        if(clickThroughURL) {
            if(nativeBridge.getPlatform() === Platform.IOS) {
                nativeBridge.UrlScheme.open(clickThroughURL);
            } else {
                nativeBridge.Intent.launch({
                    'action': 'android.intent.action.VIEW',
                    'uri': clickThroughURL
                });
            }
        }
    }

}
