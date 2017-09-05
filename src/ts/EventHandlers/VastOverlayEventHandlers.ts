import { VastAdUnit } from 'AdUnits/VastAdUnit';
import { SessionManager } from 'Managers/SessionManager';
import { NativeBridge } from 'Native/NativeBridge';
import { Platform } from 'Constants/Platform';
import { ViewController } from 'AdUnits/Containers/ViewController';
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
        adUnit.setMuted(muted);
        if (muted) {
            const moat = adUnit.getMoat();
            if(moat) {
                moat.triggerVideoEvent('AdVolumeChange', 0);
                moat.triggerViewabilityEvent('volume', 0.0);
            }
            adUnit.sendTrackingEvent(sessionManager.getEventManager(), 'mute', sessionManager.getSession().getId(), sessionManager.getClientInfo().getSdkVersion());
        } else {
            const moat = adUnit.getMoat();
            if(moat) {
                moat.triggerVideoEvent('AdVolumeChange', adUnit.getVolume());
                moat.triggerViewabilityEvent('volume', adUnit.getVolume() * 100);
            }
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

    public static onPauseForTesting(nativeBridge: NativeBridge, adUnit: VastAdUnit): void {
        if(!VastOverlayEventHandlers.paused) {
            if(nativeBridge.getPlatform() === Platform.IOS) {
                (adUnit.getContainer() as ViewController).pause();
            }
            nativeBridge.VideoPlayer.pause();
            VastOverlayEventHandlers.paused = true;
        } else {
            if(nativeBridge.getPlatform() === Platform.IOS) {
                (adUnit.getContainer() as ViewController).unPause();
            }
            nativeBridge.VideoPlayer.play();
            const moat = adUnit.getMoat();
            if(moat) {
                moat.triggerViewabilityEvent('exposure', true);
                moat.triggerVideoEvent('AdPlaying', adUnit.getVolume());
            }
            VastOverlayEventHandlers.paused = false;
        }
    }

    private static paused: boolean  = false;
}
