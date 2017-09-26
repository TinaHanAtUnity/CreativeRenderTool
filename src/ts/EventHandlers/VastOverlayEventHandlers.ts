import { VastAdUnit } from 'AdUnits/VastAdUnit';
import { NativeBridge } from 'Native/NativeBridge';
import { Platform } from 'Constants/Platform';
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
        if (muted) {
            adUnit.sendTrackingEvent(thirdPartyEventManager, 'mute', adUnit.getCampaign().getSession().getId(), clientInfo.getSdkVersion());
        } else {
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

}
