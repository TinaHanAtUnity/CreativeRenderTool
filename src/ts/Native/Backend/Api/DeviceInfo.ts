import { Platform } from 'Constants/Platform';
import { Backend } from 'Native/Backend/Backend';

export class DeviceInfo {

    public static setAdvertisingTrackingId(value: string) {
        DeviceInfo._advertisingTrackingId = value;
    }

    public static setLimitAdTrackingFlag(value: boolean) {
        DeviceInfo._limitAdTrackingFlag = value;
    }

    public static setOsVersion(value: string) {
        DeviceInfo._osVersion = value;
    }

    public static setModel(value: string) {
        DeviceInfo._model = value;
    }

    public static setScreenWidth(value: number) {
        DeviceInfo._screenWidth = value;
    }

    public static setScreenHeight(value: number) {
        DeviceInfo._screenHeight = value;
    }

    public static setSystemLanguage(value: string) {
        DeviceInfo._systemLanguage = value;
    }

    public static setRooted(value: boolean) {
        DeviceInfo._rooted = value;
    }

    public static setTimeZone(value: string) {
        DeviceInfo._timeZone = value;
    }

    public static setTotalMemory(value: number) {
        DeviceInfo._totalMemory = value;
    }

    public static setAndroidId(value: string) {
        DeviceInfo._androidId = value;
    }

    public static setApiLevel(value: number) {
        DeviceInfo._apiLevel = value;
    }

    public static setTotalSpace(value: number) {
        DeviceInfo._totalSpace = value;
    }

    public static setManufacturer(value: string) {
        DeviceInfo._manufacturer = value;
    }

    public static setScreenDensity(value: number) {
        DeviceInfo._screenDensity = value;
    }

    public static setScreenLayout(value: number) {
        DeviceInfo._screenLayout = value;
    }

    public static setConnectionType(value: string) {
        DeviceInfo._connectionType = value;
    }

    public static setNetworkType(value: number) {
        DeviceInfo._networkType = value;
    }

    public static setNetworkOperator(value: number) {
        DeviceInfo._networkOperator = value;
    }

    public static setNetworkOperatorName(value: string) {
        DeviceInfo._networkOperatorName = value;
    }

    public static setHeadset(value: boolean) {
        DeviceInfo._headset = value;
    }

    public static setDeviceVolume(value: number) {
        DeviceInfo._deviceVolume = value;
    }

    public static setScreenBrightness(value: number) {
        DeviceInfo._screenBrightness = value;
    }

    public static setFreeSpace(value: number) {
        DeviceInfo._freeSpace = value;
    }

    public static setBatteryLevel(value: number) {
        DeviceInfo._batteryLevel = value;
    }

    public static setBatteryStatus(value: string) {
        DeviceInfo._batteryStatus = value;
    }

    public static setFreeMemory(value: number) {
        DeviceInfo._freeMemory = value;
    }

    public static setRingerMode(value: number) {
        DeviceInfo._ringerMode = value;
    }

    public static setUserInterfaceIdiom(value: number) {
        DeviceInfo._userInterfaceIdiom = value;
    }

    public static setScreenScale(value: number) {
        DeviceInfo._screenScale = value;
    }

    public static setSimulator(value: boolean) {
        DeviceInfo._simulator = value;
    }

    public static getAdvertisingTrackingId() {
        return DeviceInfo.getGuid();
    }

    public static getLimitAdTrackingFlag() {
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

    private static _advertisingTrackingId: string;
    private static _limitAdTrackingFlag: boolean;
    private static _osVersion: string;
    private static _model: string;
    private static _screenWidth: number;
    private static _screenHeight: number;
    private static _systemLanguage: string;
    private static _rooted: boolean;
    private static _timeZone: string;
    private static _totalMemory: number;
    private static _androidId: string;
    private static _apiLevel: number;
    private static _totalSpace: number;
    private static _manufacturer: string;
    private static _screenDensity: number;
    private static _screenLayout: number;
    private static _connectionType: string;
    private static _networkType: number;
    private static _networkOperator: number;
    private static _networkOperatorName: string;
    private static _headset: boolean;
    private static _deviceVolume: number;
    private static _screenBrightness: number;
    private static _freeSpace: number;
    private static _batteryLevel: number;
    private static _batteryStatus: string;
    private static _freeMemory: number;
    private static _ringerMode: number;
    private static _userInterfaceIdiom: number;
    private static _screenScale: number;
    private static _simulator: boolean;

    private static getGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
            const randomValue = Math.random() * 16 | 0;
            const value = char === 'x' ? randomValue : (randomValue & 0x3 | 0x8);
            return value.toString(16);
        });
    }

}
