import { Double } from 'Utilities/Double';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { VideoPlayerApi } from 'Native/Api/VideoPlayer';
import { AdUnitApi } from 'Native/Api/AdUnit';
import { FinishState } from 'Constants/FinishState';

export class OverlayEventHandlers {

  public static onSkip(adUnit: VideoAdUnit): void {
      VideoPlayerApi.pause();
      adUnit.setVideoActive(false);
      adUnit.setFinishState(FinishState.SKIPPED);
      adUnit.getSession().sendSkip(adUnit);
      AdUnitApi.setViews(['webview']);
      adUnit.getOverlay().hide();
      adUnit.getEndScreen().show();
  }

  public static onMute(adUnit: VideoAdUnit, muted: boolean): void {
      VideoPlayerApi.setVolume(new Double(muted ? 0.0 : 1.0));
  }

}
