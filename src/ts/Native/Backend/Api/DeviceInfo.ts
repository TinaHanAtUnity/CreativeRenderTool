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

    public static setBatteryStatus(value: number) {
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

    public static getDeviceMaxVolume() {
        return DeviceInfo._maxVolume;
    }

    public static registerVolumeChangeListener() {
        return undefined;
    }

    public static unregisterVolumeChangeListener() {
        return undefined;
    }

    public static getPackageInfo() {
        return {};
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

    public static getDevice(): string {
        return DeviceInfo._device;
    }

    private static _advertisingTrackingId: string = 'DA276DED-8DFE-4C57-A75E-9D7F7BBF2D21';
    private static _limitAdTrackingFlag: boolean = true;
    private static _osVersion: string = '10.1.1';
    private static _model: string = 'iPhone7,2';
    private static _screenWidth: number = 647;
    private static _screenHeight: number = 357;
    private static _systemLanguage: string = 'en_US';
    private static _rooted: boolean = false;
    private static _timeZone: string = '+0200';
    private static _totalMemory: number = 1899508;
    private static _androidId: string = 'de88c6a5d783745b';
    private static _apiLevel: number = 23;
    private static _totalSpace: number = 13162172;
    private static _manufacturer: string = 'Apple';
    private static _screenDensity: number = 480;
    private static _screenLayout: number = 268435794;
    private static _connectionType: string = 'wifi';
    private static _networkType: number = 0;
    private static _networkOperator: string = '24412';
    private static _networkOperatorName: string = 'DNA';
    private static _headset: boolean = false;
    private static _deviceVolume: number = 1;
    private static _screenBrightness: number = 1;
    private static _freeSpace: number = 10159440;
    private static _batteryLevel: number = 1;
    private static _batteryStatus: number = 1;
    private static _freeMemory: number = 1000000;
    private static _ringerMode: number = 0;
    private static _userInterfaceIdiom: number = 0;
    private static _screenScale: number = 2;
    private static _simulator: boolean = false;
    private static _statusBarHeight: number = 0;
    private static _maxVolume: number = 1;
    private static _device: string = 'GT-I9000';

    private static getGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
            const randomValue = Math.random() * 16 | 0;
            const value = char === 'x' ? randomValue : (randomValue & 0x3 | 0x8);
            return value.toString(16);
        });
    }

}
