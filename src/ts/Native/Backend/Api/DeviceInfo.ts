import { Platform } from 'Constants/Platform';
import { Backend } from 'Native/Backend/Backend';

export class DeviceInfo {

    public static getAdvertisingTrackingId() {
        return DeviceInfo.getGuid();
    }

    public static  getLimitAdTrackingFlag() {
        return false;
    }

    public static getOsVersion() {
        return '6.0.1';
    }

    public static getModel() {
        if(Backend.getPlatform() === Platform.ANDROID) {
            return 'Nexus 5';
        } else {
            return 'iPhone7,2';
        }
    }

    public static getScreenWidth() {
        return 800;
    }

    public static getScreenHeight() {
        return 600;
    }

    public static getSystemLanguage() {
        return 'en_US';
    }

    public static isRooted() {
        return false;
    }

    public static getTimeZone(dst: boolean) {
        return 'GMT';
    }

    public static getTotalMemory() {
        return 10000000;
    }

    public static getAndroidId() {
        return '';
    }

    public static getApiLevel() {
        return 16;
    }

    public static getTotalSpace(storageType: string) {
        return 10000000;
    }

    public static getManufacturer() {
        return 'Unity';
    }

    public static getScreenDensity() {
        return 123;
    }

    public static getScreenLayout() {
        return 123;
    }

    public static getConnectionType() {
        return 'wifi';
    }

    public static getNetworkType() {
        return 123;
    }

    public static getNetworkOperator() {
        return 123123;
    }

    public static getNetworkOperatorName() {
        return 'Sonera';
    }

    public static getHeadset() {
        return false;
    }

    public static getDeviceVolume(volumeStream: number) {
        return 1;
    }

    public static getScreenBrightness() {
        return 100;
    }

    public static getFreeSpace(storageType: string) {
        return 10000000;
    }

    public static getBatteryLevel() {
        return 10;
    }

    public static getBatteryStatus() {
        return 'ok';
    }

    public static getFreeMemory() {
        return 1000000;
    }

    public static getRingerMode() {
        return 10;
    }

    public static getUniqueEventId() {
        return DeviceInfo.getGuid();
    }

    public static getUserInterfaceIdiom() {
        return 0;
    }

    public static getScreenScale() {
        return 100;
    }

    public static isSimulator() {
        return false;
    }

    private static getGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
            const randomValue = Math.random() * 16 | 0;
            const value = char === 'x' ? randomValue : (randomValue & 0x3 | 0x8);
            return value.toString(16);
        });
    }

}
