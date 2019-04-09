import { Platform } from 'Core/Constants/Platform';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';

export interface IBannerDimensions {
    w: number;
    h: number;
}

export class BannerSize {

    public static SmallBannerDimensions: IBannerDimensions = {
        w: 320,
        h: 50
    };

    public static LargeBannerDimensions: IBannerDimensions = {
        w: 728,
        h: 90
    };

    public static getPlatformDimensions(platform: Platform, deviceInfo: DeviceInfo): IBannerDimensions {
        if (platform === Platform.ANDROID) {
            return this.calculateAndroidBannerDimensions(deviceInfo);
        }
        return this.calculateIOSBannerDimensions(deviceInfo);
    }

    private static calculateIOSBannerDimensions(deviceInfo: DeviceInfo): IBannerDimensions {
        const model = deviceInfo.getModel();
        if (model.match(/ipad/i)) {
            return this.LargeBannerDimensions;
        }
        return this.SmallBannerDimensions;
    }

    private static calculateAndroidBannerDimensions(deviceInfo: DeviceInfo): IBannerDimensions {

        // We don't care about the orientation, so we directly grab the stored values
        const screenHeight = deviceInfo.get('screenHeight');
        const screenWidth = deviceInfo.get('screenWidth');
        const screenDensity = (<AndroidDeviceInfo>deviceInfo).getScreenDensity();

        // Seven inches is the standard starting size for Android Tablets
        // Many of the new, larger smartphones are in the 6.2-6.4 inch range
        const sevenInches = 7;
        const heightInInches = screenHeight / screenDensity;
        const widthInInches = screenWidth / screenDensity;

        if (heightInInches >= sevenInches || widthInInches >= sevenInches) {
            return this.LargeBannerDimensions;
        }
        return this.SmallBannerDimensions;
    }
}
