import { VideoEventHandlers } from 'EventHandlers/VideoEventHandlers';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { NativeBridge } from 'Native/NativeBridge';

export class VastVideoEventHandlers extends VideoEventHandlers {

    protected static afterVideoCompleted(nativeBridge: NativeBridge, videoAdUnit: VideoAdUnit) {
        videoAdUnit.hide();
    }
}
