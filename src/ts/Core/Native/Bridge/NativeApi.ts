import { EventCategory } from 'Core/Constants/EventCategory';
import { Platform } from 'Core/Constants/Platform';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';

export enum ApiPackage {
    CORE,
    ADS,
    MONETIZATION_CORE,
    ANALYTICS,
    AR,
    BANNER,
    CHINA,
    STORE
}

export abstract class NativeApi {

    private static _apiPackageMapping = {
        [ApiPackage.CORE]: {android: 'com.unity3d.services.core.api', ios: 'USRVApi'},
        [ApiPackage.ADS]: {android: 'com.unity3d.services.ads.api', ios: 'UADSApi'},
        [ApiPackage.MONETIZATION_CORE]: {android: 'com.unity3d.services.monetization.core.api', ios: 'UMONApi'},
        [ApiPackage.ANALYTICS]: {android: 'com.unity3d.services.analytics.core.api', ios: 'UANAApi'},
        [ApiPackage.AR]: {android: 'com.unity3d.services.ar.api', ios: 'UARApi'},
        [ApiPackage.BANNER]: {android: 'com.unity3d.services.banners.api', ios: 'UADSApi'},
        [ApiPackage.CHINA]: {android: 'com.unity3d.services.china.api', ios: ''},
        [ApiPackage.STORE]: {android: 'com.unity3d.services.store.core.api', ios: 'USTRApi'}
    };

    protected _nativeBridge: NativeBridge;
    protected _apiClass: string;
    protected _apiPackage: ApiPackage;
    protected _fullApiClassName: string;

    protected constructor(nativeBridge: NativeBridge, apiClass: string, apiPackage: ApiPackage, eventCategory?: EventCategory) {
        this._nativeBridge = nativeBridge;
        this._apiClass = apiClass;
        this._apiPackage = apiPackage;
        this._fullApiClassName = this.getFullApiClassName();
        if (typeof eventCategory !== 'undefined') {
            nativeBridge.addEventHandler(eventCategory, this);
        }
    }

    public handleEvent(event: string, parameters: unknown[]) {
        throw new Error(this._apiClass + ' event ' + event + ' does not have an observable');
    }

    protected getFullApiClassName(): string {
        switch (this._nativeBridge.getPlatform()) {
            case Platform.ANDROID:
                return NativeApi._apiPackageMapping[this._apiPackage].android + '.' + this._apiClass;

            case Platform.IOS:
                return NativeApi._apiPackageMapping[this._apiPackage].ios  + this._apiClass;

            default:
                return this._apiClass;
        }
    }
}
