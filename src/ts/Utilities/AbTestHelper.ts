import { Configuration, CacheMode } from 'Models/Configuration';

export class AbTestHelper {

    private static _cacheModeForcedAbGroup: number = -1;
    private static _cacheModeAllowedAbGroup: number = -1;


    public static isCacheModeAbTestActive(abGroup: number): boolean {
        if (abGroup === this._cacheModeAllowedAbGroup || abGroup === this._cacheModeForcedAbGroup) {
            return true;
        }
        return false;
    }

    public static getCacheMode(abGroup: number, configuration: Configuration): CacheMode {
        if (abGroup === this._cacheModeForcedAbGroup) {
            return CacheMode.FORCED;
        } else if (abGroup === this._cacheModeAllowedAbGroup) {
            return CacheMode.ALLOWED;
        } else {
            return configuration.getCacheMode();
        }
    }
}