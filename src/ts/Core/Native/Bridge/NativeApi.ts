import { Platform } from 'Core/Constants/Platform';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { EventCategory } from 'Core/Constants/EventCategory';

export enum ApiPackage {
    CORE,
    ADS,
    AR,
    BANNER
}

export abstract class NativeApi {

    private static _apiPackageMapping = {
        [ApiPackage.CORE]: {android: 'com.unity3d.services.core.api', ios: 'USRVApi'},
        [ApiPackage.ADS]: {android: 'com.unity3d.services.ads.api', ios: 'UADSApi'},
        [ApiPackage.AR]: {android: 'com.unity3d.services.ar.api', ios: 'UARApi'},
        [ApiPackage.BANNER]: {android: 'com.unity3d.services.banner.api', ios: 'UADSApi'}
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
        if(eventCategory) {
            nativeBridge.addEventHandler(eventCategory, this);
        }
    }

    public handleEvent(event: string, parameters: any[]) {
        throw new Error(this._apiClass + ' event ' + event + ' does not have an observable');
    }

    protected getFullApiClassName(): string {
        switch(this._nativeBridge.getPlatform()) {
            case Platform.ANDROID:
                return NativeApi._apiPackageMapping[this._apiPackage].android + '.' + this._apiClass;

            case Platform.IOS:
                return NativeApi._apiPackageMapping[this._apiPackage].ios  + this._apiClass;

            default:
                return this._apiClass;
        }
    }
}
