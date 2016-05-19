import { VideoEventHandlers } from 'EventHandlers/VideoEventHandlers';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';

export class VastVideoEventHandlers extends VideoEventHandlers {

    protected static afterVideoCompleted(adUnit: VideoAdUnit) {
        adUnit.hide();
    }

}