import { VastAdUnit } from 'AdUnits/VastAdUnit';
import { SessionManager } from 'Managers/SessionManager';
import { NativeBridge } from 'Native/NativeBridge';
import { Platform } from 'Constants/Platform';
import { Request } from 'Utilities/Request';

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
        if (muted) {
            adUnit.sendTrackingEvent(sessionManager.getEventManager(), 'mute', sessionManager.getSession().getId(), sessionManager.getClientInfo().getSdkVersion());
        } else {
            adUnit.sendTrackingEvent(sessionManager.getEventManager(), 'unmute', sessionManager.getSession().getId(), sessionManager.getClientInfo().getSdkVersion());
        }
    }

    public static onCallButton(nativeBridge: NativeBridge, sessionManager: SessionManager, adUnit: VastAdUnit, request: Request): Promise<void> {
        nativeBridge.Listener.sendClickEvent(adUnit.getPlacement().getId());

        adUnit.sendVideoClickTrackingEvent(sessionManager.getEventManager(), sessionManager.getSession().getId(), sessionManager.getClientInfo().getSdkVersion());

        const clickThroughURL = adUnit.getVideoClickThroughURL();
        if(clickThroughURL) {
            return request.followRedirectChain(clickThroughURL).then((url: string) => {
                if(nativeBridge.getPlatform() === Platform.IOS) {
                    nativeBridge.UrlScheme.open(url);
                } else {
                    nativeBridge.Intent.launch({
                        'action': 'android.intent.action.VIEW',
                        'uri': url
                    });
                }
            });
        }
        return Promise.reject(new Error('No clickThroughURL was defined'));
    }

}
