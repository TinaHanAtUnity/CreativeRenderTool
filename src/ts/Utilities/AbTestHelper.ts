import { Configuration } from 'Models/Configuration';

export class AbTestHelper {

    public static isReverseProxyTestActive(abGroup: number, configuration: Configuration): boolean {
        if (abGroup === this._reverseProxyAbGroup && configuration.getCountry().match(/^CN/)) {
            return true;
        }
        return false;
    }

    public static getReverseProxyBaseUrl(abGroup: number, configuration: Configuration): string {
        if (abGroup === this._reverseProxyAbGroup && configuration.getCountry().match(/^CN/)) {
            return 'https://delivery-china.unityads.unity3d.com';
        } else {
            return 'https://adserver.unityads.unity3d.com';
        }
    }

    private static _reverseProxyAbGroup = 16;
}
