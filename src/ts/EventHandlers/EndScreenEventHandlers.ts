import { Double } from 'Utilities/Double';
import { VideoAdUnit } from '../AdUnits/VideoAdUnit';
import {AdUnit} from "../Native/Api/AdUnit";
import {Listener} from "../Native/Api/Listener";
import {VideoPlayer} from "../Native/Api/VideoPlayer";

export class EndScreenEventHandlers {

    public static onReplay(adUnit: VideoAdUnit): void {
        adUnit.setVideoActive(true);
        adUnit.setVideoPosition(0);
        adUnit.getOverlay().setSkipEnabled(true);
        adUnit.getOverlay().setSkipDuration(0);
        adUnit.getEndScreen().hide();
        adUnit.getOverlay().show();
        AdUnit.setViews(['videoplayer', 'webview']).then(() => {
            VideoPlayer.prepare(adUnit.getCampaign().getVideoUrl(), new Double(adUnit.getPlacement().muteVideo() ? 0.0 : 1.0));
        });
    }

    /*public static onDownload(adUnit: VideoAdUnit): void {
        adUnit.getSessionManager().sendClick(adUnit);
        Listener.sendClickEvent(adUnit.getPlacement().getId());
        adUnit.getNativeBridge().invoke('Intent', 'launch', [{
            'action': 'android.intent.action.VIEW',
            'uri': 'market://details?id=' + adUnit.getCampaign().getAppStoreId()
        }]);
    }*/

}
