import { StreamType } from 'Core/Constants/Android/StreamType';
import { Platform } from 'Core/Constants/Platform';
import { Model } from 'Core/Models/Model';
export class DeviceInfo extends Model {
    constructor(name, schema, platform, core) {
        super('DeviceInfo', schema);
        this._platform = platform;
        this._core = core;
    }
    fetch() {
        const promises = [];
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
        promises.push(this._core.DeviceInfo.getNetworkOperator().then(networkOperator => this.set('networkOperator', networkOperator)).catch(err => this.handleDeviceInfoError(err)));
        return Promise.all(promises);
    }
    isChineseNetworkOperator() {
        const networkOperator = this.get('networkOperator');
        return !!(networkOperator && networkOperator.length >= 3 && networkOperator.substring(0, 3) === '460');
    }
    getAdvertisingIdentifier() {
        return this.get('advertisingIdentifier');
    }
    getLimitAdTracking() {
        return this.get('limitAdTracking');
    }
    getModel() {
        return this.get('model');
    }
    getNetworkType() {
        return this._core.DeviceInfo.getNetworkType().then(networkType => {
            this.set('networkType', networkType);
            return this.get('networkType');
        });
    }
    getNetworkOperator() {
        if (this._platform === Platform.IOS || this._platform === Platform.ANDROID) {
            return this._core.DeviceInfo.getNetworkOperator().then(networkOperator => {
                this.set('networkOperator', networkOperator);
                return this.get('networkOperator');
            });
        }
        else {
            return Promise.resolve(this.get('networkOperator'));
        }
    }
    getNetworkOperatorName() {
        if (this._platform === Platform.IOS || this._platform === Platform.ANDROID) {
            return this._core.DeviceInfo.getNetworkOperatorName().then(networkOperatorName => {
                this.set('networkOperatorName', networkOperatorName);
                return this.get('networkOperatorName');
            });
        }
        else {
            return Promise.resolve(this.get('networkOperatorName'));
        }
    }
    getOsVersion() {
        return this.get('osVersion');
    }
    getScreenWidth() {
        return this._core.DeviceInfo.getScreenWidth().then(screenWidth => {
            const adjustedScreenWidth = Math.floor(screenWidth);
            this.set('screenWidth', adjustedScreenWidth);
            return adjustedScreenWidth;
        });
    }
    getScreenHeight() {
        return this._core.DeviceInfo.getScreenHeight().then(screenHeight => {
            const adjustedScreenHeight = Math.floor(screenHeight);
            this.set('screenHeight', adjustedScreenHeight);
            return adjustedScreenHeight;
        });
    }
    isRooted() {
        return this.get('rooted');
    }
    getConnectionType() {
        return this._core.DeviceInfo.getConnectionType().then(connectionType => {
            this.set('connectionType', connectionType);
            return this.get('connectionType');
        });
    }
    getTimeZone() {
        return this.get('timeZone');
    }
    getTotalSpace() {
        return this.get('totalInternalSpace');
    }
    getLanguage() {
        return this.get('language');
    }
    getHeadset() {
        return this._core.DeviceInfo.getHeadset().then(headset => {
            this.set('headset', headset);
            return this.get('headset');
        });
    }
    getDeviceVolume(streamType = StreamType.STREAM_SYSTEM) {
        if (this._platform === Platform.IOS) {
            return this._core.DeviceInfo.Ios.getDeviceVolume().then(volume => {
                this.set('volume', volume);
                return this.get('volume');
            });
        }
        else if (this._platform === Platform.ANDROID) {
            return this._core.DeviceInfo.Android.getDeviceVolume(streamType).then(volume => {
                this.set('volume', volume);
                return this.get('volume');
            });
        }
        else {
            return Promise.resolve(this.get('volume'));
        }
    }
    checkIsMuted() {
        if (this._platform === Platform.IOS) {
            return this._core.DeviceInfo.Ios.checkIsMuted().then(finished => {
                // Return nothing, as the value is collected through sendEvent API
            });
        }
        return Promise.resolve();
    }
    getScreenBrightness() {
        return this._core.DeviceInfo.getScreenBrightness().then(brightness => {
            this.set('screenBrightness', brightness);
            return this.get('screenBrightness');
        });
    }
    getBatteryLevel() {
        return this._core.DeviceInfo.getBatteryLevel().then(level => {
            this.set('batteryLevel', level);
            return this.get('batteryLevel');
        });
    }
    getBatteryStatus() {
        return this._core.DeviceInfo.getBatteryStatus().then(batteryStatus => {
            this.set('batteryStatus', batteryStatus);
            return this.get('batteryStatus');
        });
    }
    getFreeMemory() {
        return this._core.DeviceInfo.getFreeMemory().then(freeMemory => {
            this.set('freeMemory', freeMemory);
            return this.get('freeMemory');
        });
    }
    getTotalMemory() {
        return this.get('totalMemory');
    }
    getDTO() {
        return this.getAnonymousDTO().then(dto => {
            if (this.getAdvertisingIdentifier()) {
                dto.advertisingTrackingId = this.getAdvertisingIdentifier();
                dto.limitAdTracking = this.getLimitAdTracking();
            }
            return dto;
        });
    }
    getAnonymousDTO() {
        return Promise.all([
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
        ]).then(([connectionType, networkType, networkOperator, networkOperatorName, headset, deviceVolume, screenWidth, screenHeight, screenBrightness, freeSpace, batteryLevel, batteryStatus, freeMemory]) => {
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
    getStaticDTO() {
        const dto = this.getAnonymousStaticDTO();
        if (this.getAdvertisingIdentifier()) {
            dto.advertisingTrackingId = this.getAdvertisingIdentifier();
            dto.limitAdTracking = this.getLimitAdTracking();
        }
        return dto;
    }
    getAnonymousStaticDTO() {
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
    handleDeviceInfoError(error) {
        this._core.Sdk.logWarning(JSON.stringify(error));
    }
}
DeviceInfo.Schema = {
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
    headset: ['boolean']
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGV2aWNlSW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9Db3JlL01vZGVscy9EZXZpY2VJbmZvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQztBQUMvRCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFFbkQsT0FBTyxFQUFXLEtBQUssRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBNkJuRCxNQUFNLE9BQWdCLFVBQWdELFNBQVEsS0FBUTtJQWdDbEYsWUFBWSxJQUFZLEVBQUUsTUFBa0IsRUFBRSxRQUFrQixFQUFFLElBQWM7UUFDNUUsS0FBSyxDQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsQ0FBQztRQUU1QixJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztRQUMxQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztJQUN0QixDQUFDO0lBRU0sS0FBSztRQUNSLE1BQU0sUUFBUSxHQUF1QixFQUFFLENBQUM7UUFFeEMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyx3QkFBd0IsRUFBRSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0TSxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLHNCQUFzQixFQUFFLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRSxlQUFlLENBQUMsQ0FBQyxD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