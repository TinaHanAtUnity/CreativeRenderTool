import { VastAdUnit } from 'AdUnits/VastAdUnit';
import { NativeBridge } from 'Native/NativeBridge';
import { Platform } from 'Constants/Platform';
import { ViewController } from 'AdUnits/Containers/ViewController';
import { Request } from 'Utilities/Request';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { ClientInfo } from 'Models/ClientInfo';

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

    public static onMute(thirdPartyEventManager: ThirdPartyEventManager, adUnit: VastAdUnit, muted: boolean, clientInfo: ClientInfo): void {
        adUnit.setMuted(muted);
        if (muted) {
            const moat = adUnit.getMoat();
            if(moat) {
                moat.triggerVideoEvent('AdVolumeChange', 0);
                moat.triggerViewabilityEvent('volume', 0.0);
            }
            adUnit.sendTrackingEvent(thirdPartyEventManager, 'mute', adUnit.getCampaign().getSession().getId(), clientInfo.getSdkVersion());
        } else {
            const moat = adUnit.getMoat();
            if(moat) {
                moat.triggerVideoEvent('AdVolumeChange', adUnit.getVolume());
                moat.triggerViewabilityEvent('volume', adUnit.getVolume() * 100);
            }
            adUnit.sendTrackingEvent(thirdPartyEventManager, 'unmute', adUnit.getCampaign().getSession().getId(), clientInfo.getSdkVersion());
        }
    }

    public static onCallButton(nativeBridge: NativeBridge, thirdPartyEventManager: ThirdPartyEventManager, adUnit: VastAdUnit, request: Request, clientInfo: ClientInfo): Promise<void> {
        nativeBridge.Listener.sendClickEvent(adUnit.getPlacement().getId());

        adUnit.sendVideoClickTrackingEvent(thirdPartyEventManager, adUnit.getCampaign().getSession().getId(), clientInfo.getSdkVersion());

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
