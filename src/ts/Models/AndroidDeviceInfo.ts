import { DeviceInfo, IDeviceInfo } from 'Models/DeviceInfo';
import { NativeBridge } from 'Native/NativeBridge';
import { RingerMode } from 'Constants/Android/RingerMode';
import { ISensorInfo, StorageType } from 'Native/Api/AndroidDeviceInfo';
import { StreamType } from 'Constants/Android/StreamType';

export interface IAndroidDeviceInfo extends IDeviceInfo {
    androidId: string;
    isGoogleStoreInstalled: boolean;
    isXiaomiStoreInstalled: boolean;
    apiLevel: number;
    freeExternalSpace: number;
    totalExternalSpace: number;
    manufacturer: string;
    screenLayout: number;
    screenDensity: number;
    ringerMode: RingerMode;
    apkDigest: string;
    certificateFingerPrint: string;
    board: string;
    bootLoader: string;
    brand: string;
    device: string;
    hardware: string;
    host: string;
    product: string;
    fingerPrint: string;
    supportedAbis: string[];
    usbConnected: boolean;
    upTime: number;
    elapsedRealtime: number;
    sensorList: ISensorInfo[];
}

export class AndroidDeviceInfo extends DeviceInfo<IAndroidDeviceInfo> {

    public static GooglePlayPackageName = 'com.android.vending';
    public static XiaomiPackageName = 'com.xiaomi.gamecenter';

    constructor(nativeBridge: NativeBridge) {
        super('AndroidDeviceInfo', {
            ... DeviceInfo.Schema,
            androidId: ['string'],
            isGoogleStoreInstalled: ['boolean'],
            isXiaomiStoreInstalled: ['boolean'],
            apiLevel: ['number'],
            freeExternalSpace: ['number'],
            totalExternalSpace: ['number'],
            manufacturer: ['string'],
            screenLayout: ['number'],
            screenDensity: ['number'],
            ringerMode: ['number'],
            apkDigest: ['string'],
            certificateFingerPrint: ['string'],
            board: ['string'],
            bootLoader: ['string'],
            brand: ['string'],
            device: ['string'],
            hardware: ['string'],
            host: ['string'],
            product: ['string'],
            fingerPrint: ['string'],
            supportedAbis: ['array'],
            usbConnected: ['boolean'],
            upTime: ['number'],
            elapsedRealtime: ['number'],
            sensorList: ['array']
        }, nativeBridge);
    }

    public fetch(): Promise<any[]> {
        return super.fetch().then(() => {
            const promises: Array<Promise<any>> = [];

            promises.push(this._nativeBridge.DeviceInfo.Android.getAndroidId().then(androidId => this.set('androidId', androidId)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._nativeBridge.DeviceInfo.Android.getApiLevel().then(apiLevel => this.set('apiLevel', apiLevel)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._nativeBridge.DeviceInfo.Android.getTotalSpace(StorageType.INTERNAL).then(totalInternalSpace => this.set('totalInternalSpace', totalInternalSpace)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._nativeBridge.DeviceInfo.Android.getTotalSpace(StorageType.EXTERNAL).then(totalExternalSpace => this.set('totalExternalSpace', totalExternalSpace)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._nativeBridge.DeviceInfo.Android.getManufacturer().then(manufacturer => this.set('manufacturer', manufacturer)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._nativeBridge.DeviceInfo.Android.getScreenDensity().then(screenDensity => this.set('screenDensity', screenDensity)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._nativeBridge.DeviceInfo.Android.getScreenLayout().then(screenLayout => this.set('screenLayout', screenLayout)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._nativeBridge.DeviceInfo.Android.isAppInstalled(AndroidDeviceInfo.GooglePlayPackageName).then(isGoogleInstalled => this.set('isGoogleStoreInstalled', isGoogleInstalled)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._nativeBridge.DeviceInfo.Android.isAppInstalled(AndroidDeviceInfo.XiaomiPackageName).then(isXiaomiInstalled => this.set('isXiaomiStoreInstalled', isXiaomiInstalled)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._nativeBridge.DeviceInfo.Android.getDeviceMaxVolume(StreamType.STREAM_MUSIC).then(maxVolume => this.set('maxVolume', maxVolume)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._nativeBridge.DeviceInfo.Android.getCertificateFingerprint().then(certificateFingerPrint => this.set('certificateFingerPrint', certificateFingerPrint)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._nativeBridge.DeviceInfo.Android.getBoard().then(board => this.set('board', board)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._nativeBridge.DeviceInfo.Android.getBootloader().then(bootLoader => this.set('bootLoader', bootLoader)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._nativeBridge.DeviceInfo.Android.getBrand().then(brand => this.set('brand', brand)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._nativeBridge.DeviceInfo.Android.getDevice().then(device => this.set('device', device)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._nativeBridge.DeviceInfo.Android.getHardware().then(hardware => this.set('hardware', hardware)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._nativeBridge.DeviceInfo.Android.getHost().then(host => this.set('host', host)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._nativeBridge.DeviceInfo.Android.getProduct().then(product => this.set('product', product)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._nativeBridge.DeviceInfo.Android.getFingerprint().then(fingerPrint => this.set('fingerPrint', fingerPrint)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._nativeBridge.DeviceInfo.Android.getSupportedAbis().then(supportedAbis => this.set('supportedAbis', supportedAbis)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._nativeBridge.DeviceInfo.Android.getSensorList().then(sensorList => this.set('sensorList', sensorList)).catch(err => this.handleDeviceInfoError(err)));

            return Promise.all(promises);
        });
    }

    public getStores(): string {
        let storeString = '';

        if (this.isGoogleStoreInstalled()) {
            storeString = 'google';
        }
        if (this.isXiaomiStoreInstalled()) {
            storeString = 'xiaomi';
        }
        if (this.isXiaomiStoreInstalled() && this.isGoogleStoreInstalled()) {
            storeString = 'xiaomi,google';
        }
        if (!this.isXiaomiStoreInstalled() && !this.isGoogleStoreInstalled()) {
            storeString = 'none';
        }

        return storeString;
    }

    public isGoogleStoreInstalled(): boolean {
        return this.get('isGoogleStoreInstalled');
    }

    public isXiaomiStoreInstalled(): boolean {
        return this.get('isXiaomiStoreInstalled');
    }

    public getAndroidId(): string {
        return this.get('androidId');
    }

    public getApiLevel(): number {
        return this.get('apiLevel');
    }

    public getManufacturer(): string {
        return this.get('manufacturer');
    }

    public getScreenLayout(): number {
        return this.get('screenLayout');
    }

    public getScreenDensity(): number {
        return this.get('screenDensity');
    }

    public getFreeSpaceExternal(): Promise<number> {
        return this._nativeBridge.DeviceInfo.Android.getFreeSpace(StorageType.EXTERNAL).then(freeSpace => {
            this.set('freeExternalSpace', freeSpace);
            return this.get('freeExternalSpace');
        });
    }

    public getTotalSpaceExternal(): number {
        return this.get('totalExternalSpace');
    }

    public getRingerMode(): Promise<RingerMode> {
        return this._nativeBridge.DeviceInfo.Android.getRingerMode().then(ringerMode => {
            this.set('ringerMode', ringerMode);
            return this.get('ringerMode');
        });
    }

    public isUSBConnected(): Promise<boolean> {
        return this._nativeBridge.DeviceInfo.Android.isUSBConnected().then(isConnected => {
            this.set('usbConnected', isConnected);
            return this.get('usbConnected');
        });
    }

    public getUptime(): Promise<number> {
        return this._nativeBridge.DeviceInfo.Android.getUptime().then(upTime => {
            this.set('upTime', upTime);
            return this.get('upTime');
        });
    }

    public getElapsedRealtime(): Promise<number> {
        return this._nativeBridge.DeviceInfo.Android.getElapsedRealtime().then(elapsedRealtime => {
            this.set('elapsedRealtime', elapsedRealtime);
            return this.get('elapsedRealtime');
        });
    }

    public getApkDigest(): string {
        return this.get('apkDigest');
    }

    public getCertificateFingerprint(): string {
        return this.get('certificateFingerPrint');
    }

    public getBoard(): string {
        return this.get('board');
    }

    public getBootloader(): string {
        return this.get('bootLoader');
    }

    public getBrand(): string {
        return this.get('brand');
    }

    public getDevice(): string {
        return this.get('device');
    }

    public getHardware(): string {
        return this.get('hardware');
    }

    public getHost(): string {
        return this.get('host');
    }

    public getProduct(): string {
        return this.get('product');
    }

    public getFingerprint(): string {
        return this.get('fingerPrint');
    }

    public getSupportedAbis(): string[] {
        return this.get('supportedAbis');
    }

    public getSensorList(): ISensorInfo[] {
        return this.get('sensorList');
    }

    public getDTO(): Promise<any> {
        return super.getDTO().then((commonDTO) => {
            const dto: any = {
                ... commonDTO,
                'apiLevel': this.getApiLevel(),
                'deviceMake': this.getManufacturer(),
                'screenLayout': this.getScreenLayout(),
                'screenDensity': this.getScreenDensity(),
                'totalSpaceExternal': this.getTotalSpaceExternal(),
            };

            if(!this.getAdvertisingIdentifier()) {
                dto.androidId = this.getAndroidId();
            }

            return Promise.all([
                this.getFreeSpaceExternal().catch(err => this.handleDeviceInfoError(err)),
                this.getRingerMode().catch(err => this.handleDeviceInfoError(err))
            ]).then(([
                freeSpaceExternal,
                ringerMode
            ]) => {
                dto.freeSpaceExternal = freeSpaceExternal;
                dto.ringerMode = ringerMode;

                return dto;
            });
        });
    }

    public getStaticDTO(): any {
        const dto: any = {
            ... super.getDTO(),
            'apiLevel': this.getApiLevel(),
            'deviceMake': this.getManufacturer(),
            'screenLayout': this.getScreenLayout(),
            'screenDensity': this.getScreenDensity(),
            'totalSpaceExternal': this.getTotalSpaceExternal(),
        };

        if(!this.getAdvertisingIdentifier()) {
            dto.androidId = this.getAndroidId();
        }

        return dto;
    }
}
