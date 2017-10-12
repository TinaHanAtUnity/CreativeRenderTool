import { Double } from 'Utilities/Double';
import { FinishState } from 'Constants/FinishState';
import { NativeBridge } from 'Native/NativeBridge';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { ViewConfiguration } from 'AdUnits/Containers/AdUnitContainer';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { ComScoreTrackingService } from 'Utilities/ComScoreTrackingService';

export class OverlayEventHandlers {

    public static onSkip(nativeBridge: NativeBridge, operativeEventManager: OperativeEventManager, adUnit: VideoAdUnit, comScoreTrackingService: ComScoreTrackingService): void {
        const positionAtSkip = adUnit.getVideo().getPosition();
        const comScoreDuration = (adUnit.getVideo().getDuration()).toString(10);
        nativeBridge.VideoPlayer.pause();
        adUnit.setActive(false);
        adUnit.setFinishState(FinishState.SKIPPED);
        operativeEventManager.sendSkip(adUnit, positionAtSkip);
        comScoreTrackingService.sendEvent('end', adUnit.getCampaign().getSession().getId(), comScoreDuration, positionAtSkip);

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
