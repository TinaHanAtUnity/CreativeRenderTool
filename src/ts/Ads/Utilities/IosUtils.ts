import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';

export class IosUtils {

    public static isAppSheetBroken(osVersion: string, model: string, orientation: Orientation): boolean {
        if ((model.match(/iphone/i) || model.match(/ipod/i)) && orientation === Orientation.LANDSCAPE) {
            return true; //iPhone + Landscape = crash
        } else if (osVersion.match(/^8\.[0-4]/)) {
            return true; //iOS 8 not supported
        } else if (osVersion.match(/^7\.[0-9]/)) {
            return true; //iOS 7 not supported
        } else if (osVersion.match(/^13\.[0-9]/)) {
            return true; //iOS 13 disabled. TODO: Allow iOS 13 in SDK 3.3+
        } else {
            return false;
        }
    }

    /**
     * Store API functionality is broken on osVersion 11.1 and below
     */
    public static isStoreApiBroken(osVersion: string | undefined): boolean {

        const osVersionSplit = osVersion ? osVersion.split('.') : '';
        if (osVersionSplit.length >= 2) {

            const majorOsVersion = +osVersionSplit[0];
            const minorOsVersion = +osVersionSplit[1];

            if (!isNaN(majorOsVersion) && !isNaN(minorOsVersion)) {
                if (majorOsVersion >= 12) {
                    return false;
                } else if (majorOsVersion === 11 && minorOsVersion >= 2) {
                    return false;
                }
            }
        }

        return true;
    }

    public static isAdUnitTransparencyBroken(osVersion: string): boolean {
        if (osVersion.match(/^13\./)) {
            return true;
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
