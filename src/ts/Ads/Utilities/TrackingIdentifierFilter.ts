import { Platform } from 'Core/Constants/Platform';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { DeviceInfo } from 'Core/Models/DeviceInfo';

export interface ITrackingIdentifier {
    advertisingTrackingId?: string | null;
    limitAdTracking?: boolean;
    androidId?: string;
    imei?: string;
}

export class TrackingIdentifierFilter {
    public static getDeviceTrackingIdentifiers(platform: Platform, sdkVersionName: string, deviceInfo: DeviceInfo): ITrackingIdentifier {
        const adIds: ITrackingIdentifier = {
            advertisingTrackingId: deviceInfo.getAdvertisingIdentifier(),
            limitAdTracking: deviceInfo.getLimitAdTracking()
        };
        let personalIds: ITrackingIdentifier = {};

        if (platform === Platform.ANDROID && deviceInfo instanceof AndroidDeviceInfo) {
            if (deviceInfo.getAndroidId()) {
                personalIds = {
                    androidId: deviceInfo.getAndroidId()
                };
            }
            if (deviceInfo.getDeviceId1()) {
                personalIds = {
                    ...personalIds,
                    imei: deviceInfo.getDeviceId1()
                };
            }
        }

        if (CustomFeatures.isChinaSDK(platform, sdkVersionName) && Object.keys(personalIds).length > 0) {
            return personalIds;
        }

        if (adIds.advertisingTrackingId && adIds.limitAdTracking) {
            return adIds;
        }

        return personalIds;
    }
}
