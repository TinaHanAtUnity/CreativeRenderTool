import { Double } from 'Utilities/Double';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { FinishState } from 'Constants/FinishState';
import { NativeBridge } from 'Native/NativeBridge';

export class OverlayEventHandlers {

  public static onSkip(nativeBridge: NativeBridge, adUnit: VideoAdUnit): void {
      nativeBridge.VideoPlayer.pause();
      adUnit.setVideoActive(false);
      adUnit.setFinishState(FinishState.SKIPPED);
      adUnit.getSession().sendSkip(adUnit);
      nativeBridge.AdUnit.setViews(['webview']);
      adUnit.getOverlay().hide();
      if (adUnit.getCampaign()) {
          adUnit.getEndScreen().show();
      } else {
          adUnit.hide();
      }
  }

  public static onMute(nativeBridge: NativeBridge, adUnit: VideoAdUnit, muted: boolean): void {
      nativeBridge.VideoPlayer.setVolume(new Double(muted ? 0.0 : 1.0));
  }

}
