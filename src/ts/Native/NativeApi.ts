import { NativeBridge } from 'Native/NativeBridge';
import { Platform } from 'Constants/Platform';

export enum ApiPackage {
    CORE,
    ADS_CORE
}

export abstract class NativeApi {
    private static _apiPackageMapping = {
        [ApiPackage.CORE]: {android: 'com.unity3d.services.core.api', ios: 'UADSApi'},
        [ApiPackage.ADS_CORE]: {android: 'com.unity3d.services.ads.core.api', ios: 'UADSApi'}
    };

    protected _nativeBridge: NativeBridge;
    protected _apiClass: string;
    protected _apiPackage: ApiPackage;

    constructor(nativeBridge: NativeBridge, apiClass: string, apiPackage: ApiPackage = ApiPackage.CORE) {
        this._nativeBridge = nativeBridge;
        this._apiClass = apiClass;
        this._apiPackage = apiPackage;
    }

    public handleEvent(event: string, parameters: any[]) {
        throw new Error(this._apiClass + ' event ' + event + ' does not have an observable');
    }

    protected getFullApiClassName(): string {
        switch(this._nativeBridge.getPlatform()) {
            case Platform.ANDROID:
                return NativeApi._apiPackageMapping[this._apiPackage].android + '.' + this._apiClass;

            case Platform.IOS:
                return NativeApi._apiPackageMapping[this._apiPackage].ios + '.' + this._apiClass;

            default:
                return this._apiClass;
        }
    }
}
