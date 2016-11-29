import { NativeBridge } from 'Native/NativeBridge';
import { Request } from 'Utilities/Request';
import { SessionManager } from 'Managers/SessionManager';
import { Platform } from 'Constants/Platform';
import { Campaign } from 'Models/Campaign';
import { VastAdUnit}  from 'AdUnits/VastAdUnit';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { KeyCode } from 'Constants/Android/KeyCode';
import { DeviceInfo } from 'Models/DeviceInfo';
import { IosUtils } from 'Utilities/IosUtils';

export class VastEndScreenEventHandlers {
    public static onEndcardClick(nativeBridge: NativeBridge, sessionManager: SessionManager, adUnit: VastAdUnit): void {
        const platform = nativeBridge.getPlatform();
        const url = adUnit.getVideoClickThroughURL();

        // if(platform === Platform.IOS) {
        //     nativeBridge.UrlScheme.open(url);
        // } else if(nativeBridge.getPlatform() === Platform.ANDROID) {
        //     nativeBridge.Intent.launch({
        //         'action': 'android.intent.action.VIEW',
        //         'uri': url
        //     });
        // }
    }

    public static onPrivacy(nativeBridge: NativeBridge, url: string): void {
        if(nativeBridge.getPlatform() === Platform.IOS) {
            nativeBridge.UrlScheme.open(url);
        } else if(nativeBridge.getPlatform() === Platform.ANDROID) {
            nativeBridge.Intent.launch({
                'action': 'android.intent.action.VIEW',
                'uri': url
            });
        }
    }

    public static onClose(adUnit: VastAdUnit): void {
        adUnit.hide();
    }

    public static onKeyEvent(keyCode: number, adUnit: VideoAdUnit): void {
        if(keyCode === KeyCode.BACK && adUnit.isShowing() && !adUnit.getVideoAdUnitController().isVideoActive()) {
            adUnit.hide();
        }
    }
}
