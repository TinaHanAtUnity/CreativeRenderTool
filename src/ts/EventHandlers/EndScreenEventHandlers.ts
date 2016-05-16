import { Double } from 'Utilities/Double';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { NativeBridge } from 'Native/NativeBridge';
import { Request } from 'Utilities/Request';
import { SessionManager } from 'Managers/SessionManager';
import { Platform } from 'Constants/Platform';

export class EndScreenEventHandlers {

    public static onReplay(nativeBridge: NativeBridge, adUnit: VideoAdUnit): void {
        adUnit.setVideoActive(true);
        adUnit.setVideoPosition(0);
        adUnit.getOverlay().setSkipEnabled(true);
        adUnit.getOverlay().setSkipDuration(0);
        adUnit.getEndScreen().hide();
        adUnit.getOverlay().show();
        if(nativeBridge.getPlatform() === Platform.IOS) {
            nativeBridge.IosAdUnit.setViews(['videoplayer', 'webview']).then(() => {
                nativeBridge.VideoPlayer.prepare(adUnit.getCampaign().getVideoUrl(), new Double(adUnit.getPlacement().muteVideo() ? 0.0 : 1.0));
            });
        } else {
            nativeBridge.AndroidAdUnit.setViews(['videoplayer', 'webview']).then(() => {
                nativeBridge.VideoPlayer.prepare(adUnit.getCampaign().getVideoUrl(), new Double(adUnit.getPlacement().muteVideo() ? 0.0 : 1.0));
            });
        }
    }

    public static onDownload(nativeBridge: NativeBridge, sessionManager: SessionManager, adUnit: VideoAdUnit): void {
        if(adUnit.getCampaign().getClickAttributionUrlFollowsRedirects()) {
            sessionManager.sendClick(adUnit).then(response => {
                let location = Request.getHeader(response.headers, 'location');
                if (location) {
                    nativeBridge.Intent.launch({
                        'action': 'android.intent.action.VIEW',
                        'uri': location
                    });
                } else {
                    throw new Error('No location found');
                }
            });
        } else {
            sessionManager.sendClick(adUnit);
            if(nativeBridge.getPlatform() === Platform.IOS) {
                nativeBridge.AppSheet.present({
                    id: parseInt(adUnit.getCampaign().getAppStoreId(), 10)
                });
            } else {
                nativeBridge.Intent.launch({
                    'action': 'android.intent.action.VIEW',
                    'uri': 'market://details?id=' + adUnit.getCampaign().getAppStoreId()
                });
            }
        }
    }

}
