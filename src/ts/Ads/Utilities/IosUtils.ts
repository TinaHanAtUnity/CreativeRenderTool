import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';

export class IosUtils {

    public static isAppSheetBroken(osVersion: string, model: string, orientation: Orientation): boolean {
        if (!model.match(/ipad/i) && orientation === Orientation.LANDSCAPE) {
            return true; //iPhone + Landscape = crash
        } else if (osVersion.match(/^8\.[0-3]/)) {
            return true; //iOS 8 not supported
        } else if (osVersion.match(/^7\.[0-9]/)) {
            return true; //iOS 7 not supported
        } else {
            return false;
        }

        // to disable iOS 12: osVersion.match(/^12\.[0-9]/)
        // to disable iOS 11: osVersion.match(/^11\.[0-4]/)
    }

    public static hasVideoStallingApi(osVersion: string): boolean {
        if (osVersion.match(/^1/)) {
            return true;
        }
        return false;
    }
}
