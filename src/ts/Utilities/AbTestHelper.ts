import { Configuration } from 'Models/Configuration';

export class AbTestHelper {

    public static isReverseProxyTestActive(abGroup: number, configuration: Configuration): boolean {
        if ((abGroup === this._proxyAbGroup16 || abGroup === this._proxyAbGroup17)
                && configuration.getCountry().match(/^CN/)) {
            return true;
        }
        return false;
    }

    public static getReverseProxyBaseUrl(abGroup: number, configuration: Configuration): string {
        if ((abGroup === this._proxyAbGroup16 || abGroup === this._proxyAbGroup17)
                && configuration.getCountry().match(/^CN/)) {
            return 'https://delivery-china.unityads.unity3d.com';
        } else {
            return 'https://adserver.unityads.unity3d.com';
        }
    }

    private static _proxyAbGroup16 = 16;
    private static _proxyAbGroup17 = 17;

}
