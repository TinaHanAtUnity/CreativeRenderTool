export class IosUtils {

    public static isAppSheetBroken(osVersion: string): boolean {
        if(osVersion.match('^[8]+\\.?[0-3]')) {
            return true;
        }
        return false;
    }
}