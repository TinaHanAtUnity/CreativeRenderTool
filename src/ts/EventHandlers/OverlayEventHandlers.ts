import { Double } from 'Utilities/Double';
import { FinishState } from 'Constants/FinishState';
import { NativeBridge } from 'Native/NativeBridge';
import { SessionManager } from 'Managers/SessionManager';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { ViewConfiguration } from 'AdUnits/Containers/AdUnitContainer';

export class OverlayEventHandlers {

    public static onSkip(nativeBridge: NativeBridge, sessionManager: SessionManager, adUnit: VideoAdUnit): void {
        nativeBridge.VideoPlayer.pause();
        adUnit.setActive(false);
        adUnit.setFinishState(FinishState.SKIPPED);
        sessionManager.sendSkip(adUnit, adUnit.getVideo().getPosition());

        adUnit.getContainer().reconfigure(ViewConfiguration.ENDSCREEN);

        const overlay = adUnit.getOverlay();
        if (overlay) {
            overlay.hide();
        }

        adUnit.onFinish.trigger();
    }

    public static onMute(nativeBridge: NativeBridge, muted: boolean): void {
        nativeBridge.VideoPlayer.setVolume(new Double(muted ? 0.0 : 1.0));
    }
}
