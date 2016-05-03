import { Double } from 'Utilities/Double';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { NativeBridge } from 'Native/NativeBridge';
import { Request } from 'Utilities/Request';
import { SessionManager } from 'Managers/SessionManager';

export class EndScreenEventHandlers {

    public static onReplay(nativeBridge: NativeBridge, adUnit: VideoAdUnit): void {
        adUnit.setVideoActive(true);
        adUnit.setVideoPosition(0);
        adUnit.getOverlay().setSkipEnabled(true);
        adUnit.getOverlay().setSkipDuration(0);
        adUnit.getEndScreen().hide();
        adUnit.getOverlay().show();
        nativeBridge.AdUnit.setViews(['videoplayer', 'webview']).then(() => {
            nativeBridge.VideoPlayer.prepare(adUnit.getCampaign().getVideoUrl(), new Double(adUnit.getPlacement().muteVideo() ? 0.0 : 1.0));
        });
    }

    public static onDownload(nativeBridge: NativeBridge, sessionManager: SessionManager, adUnit: VideoAdUnit): void {
        nativeBridge.Listener.sendClickEvent(adUnit.getPlacement().getId());
        if(adUnit.getCampaign().getClickAttributionUrlFollowsRedirects()) {
            sessionManager.sendClick(adUnit).then(response => {
                nativeBridge.Intent.launch({
                    'action': 'android.intent.action.VIEW',
                    'uri': Request.getHeader(response.headers, 'location')
                });
            });
        } else {
            sessionManager.sendClick(adUnit);
            nativeBridge.Intent.launch({
                'action': 'android.intent.action.VIEW',
                'uri': 'market://details?id=' + adUnit.getCampaign().getAppStoreId()
            });
        }
    }

}
