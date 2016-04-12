import { Double } from 'Utilities/Double';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { NativeBridge } from 'Native/NativeBridge';

export class EndScreenEventHandlers {

    public static onReplay(adUnit: VideoAdUnit): void {
        adUnit.setVideoActive(true);
        adUnit.setVideoPosition(0);
        adUnit.getOverlay().setSkipEnabled(true);
        adUnit.getOverlay().setSkipDuration(0);
        adUnit.getEndScreen().hide();
        adUnit.getOverlay().show();
        NativeBridge.AdUnit.setViews(['videoplayer', 'webview']).then(() => {
            NativeBridge.VideoPlayer.prepare(adUnit.getCampaign().getVideoUrl(), new Double(adUnit.getPlacement().muteVideo() ? 0.0 : 1.0));
        });
    }

    public static onDownload(adUnit: VideoAdUnit): void {
        adUnit.getSession().sendClick(adUnit);
        NativeBridge.Listener.sendClickEvent(adUnit.getPlacement().getId());
        NativeBridge.Intent.launch({
            'action': 'android.intent.action.VIEW',
            'uri': 'market://details?id=' + adUnit.getCampaign().getAppStoreId()
        });
    }

}
