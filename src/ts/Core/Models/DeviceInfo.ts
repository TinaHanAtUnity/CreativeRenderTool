import { BatteryStatus } from 'Core/Constants/Android/BatteryStatus';
import { StreamType } from 'Core/Constants/Android/StreamType';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { ISchema, Model } from 'Core/Models/Model';

export interface IDeviceInfo {
    advertisingIdentifier: string | undefined | null;
    connectionType: string;
    timeZone: string;
    volume: number;
    networkOperator: string | null;
    networkOperatorName: string | null;
    screenWidth: number;
    screenHeight: number;
    screenBrightness: number;
    limitAdTracking: boolean | undefined;
    osVersion: string;
    model: string;
    rooted: boolean;
    language: string;
    freeInternalSpace: number;
    totalInternalSpace: number;
    networkType: number;
    batteryLevel: number;
    batteryStatus: BatteryStatus;
    freeMemory: number;
    totalMemory: number;
    cpuCount: number;
    maxVolume: number;
    headset: boolean;
    isChineseNetworkOperator: boolean;
}

export abstract class DeviceInfo<T extends IDeviceInfo = IDeviceInfo> extends Model<T> {

    public static Schema: ISchema<IDeviceInfo> = {
        advertisingIdentifier: ['string', 'undefined', 'null'],
        connectionType: ['string'],
        timeZone: ['string'],
        volume: ['number'],
        networkOperator: ['string', 'null'],
        networkOperatorName: ['string', 'null'],
        screenWidth: ['integer'],
        screenHeight: ['integer'],
        screenBrightness: ['number'],
        limitAdTracking: ['boolean', 'undefined'],
        osVersion: ['string'],
        model: ['string'],
        rooted: ['boolean'],
        language: ['string'],
        freeInternalSpace: ['number'],
        totalInternalSpace: ['number'],
        networkType: ['number'],
        batteryLevel: ['number'],
        batteryStatus: ['number'],
        freeMemory: ['number'],
        totalMemory: ['number'],
        cpuCount: ['integer'],
        maxVolume: ['number'],
        headset: ['boolean'],
        isChineseNetworkOperator: ['boolean']
    };

    protected _platform: Platform;
    protected _core: ICoreApi;

    constructor(name: string, schema: ISchema<T>, platform: Platform, core: ICoreApi) {
        super('DeviceInfo', schema);

        this._platform = platform;
        this._core = core;
    }

    public fetch(): Promise<unknown[]> {
        const promises: Promise<unknown>[] = [];

        promises.push(this._core.DeviceInfo.getAdvertisingTrackingId().then(advertisingIdentifier => this.set('advertisingIdentifier', advertisingIdentifier)).catch(err => this.handleDeviceInfoError(err)));
        promises.push(this._core.DeviceInfo.getLimitAdTrackingFlag().then(limitAdTracking => this.set('limitAdTracking', limitAdTracking)).catch(err => this.handleDeviceInfoError(err)));
        promises.push(this._core.DeviceInfo.getOsVersion().then(osVersion => this.set('osVersion', osVersion)).catch(err => this.handleDeviceInfoError(err)));
        promises.push(this._core.DeviceInfo.getModel().then(model => this.set('model', model)).catch(err => this.handleDeviceInfoError(err)));
        promises.push(this._core.DeviceInfo.getScreenWidth().then(screenWidth => this.set('screenWidth', Math.floor(screenWidth))).catch(err => this.handleDeviceInfoError(err)));
        promises.push(this._core.DeviceInfo.getScreenHeight().then(screenHeight => this.set('screenHeight', Math.floor(screenHeight))).catch(err => this.handleDeviceInfoError(err)));
        promises.push(this._core.DeviceInfo.getSystemLanguage().then(language => this.set('language', language)).catch(err => this.handleDeviceInfoError(err)));
        promises.push(this._core.DeviceInfo.isRooted().then(rooted => this.set('rooted', rooted)).catch(err => this.handleDeviceInfoError(err)));
        promises.push(this._core.DeviceInfo.getTimeZone(false).then(timeZone => this.set('timeZone', timeZone)).catch(err => this.handleDeviceInfoError(err)));
        promises.push(this._core.DeviceInfo.getTotalMemory().then(totalMemory => this.set('totalMemory', totalMemory)).catch(err => this.handleDeviceInfoError(err)));
        promises.push(this._core.DeviceInfo.getCPUCount().then(cpuCount => this.set('cpuCount', cpuCount)).catch(err => this.handleDeviceInfoError(err)));
        promises.push(this._core.DeviceInfo.getNetworkOperator().then(networkOperator => this.set('isChineseNetworkOperator', !!(networkOperator && networkOperator.length >= 3 && networkOperator.substring(0, 3) === '460'))).catch(err => this.handleDeviceInfoError(err)));
        return Promise.all(promises);
    }

    public abstract getStores(): string;

    public isChineseNetworkOperator(): boolean | undefined {
        return this.get('isChineseNetworkOperator');
    }

    public getAdvertisingIdentifier(): string | undefined | null {
        return this.get('advertisingIdentifier');
    }

    public getLimitAdTracking(): boolean | undefined {
        return this.get('limitAdTracking');
    }

    public getModel(): string {
        return this.get('model');
    }

    public getNetworkType(): Promise<number> {
        return this._core.DeviceInfo.getNetworkType().then(networkType => {
            this.set('networkType', networkType);
            return this.get('networkType');
        });
    }

    public getNetworkOperator(): Promise<string | null> {
        if (this._platform === Platform.IOS || this._platform === Platform.ANDROID) {
            return this._core.DeviceInfo.getNetworkOperator().then(networkOperator => {
                this.set('networkOperator', networkOperator);
                return this.get('networkOperator');
            });
        } else {
            return Promise.resolve(this.get('networkOperator'));
        }
    }

    public getNetworkOperatorName(): Promise<string | null> {
        if (this._platform === Platform.IOS || this._platform === Platform.ANDROID) {
            return this._core.DeviceInfo.getNetworkOperatorName().then(networkOperatorName => {
                this.set('networkOperatorName', networkOperatorName);
                return this.get('networkOperatorName');
            });
        } else {
            return Promise.resolve(this.get('networkOperatorName'));
        }
    }

    public getOsVersion(): string {
        return this.get('osVersion');
    }

    public getScreenWidth(): Promise<number> {
        return this._core.DeviceInfo.getScreenWidth().then(screenWidth => {
            const adjustedScreenWidth = Math.floor(screenWidth);
            this.set('screenWidth', adjustedScreenWidth);
            return adjustedScreenWidth;
        });
    }

    public getScreenHeight(): Promise<number> {
        return this._core.DeviceInfo.getScreenHeight().then(screenHeight => {
            const adjustedScreenHeight = Math.floor(screenHeight);
            this.set('screenHeight', adjustedScreenHeight);
            return adjustedScreenHeight;
        });
    }

    public isRooted(): boolean {
        return this.get('rooted');
    }

    public getConnectionType(): Promise<string> {
        return this._core.DeviceInfo.getConnectionType().then(connectionType => {
            this.set('connectionType', connectionType);
            return this.get('connectionType');
        });
    }

    public getTimeZone(): string {
        return this.get('timeZone');
    }

    public abstract getFreeSpace(): Promise<number>;

    public getTotalSpace(): number {
        return this.get('totalInternalSpace');
    }

    public getLanguage(): string {
        return this.get('language');
    }

    public getHeadset(): Promise<boolean> {
        return this._core.DeviceInfo.getHeadset().then(headset => {
            this.set('headset', headset);
            return this.get('headset');
        });
    }

    public getDeviceVolume(streamType: StreamType = StreamType.STREAM_SYSTEM): Promise<number> {
        if (this._platform  === Platform.IOS) {
            return this._core.DeviceInfo.Ios!.getDeviceVolume().then(volume => {
                this.set('volume', volume);
                return this.get('volume');
            });
        } else if (this._platform === Platform.ANDROID) {
            return this._core.DeviceInfo.Android!.getDeviceVolume(streamType).then(volume => {
                this.set('volume', volume);
                return this.get('volume');
            });
        } else {
            return Promise.resolve(this.get('volume'));
        }
    }

    public checkIsMuted(): Promise<void> {
        if (this._platform  === Platform.IOS) {
            return this._core.DeviceInfo.Ios!.checkIsMuted().then(finished => {
                // Return nothing, as the value is collected through sendEvent API
            });
        }
        return Promise.resolve();
    }

    public getScreenBrightness(): Promise<number> {
        return this._core.DeviceInfo.getScreenBrightness().then(brightness => {
            this.set('screenBrightness', brightness);
            return this.get('screenBrightness');
        });
    }

    public getBatteryLevel(): Promise<number> {
        return this._core.DeviceInfo.getBatteryLevel().then(level => {
            this.set('batteryLevel', level);
            return this.get('batteryLevel');
        });
    }

    public getBatteryStatus(): Promise<BatteryStatus> {
        return this._core.DeviceInfo.getBatteryStatus().then(batteryStatus => {
            this.set('batteryStatus', batteryStatus);
            return this.get('batteryStatus');
        });
    }

    public getFreeMemory(): Promise<number> {
        return this._core.DeviceInfo.getFreeMemory().then(freeMemory => {
            this.set('freeMemory', freeMemory);
            return this.get('freeMemory');
        });
    }

    public getTotalMemory(): number {
        return this.get('totalMemory');
    }

    public getDTO(): Promise<{ [key: string]: unknown }> {
        return this.getAnonymousDTO().then(dto => {
            if (this.getAdvertisingIdentifier()) {
                dto.advertisingTrackingId = this.getAdvertisingIdentifier();
                dto.limitAdTracking = this.getLimitAdTracking();
            }

            return dto;
        });
    }

    public getAnonymousDTO(): Promise<{ [key: string]: unknown }> {
        return Promise.all<unknown>([
            this.getConnectionType().catch(err => this.handleDeviceInfoError(err)),
            this.getNetworkType().catch(err => this.handleDeviceInfoError(err)),
            this.getNetworkOperator().catch(err => this.handleDeviceInfoError(err)),
            this.getNetworkOperatorName().catch(err => this.handleDeviceInfoError(err)),
            this.getHeadset().catch(err => this.handleDeviceInfoError(err)),
            this.getDeviceVolume().catch(err => this.handleDeviceInfoError(err)),
            this.getScreenWidth().catch(err => this.handleDeviceInfoError(err)),
            this.getScreenHeight().catch(err => this.handleDeviceInfoError(err)),
            this.getScreenBrightness().catch(err => this.handleDeviceInfoError(err)),
            this.getFreeSpace().catch(err => this.handleDeviceInfoError(err)),
            this.getBatteryLevel().catch(err => this.handleDeviceInfoError(err)),
            this.getBatteryStatus().catch(err => this.handleDeviceInfoError(err)),
            this.getFreeMemory().catch(err => this.handleDeviceInfoError(err))
        ]).then(([
            connectionType,
            networkType,
            networkOperator,
            networkOperatorName,
            headset,
            deviceVolume,
            screenWidth,
            screenHeight,
            screenBrightness,
            freeSpace,
            batteryLevel,
            batteryStatus,
            freeMemory
        ]) => {
            return {
                'osVersion': this.getOsVersion(),
                'deviceModel': this.getModel(),
                'connectionType': connectionType,
                'networkType': networkType,
                'screenWidth': screenWidth,
                'screenHeight': screenHeight,
                'networkOperator': networkOperator,
                'networkOperatorName': networkOperatorName,
                'timeZone': this.getTimeZone(),
                'headset': headset,
                'language': this.getLanguage(),
                'deviceVolume': deviceVolume,
                'screenBrightness': screenBrightness,
                'freeSpaceInternal': freeSpace,
                'totalSpaceInternal': this.getTotalSpace(),
                'batteryLevel': batteryLevel,
                'batteryStatus': batteryStatus,
                'freeMemory': freeMemory,
                'totalMemory': this.getTotalMemory(),
                'rooted': this.isRooted()
            };
        });
    }

    public getStaticDTO(): { [key: string]: unknown } {
        const dto = this.getAnonymousStaticDTO();

        if (this.getAdvertisingIdentifier()) {
            dto.advertisingTrackingId = this.getAdvertisingIdentifier();
            dto.limitAdTracking = this.getLimitAdTracking();
        }

        return dto;
    }

    public getAnonymousStaticDTO(): { [key: string]: unknown } {
        return {
            'osVersion': this.getOsVersion(),
            'deviceModel': this.getModel(),
            'timeZone': this.getTimeZone(),
            'language': this.getLanguage(),
            'totalSpaceInternal': this.getTotalSpace(),
            'totalMemory': this.getTotalMemory(),
            'rooted': this.isRooted()
        };
    }

    protected handleDeviceInfoError(error: unknown) {
        this._core.Sdk.logWarning(JSON.stringify(error));
    }
}
