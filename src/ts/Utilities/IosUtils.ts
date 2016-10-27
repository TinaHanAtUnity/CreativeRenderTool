export class IosUtils {

    public static isAppSheetBroken(osVersion: string): boolean {
        if(osVersion.match('^(8.0|8.1|8.2|8.3)')) {
            return true;
        }
        return false;
    }
}