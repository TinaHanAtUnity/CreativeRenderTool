import { VideoAdUnit } from 'Models/VideoAdUnit';
import { Double } from 'Utilities/Double';

export class EndScreenEventHandlers {

    public static onReplay(adUnit: VideoAdUnit): void {
        adUnit.setVideoActive(true);
        adUnit.setVideoPosition(0);
        adUnit.getOverlay().setSkipEnabled(true);
        adUnit.getOverlay().setSkipDuration(0);
        adUnit.getEndScreen().hide();
        adUnit.getOverlay().show();
        adUnit.getNativeBridge().invoke('AdUnit', 'setViews', [['videoplayer', 'webview']]).then(() => {
            adUnit.getVideoPlayer().prepare(adUnit.getCampaign().getVideoUrl(), new Double(adUnit.getPlacement().muteVideo() ? 0.0 : 1.0));
        });
    }

    public static onDownload(adUnit: VideoAdUnit): void {
        adUnit.getSessionManager().sendClick(adUnit);
        adUnit.getNativeBridge().invoke('Listener', 'sendClickEvent', [adUnit.getPlacement().getId()]);
        adUnit.getNativeBridge().invoke('Intent', 'launch', [{
            'action': 'android.intent.action.VIEW',
            'uri': 'market://details?id=' + adUnit.getCampaign().getAppStoreId()
        }]);
    }

}