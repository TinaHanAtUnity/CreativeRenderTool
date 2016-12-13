import { NativeBridge } from 'Native/NativeBridge';
import { SessionManager } from 'Managers/SessionManager';
import { Platform } from 'Constants/Platform';
import { VastAdUnit}  from 'AdUnits/VastAdUnit';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { KeyCode } from 'Constants/Android/KeyCode';

export class VastEndScreenEventHandlers {
    public static onClick(nativeBridge: NativeBridge, sessionManager: SessionManager, adUnit: VastAdUnit): void {
        const platform = nativeBridge.getPlatform();
        const clickThroughURL = adUnit.getCompanionClickThroughUrl() || adUnit.getVideoClickThroughURL();
        if (clickThroughURL) {
            if (platform === Platform.IOS) {
                nativeBridge.UrlScheme.open(clickThroughURL);
            } else if (nativeBridge.getPlatform() === Platform.ANDROID) {
                nativeBridge.Intent.launch({
                    'action': 'android.intent.action.VIEW',
                    'uri': clickThroughURL
                });
            }
        }
    }

    public static onClose(adUnit: VastAdUnit): void {
        adUnit.hide();
    }

    public static onKeyEvent(keyCode: number, adUnit: VideoAdUnit): void {
        if (keyCode === KeyCode.BACK && adUnit.isShowing() && !adUnit.getVideoAdUnitController().isVideoActive()) {
            adUnit.hide();
        }
    }
}
