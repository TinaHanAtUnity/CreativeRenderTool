import RequestUtilities from 'Utilities/RequestUtilities';
import { Request } from 'Utilities/Request';
import { NativeBridge } from 'Native/NativeBridge';
import { SessionManager } from 'Managers/SessionManager';
import { Platform } from 'Constants/Platform';
import { VastAdUnit} from 'AdUnits/VastAdUnit';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { KeyCode } from 'Constants/Android/KeyCode';

export class VastEndScreenEventHandlers {
    public static onClick(nativeBridge: NativeBridge, sessionManager: SessionManager, adUnit: VastAdUnit, request: Request): Promise<void> {
        const platform = nativeBridge.getPlatform();
        const clickThroughURL = adUnit.getCompanionClickThroughUrl() || adUnit.getVideoClickThroughURL();
        if (clickThroughURL) {
            return RequestUtilities.followUrl(request, clickThroughURL).then((url: string) => {
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

    public static onShow(sessionManager: SessionManager, adUnit: VastAdUnit): void {
        adUnit.sendCompanionTrackingEvent(sessionManager.getEventManager(), sessionManager.getSession().getId(), sessionManager.getClientInfo().getSdkVersion());
    }
}
