import { VideoAdUnit } from 'AdUnits/VideoAdUnit';

export class VastOverlayEventHandlers {

    public static onSkip(videoAdUnit: VideoAdUnit) {
        videoAdUnit.hide();
    }

}