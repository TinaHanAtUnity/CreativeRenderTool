import { VastAdUnit } from 'AdUnits/VastAdUnit';
import { SessionManager } from 'Managers/SessionManager';
import { NativeBridge } from 'Native/NativeBridge';
import { Platform } from 'Constants/Platform';

export class VastOverlayEventHandlers {

    public static onSkip(adUnit: VastAdUnit) {
        adUnit.hide();
    }

    public static onMute(sessionManager: SessionManager, adUnit: VastAdUnit, muted: boolean): void {
        if (muted) {
            adUnit.sendTrackingEvent(sessionManager.getEventManager(), 'mute', sessionManager.getSession().getId());
        } else {
            adUnit.sendTrackingEvent(sessionManager.getEventManager(), 'unmute', sessionManager.getSession().getId());
        }
    }

    public static onCallButton(nativeBridge: NativeBridge, sessionManager: SessionManager, adUnit: VastAdUnit): void {
        adUnit.sendVideoClickTrackingEvent(sessionManager.getEventManager(), sessionManager.getSession().getId());

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