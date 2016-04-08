import { Double } from 'Utilities/Double';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { FinishState } from 'Constants/FinishState';
import { NativeBridge } from 'Native/NativeBridge';

export class OverlayEventHandlers {

  public static onSkip(adUnit: VideoAdUnit): void {
      NativeBridge.VideoPlayer.pause();
      adUnit.setVideoActive(false);
      adUnit.setFinishState(FinishState.SKIPPED);
      adUnit.getSession().sendSkip(adUnit);
      NativeBridge.AdUnit.setViews(['webview']);
      adUnit.getOverlay().hide();
      adUnit.getEndScreen().show();
  }

  public static onMute(adUnit: VideoAdUnit, muted: boolean): void {
      NativeBridge.VideoPlayer.setVolume(new Double(muted ? 0.0 : 1.0));
  }

}
