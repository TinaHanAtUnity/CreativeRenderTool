import { DeviceInfo as RealDeviceInfo } from 'Models/DeviceInfo';

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

    public static setNetworkOperator(value: string) {
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

    public static setStatusBarHeight(value: number) {
        DeviceInfo._statusBarHeight = value;
    }

    public static getAdvertisingTrackingId() {
        return DeviceInfo._advertisingTrackingId;
    }

    public static getLimitAdTrackingFlag() {
        return DeviceInfo._limitAdTrackingFlag;
    }

    public static getOsVersion() {
        return DeviceInfo._osVersion;
    }

    public static getModel() {
        return DeviceInfo._model;
    }

    public static getScreenWidth() {
        return DeviceInfo._screenWidth;
    }

    public static getScreenHeight() {
        return DeviceInfo._screenHeight;
    }

    public static getSystemLanguage() {
        return DeviceInfo._systemLanguage;
    }

    public static isRooted() {
        return DeviceInfo._rooted;
    }

    public static getTimeZone(dst: boolean) {
        return DeviceInfo._timeZone;
    }

    public static getTotalMemory() {
        return DeviceInfo._totalMemory;
    }

    public static getAndroidId() {
        return DeviceInfo._androidId;
    }

    public static getApiLevel() {
        return DeviceInfo._apiLevel;
    }

    public static getTotalSpace(storageType: string) {
        return DeviceInfo._totalSpace;
    }

    public static getManufacturer() {
        return DeviceInfo._manufacturer;
    }

    public static getScreenDensity() {
        return DeviceInfo._screenDensity;
    }

    public static getScreenLayout() {
        return DeviceInfo._screenLayout;
    }

    public static getConnectionType() {
        return DeviceInfo._connectionType;
    }

    public static getNetworkType() {
        return DeviceInfo._networkType;
    }

    public static getNetworkOperator() {
        return DeviceInfo._networkOperator;
    }

    public static getNetworkOperatorName() {
        return DeviceInfo._networkOperatorName;
    }

    public static getHeadset() {
        return DeviceInfo._headset;
    }

    public static getDeviceVolume(volumeStream: number) {
        return DeviceInfo._deviceVolume;
    }

    public static getScreenBrightness() {
        return DeviceInfo._screenBrightness;
    }

    public static getFreeSpace(storageType: string) {
        return DeviceInfo._freeSpace;
    }

    public static getBatteryLevel() {
        return DeviceInfo._batteryLevel;
    }

    public static getBatteryStatus() {
        return DeviceInfo._batteryStatus;
    }

    public static getFreeMemory() {
        return DeviceInfo._freeMemory;
    }

    public static getRingerMode() {
        return DeviceInfo._ringerMode;
    }

    public static getUniqueEventId() {
        return DeviceInfo.getGuid();
    }

    public static getUserInterfaceIdiom() {
        return DeviceInfo._userInterfaceIdiom;
    }

    public static getScreenScale() {
        return DeviceInfo._screenScale;
    }

    public static isSimulator() {
        return DeviceInfo._simulator;
    }

    public static isAppInstalled(packageName: string) {
        return packageName === RealDeviceInfo.GooglePlayPackageName;
    }

    public static getStatusBarHeight() {
        return DeviceInfo._statusBarHeight;
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
    private static _networkOperator: string;
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
    private static _statusBarHeight: number;

    private static getGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
            const randomValue = Math.random() * 16 | 0;
            const value = char === 'x' ? randomValue : (randomValue & 0x3 | 0x8);
            return value.toString(16);
        });
    }

}
