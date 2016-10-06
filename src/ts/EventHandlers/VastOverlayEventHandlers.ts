import { VideoAdUnit } from 'AdUnits/VideoAdUnit';

export class VastOverlayEventHandlers {

    public static onSkip(adUnit: VideoAdUnit) {
        adUnit.hide();
    }

}