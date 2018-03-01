export class IosUtils {

    public static isAppSheetBroken(osVersion: string, model: string): boolean {
        if(!model.match(/ipad/i) && osVersion.match(/^11\.[0-3]/)) {
            return true;
        } else if(osVersion.match(/^8\.[0-3]/)) {
            return true;
        } else {
            return false;
        }
    }

    public static hasVideoStallingApi(osVersion: string): boolean {
        if(osVersion.match(/^1/)) {
            return true;
        }
        return false;
    }
}
