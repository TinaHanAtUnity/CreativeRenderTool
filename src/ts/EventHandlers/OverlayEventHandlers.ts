import { FinishState } from 'Models/AdUnit';
import { Double } from 'Utilities/Double';
import { VideoAdUnit } from 'Models/VideoAdUnit';

export class OverlayEventHandlers {

  public static onSkip(adUnit: VideoAdUnit): void {
      adUnit.getVideoPlayer().pause();
      adUnit.setVideoActive(false);
      adUnit.setFinishState(FinishState.SKIPPED);
      adUnit.getSessionManager().sendSkip(adUnit);
      adUnit.getNativeBridge().invoke('AdUnit', 'setViews', [['webview']]);
      adUnit.getOverlay().hide();
      adUnit.getEndScreen().show();
  }

  public static onMute(adUnit: VideoAdUnit, muted: boolean): void {
      adUnit.getVideoPlayer().setVolume(new Double(muted ? 0.0 : 1.0));
  }

}
