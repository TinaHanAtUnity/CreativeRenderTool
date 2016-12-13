export class IosUtils {

    public static isAppSheetBroken(osVersion: string): boolean {
        return osVersion.match(/^8\.[0-3]/) !== null;
    }
}
