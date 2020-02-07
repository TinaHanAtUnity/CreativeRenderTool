import { Platform } from 'Core/Constants/Platform';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { DeviceInfo } from 'Core/Models/DeviceInfo';

export interface ITrackingIdentifier {
    advertisingTrackingId?: string | null;
    limitAdTracking?: boolean;
    androidId?: string;
    imei?: string;
}

export class TrackingIdentifierFilter {
    public static getDeviceTrackingIdentifiers(platform: Platform, deviceInfo: DeviceInfo): ITrackingIdentifier {
        let trackingIdentifiers: ITrackingIdentifier = {};
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
        return trackingIdentifiers;
    }
}
