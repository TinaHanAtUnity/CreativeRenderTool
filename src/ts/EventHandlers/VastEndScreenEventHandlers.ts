import { Request } from 'Utilities/Request';
import { NativeBridge } from 'Native/NativeBridge';
import { Platform } from 'Constants/Platform';
import { VastAdUnit} from 'AdUnits/VastAdUnit';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { KeyCode } from 'Constants/Android/KeyCode';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { ClientInfo } from 'Models/ClientInfo';

export class VastEndScreenEventHandlers {
    public static onClick(nativeBridge: NativeBridge, adUnit: VastAdUnit, request: Request): Promise<void> {
        const platform = nativeBridge.getPlatform();
        const clickThroughURL = adUnit.getCompanionClickThroughUrl() || adUnit.getVideoClickThroughURL();
        if (clickThroughURL) {
            return request.followRedirectChain(clickThroughURL).then((url: string) => {
                if (platform === Platform.IOS) {
                    nativeBridge.UrlScheme.open(url);
                } else if (nativeBridge.getPlatform() === Platform.ANDROID) {
                    nativeBridge.Intent.launch({
                        'action': 'android.intent.action.VIEW',
                        'uri': url
                    });
                }
            });
        }
        return Promise.reject(new Error('There is no clickthrough URL for video or companion'));
    }

    public static onClose(adUnit: VastAdUnit): void {
        adUnit.hide();
    }

    public static onKeyEvent(keyCode: number, adUnit: VideoAdUnit): void {
        if (keyCode === KeyCode.BACK && adUnit.isShowing() && !adUnit.isActive()) {
            adUnit.hide();
        }
    }

    public static onShow(thirdPartyEventManager: ThirdPartyEventManager, adUnit: VastAdUnit, clientInfo: ClientInfo): void {
        adUnit.sendCompanionTrackingEvent(thirdPartyEventManager, adUnit.getCampaign().getSession().getId(), clientInfo.getSdkVersion());
    }
}
