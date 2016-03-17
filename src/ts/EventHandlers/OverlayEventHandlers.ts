import { Double } from 'Utilities/Double';
import { VideoAdUnit } from "../AdUnits/VideoAdUnit";
import {VideoPlayer} from "../Native/Api/VideoPlayer";
import { AdUnit } from "../Native/Api/AdUnit";
import {FinishState} from "../Constants/FinishState";

export class OverlayEventHandlers {

  public static onSkip(adUnit: VideoAdUnit): void {
      VideoPlayer.pause();
      adUnit.setVideoActive(false);
      adUnit.setFinishState(FinishState.SKIPPED);
      //adUnit.getSessionManager().sendSkip(adUnit);
      AdUnit.setViews(['webview']);
      adUnit.getOverlay().hide();
      adUnit.getEndScreen().show();
  }

  public static onMute(adUnit: VideoAdUnit, muted: boolean): void {
      VideoPlayer.setVolume(new Double(muted ? 0.0 : 1.0));
  }

}
