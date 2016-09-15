import { OverlayEventHandlers } from 'EventHandlers/OverlayEventHandlers';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';

export class VastOverlayEventHandlers extends OverlayEventHandlers {

    protected static afterSkip(videoAdUnit: VideoAdUnit) {
        videoAdUnit.hide();
    }

}