export class IosUtils {

    public static isAppSheetBroken(osVersion: string): boolean {
        return osVersion.match(/^8\.[0-3]/) !== null;
    }

    public static hasVideoStallingApi(osVersion: string): boolean {
        if(osVersion.match(/^1/)) {
            return true;
        }
        return false;
    }
}
