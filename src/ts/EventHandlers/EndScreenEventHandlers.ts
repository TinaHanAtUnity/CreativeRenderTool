import { Double } from 'Utilities/Double';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { AdUnitApi } from 'Native/Api/AdUnit';
import { VideoPlayerApi } from 'Native/Api/VideoPlayer';
import { IntentApi } from 'Native/Api/Intent';
import { ListenerApi } from 'Native/Api/Listener';

export class EndScreenEventHandlers {

    public static onReplay(adUnit: VideoAdUnit): void {
        adUnit.setVideoActive(true);
        adUnit.setVideoPosition(0);
        adUnit.getOverlay().setSkipEnabled(true);
        adUnit.getOverlay().setSkipDuration(0);
        adUnit.getEndScreen().hide();
        adUnit.getOverlay().show();
        AdUnitApi.setViews(['videoplayer', 'webview']).then(() => {
            VideoPlayerApi.prepare(adUnit.getCampaign().getVideoUrl(), new Double(adUnit.getPlacement().muteVideo() ? 0.0 : 1.0));
        });
    }

    public static onDownload(adUnit: VideoAdUnit): void {
        adUnit.getSession().sendClick(adUnit);
        ListenerApi.sendClickEvent(adUnit.getPlacement().getId());
        IntentApi.launch({
            'action': 'android.intent.action.VIEW',
            'uri': 'market://details?id=' + adUnit.getCampaign().getAppStoreId()
        });
    }

}
