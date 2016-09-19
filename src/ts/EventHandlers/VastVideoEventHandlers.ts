import { VastAdUnit } from 'AdUnits/VastAdUnit';

export class VastVideoEventHandlers {

    public static onVideoCompleted(adUnit: VastAdUnit) {
        adUnit.hide();
    }
}
