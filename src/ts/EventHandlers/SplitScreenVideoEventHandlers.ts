import { NativeBridge } from 'Native/NativeBridge';
import { SplitScreenAdUnit } from '../AdUnits/SplitScreenAdUnit';
import { VideoEventHandlers } from 'EventHandlers/VideoEventHandlers';

export class SplitScreenVideoEventHandlers extends VideoEventHandlers {

    public static afterVideoCompleted(nativeBridge: NativeBridge, adUnit: SplitScreenAdUnit) {
        const overlay = adUnit.getOverlay();
        if(overlay) {
            overlay.hide();
        }
        adUnit.onFinish.trigger();
    }
}
