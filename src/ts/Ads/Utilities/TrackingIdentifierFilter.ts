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
        let trackingIdentifiers: ITrackingIdentifier = {};

        if (CustomFeatures.isChinaSDK(platform, sdkVersionName) && deviceInfo instanceof AndroidDeviceInfo) {
            if (deviceInfo.getAndroidId() || deviceInfo.getDeviceId1()) {
                trackingIdentifiers = {
                    androidId: deviceInfo.getAndroidId()
                };
                if (deviceInfo.getDeviceId1()) {
                    trackingIdentifiers = {
                        ...trackingIdentifiers,
                        imei: deviceInfo.getDeviceId1()
                    };
                }
            } else {
                trackingIdentifiers = {
                    advertisingTrackingId: deviceInfo.getAdvertisingIdentifier(),
                    limitAdTracking: deviceInfo.getLimitAdTracking()
                };
            }
        } else {
            if (deviceInfo.getAdvertisingIdentifier()) {
                trackingIdentifiers = {
                    advertisingTrackingId: deviceInfo.getAdvertisingIdentifier(),
                    limitAdTracking: deviceInfo.getLimitAdTracking()
                };
            } else if (platform === Platform.ANDROID && deviceInfo instanceof AndroidDeviceInfo) {
                trackingIdentifiers = {
                    androidId: deviceInfo.getAndroidId()
                };
                if (deviceInfo.getDeviceId1()) {
                    trackingIdentifiers = {
                        ...trackingIdentifiers,
                        imei: deviceInfo.getDeviceId1()
                    };
                }
            }
        }
        return trackingIdentifiers;
    }
}
