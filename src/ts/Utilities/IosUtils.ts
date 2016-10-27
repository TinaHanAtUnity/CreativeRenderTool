export class IosUtils {

    public static isAppSheetBroken(osVersion: string): boolean {
        if(osVersion.indexOf('8.0') === 0 || osVersion.indexOf('8.1') === 0
            || osVersion.indexOf('8.2') === 0 || osVersion.indexOf('8.3') === 0) {
            return true;
        }
        return false;
    }
}