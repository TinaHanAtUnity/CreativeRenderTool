import { RingerMode } from 'Core/Constants/Android/RingerMode';
import { StreamType } from 'Core/Constants/Android/StreamType';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { DeviceInfo, IDeviceInfo } from 'Core/Models/DeviceInfo';
import { ISensorInfo, StorageType } from 'Core/Native/Android/DeviceInfo';
import { BuildVerionCode } from 'Core/Constants/Android/BuildVerionCode';

export interface IAndroidDeviceInfo extends IDeviceInfo {
    androidId: string;
    deviceId1: string;
    deviceId2: string;
    isGoogleStoreInstalled: boolean;
    isXiaomiStoreInstalled: boolean;
    isGoogleMapsInstalled: boolean;
    isTelephonyInstalled: boolean;
    apiLevel: number;
    freeExternalSpace: number;
    totalExternalSpace: number;
    manufacturer: string;
    screenLayout: number;
    screenDensity: number;
    displayMetricDensity: number;
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
    networkMetered: boolean;
}

export class AndroidDeviceInfo extends DeviceInfo<IAndroidDeviceInfo> {
    constructor(core: ICoreApi) {
        super('AndroidDeviceInfo', {
            ... DeviceInfo.Schema,
            androidId: ['string'],
            deviceId1: ['string'],
            deviceId2: ['string'],
            isGoogleStoreInstalled: ['boolean'],
            isXiaomiStoreInstalled: ['boolean'],
            isGoogleMapsInstalled: ['boolean'],
            isTelephonyInstalled: ['boolean'],
            apiLevel: ['number'],
            freeExternalSpace: ['number'],
            totalExternalSpace: ['number'],
            manufacturer: ['string'],
            screenLayout: ['number'],
            screenDensity: ['number'],
            displayMetricDensity: ['number'],
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
            sensorList: ['array'],
            networkMetered: ['boolean']
        }, Platform.ANDROID, core);
    }

    public fetch(): Promise<unknown[]> {
        return super.fetch().then(() => {
            const promises: Promise<unknown>[] = [];

            promises.push(this._core.DeviceInfo.Android!.getAndroidId().then(androidId => this.set('androidId', androidId)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._core.DeviceInfo.Android!.getApiLevel().then(apiLevel => this.set('apiLevel', apiLevel)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._core.DeviceInfo.Android!.getTotalSpace(StorageType.INTERNAL).then(totalInternalSpace => this.set('totalInternalSpace', totalInternalSpace)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._core.DeviceInfo.Android!.getTotalSpace(StorageType.EXTERNAL).then(totalExternalSpace => this.set('totalExternalSpace', totalExternalSpace)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._core.DeviceInfo.Android!.getManufacturer().then(manufacturer => this.set('manufacturer', manufacturer)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._core.DeviceInfo.Android!.getScreenDensity().then(screenDensity => this.set('screenDensity', screenDensity)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._core.DeviceInfo.Android!.getDisplayMetricDensity().then(displayMetricDensity => this.set('displayMetricDensity', displayMetricDensity)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._core.DeviceInfo.Android!.getScreenLayout().then(screenLayout => this.set('screenLayout', screenLayout)).catch(err => this.handleDeviceInfoError(err)));
            // Workaround for 3.4.6+ - Detection based on if Google Advertising gather by super.fetch() call exists
            this.set('isGoogleStoreInstalled', !!this.get('advertisingIdentifier'));
            this.set('isXiaomiStoreInstalled', false);
            this.set('isGoogleMapsInstalled', false);
            this.set('isTelephonyInstalled', false);
            promises.push(this._core.DeviceInfo.Android!.getDeviceMaxVolume(StreamType.STREAM_MUSIC).then(maxVolume => this.set('maxVolume', maxVolume)).catch(err => this.handleDeviceInfoError(err)));
            // only add this to 2.2.1 and above
            promises.push(this._core.DeviceInfo.Android!.getApkDigest().then(apkDigest => this.set('apkDigest', apkDigest)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._core.DeviceInfo.Android!.getCertificateFingerprint().then(certificateFingerPrint => this.set('certificateFingerPrint', certificateFingerPrint)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._core.DeviceInfo.Android!.getBoard().then(board => this.set('board', board)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._core.DeviceInfo.Android!.getBootloader().then(bootLoader => this.set('bootLoader', bootLoader)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._core.DeviceInfo.Android!.getBrand().then(brand => this.set('brand', brand)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._core.DeviceInfo.Android!.getDevice().then(device => this.set('device', device)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._core.DeviceInfo.Android!.getHardware().then(hardware => this.set('hardware', hardware)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._core.DeviceInfo.Android!.getHost().then(host => this.set('host', host)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._core.DeviceInfo.Android!.getProduct().then(product => this.set('product', product)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._core.DeviceInfo.Android!.getFingerprint().then(fingerPrint => this.set('fingerPrint', fingerPrint)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._core.DeviceInfo.Android!.getSupportedAbis().then(supportedAbis => this.set('supportedAbis', supportedAbis)).catch(err => this.handleDeviceInfoError(err)));

            return Promise.all(promises);
        });
    }

    public getStores(): string {
        let storeString = '';

        if (this.isGoogleStoreInstalled()) {
            storeString = 'google';
        } else {
            // There is no live campaign for Xiaomi Store anymore.
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

    public isGoogleMapsInstalled(): boolean {
        return this.get('isGoogleMapsInstalled');
    }

    public isTelephonyInstalled(): boolean {
        return this.get('isTelephonyInstalled');
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

    public getDisplayMetricDensity(): number {
        return this.get('displayMetricDensity');
    }

    public getScreenDensity(): number {
        return this.get('screenDensity');
    }

    public getFreeSpaceExternal(): Promise<number> {
        return this._core.DeviceInfo.Android!.getFreeSpace(StorageType.EXTERNAL).then(freeSpace => {
            this.set('freeExternalSpace', freeSpace);
            return this.get('freeExternalSpace');
        });
    }

    public getTotalSpaceExternal(): number {
        return this.get('totalExternalSpace');
    }

    public getRingerMode(): Promise<RingerMode> {
        return this._core.DeviceInfo.Android!.getRingerMode().then(ringerMode => {
            this.set('ringerMode', ringerMode);
            return this.get('ringerMode');
        });
    }

    public isUSBConnected(): Promise<boolean> {
        return this._core.DeviceInfo.Android!.isUSBConnected().then(isConnected => {
            this.set('usbConnected', isConnected);
            return this.get('usbConnected');
        });
    }

    public getUptime(): Promise<number> {
        return this._core.DeviceInfo.Android!.getUptime().then(upTime => {
            this.set('upTime', upTime);
            return this.get('upTime');
        });
    }

    public getElapsedRealtime(): Promise<number> {
        return this._core.DeviceInfo.Android!.getElapsedRealtime().then(elapsedRealtime => {
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

    public getSensorList(): Promise<ISensorInfo[]> {
        return this._core.DeviceInfo.Android!.getSensorList().then(sensorList => {
            this.set('sensorList', sensorList);
            return this.get('sensorList');
        });
    }

    public getNetworkMetered(): Promise<boolean> {
        return this._core.DeviceInfo.Android!.getNetworkMetered().then(isNetworkMetered => {
            this.set('networkMetered', isNetworkMetered);
            return this.get('networkMetered');
        });
    }

    public getFreeSpace(): Promise<number> {
        return this._core.DeviceInfo.Android!.getFreeSpace(StorageType.INTERNAL).then(freeInternalSpace => {
            this.set('freeInternalSpace', freeInternalSpace);
            return this.get('freeInternalSpace');
        });
    }

    public getDTO(): Promise<{ [key: string]: unknown }> {
        return super.getDTO().then(commonDTO => {
            const dto: { [key: string]: unknown } = {
                ... commonDTO,
                'apiLevel': this.getApiLevel(),
                'deviceMake': this.getManufacturer(),
                'screenLayout': this.getScreenLayout(),
                'screenDensity': this.getScreenDensity(),
                'displayMetricDensity': this.getDisplayMetricDensity(),
                'totalSpaceExternal': this.getTotalSpaceExternal()
            };

            if (!this.getAdvertisingIdentifier()) {
                dto.androidId = this.getAndroidId();
            }

            return Promise.all([
                this.getFreeSpaceExternal().catch(err => this.handleDeviceInfoError(err)),
                this.getRingerMode().catch(err => this.handleDeviceInfoError(err)),
                this.isUSBConnected().catch(err => this.handleDeviceInfoError(err)),
                this.getNetworkMetered().catch(err => this.handleDeviceInfoError(err))
            ]).then(([
                freeSpaceExternal,
                ringerMode,
                usbConnected,
                networkMetered
            ]) => {
                dto.freeSpaceExternal = freeSpaceExternal;
                dto.ringerMode = ringerMode;
                dto.usbConnected = usbConnected;
                dto.networkMetered = networkMetered;

                return dto;
            });
        });
    }

    public getAnonymousDTO(): Promise<{ [key: string]: unknown }> {
        return super.getAnonymousDTO().then((commonDTO) => {
            const dto: { [key: string]: unknown } = {
                ... commonDTO,
                'apiLevel': this.getApiLevel(),
                'deviceMake': this.getManufacturer(),
                'screenLayout': this.getScreenLayout(),
                'screenDensity': this.getScreenDensity(),
                'displayMetricDensity': this.getDisplayMetricDensity(),
                'totalSpaceExternal': this.getTotalSpaceExternal()
            };

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

    public getStaticDTO(): { [key: string]: unknown } {
        const dto: { [key: string]: unknown } = {
            ... super.getStaticDTO(),
            'apiLevel': this.getApiLevel(),
            'deviceMake': this.getManufacturer(),
            'screenLayout': this.getScreenLayout(),
            'screenDensity': this.getScreenDensity(),
            'displayMetricDensity': this.getDisplayMetricDensity(),
            'totalSpaceExternal': this.getTotalSpaceExternal()
        };

        if (!this.getAdvertisingIdentifier()) {
            dto.androidId = this.getAndroidId();
        }

        return dto;
    }

    public getAnonymousStaticDTO(): { [key: string]: unknown } {
        return {
            ... super.getAnonymousStaticDTO(),
            'apiLevel': this.getApiLevel(),
            'deviceMake': this.getManufacturer(),
            'screenLayout': this.getScreenLayout(),
            'screenDensity': this.getScreenDensity(),
            'displayMetricDensity': this.getDisplayMetricDensity(),
            'totalSpaceExternal': this.getTotalSpaceExternal()
        };
    }
}
