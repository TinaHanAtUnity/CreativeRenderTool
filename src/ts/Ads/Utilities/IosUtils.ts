import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';

export class IosUtils {

    public static isAppSheetBroken(osVersion: string, model: string, orientation: Orientation): boolean {
        if ((model.match(/iphone/i) || model.match(/ipod/i)) && orientation === Orientation.LANDSCAPE) {
            return true; //iPhone + Landscape = crash
        } else if (osVersion.match(/^8\.[0-4]/)) {
            return true; //iOS 8 not supported
        } else if (osVersion.match(/^7\.[0-9]/)) {
            return true; //iOS 7 not supported
        } else {
            return false;
        }
    }

    public static hasVideoStallingApi(osVersion: string): boolean {
        if (osVersion.match(/^1/)) {
            return true;
        }
        return false;
    }
}
