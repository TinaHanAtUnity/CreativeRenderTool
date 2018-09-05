import { AndroidDeviceInfo } from 'Models/AndroidDeviceInfo';

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

    public static setNetworkMetered(value: boolean) {
        DeviceInfo._networkMetered = value;
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

    public static setCPUCount(count: number) {
        DeviceInfo._cpuCount = count;
    }

    public static setGLVersion(version: string) {
        DeviceInfo._glVersion = version;
    }

    public static setApkDigest(digest: string) {
        DeviceInfo._apkDigest = digest;
    }

    public static setCertificateFingerprint(fingerPrint: string) {
        DeviceInfo._certificateFingerprint = fingerPrint;
    }

    public static setBoard(board: string) {
        DeviceInfo._board = board;
    }

    public static setBootloader(bootLoader: string) {
        DeviceInfo._bootLoader = bootLoader;
    }

    public static setBrand(brand: string) {
        DeviceInfo._brand = brand;
    }

    public static setDevice(device: string) {
        DeviceInfo._device = device;
    }

    public static setHardware(hardware: string) {
        DeviceInfo._hardware = hardware;
    }

    public static setHost(host: string) {
        DeviceInfo._host = host;
    }

    public static setProduct(product: string) {
        DeviceInfo._product = product;
    }

    public static setFingerprint(fingerPrint: string) {
        DeviceInfo._fingerPrint = fingerPrint;
    }

    public static setSupportedAbis(supportedAbis: string[]) {
        DeviceInfo._supportedAbis = supportedAbis;
    }

    public static setSensorList(sensorList: object[]) {
        DeviceInfo._sensorList = sensorList;
    }

    public static setIsUSBConnected(connected: boolean) {
        DeviceInfo._usbConnected = connected;
    }

    public static setUptime(upTime: number) {
        DeviceInfo._upTime = upTime;
    }

    public static setElapsedRealtime(realtime: number) {
        DeviceInfo._elapsedRealtime = realtime;
    }

    public static setStatusBarWidth(width: number) {
        DeviceInfo._statusBarWidth = width;
    }

    public static setIsStatusBarHidden(hidden: boolean) {
        DeviceInfo._statusBarHidden = hidden;
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

    public static getNetworkMetered() {
        return DeviceInfo._networkMetered;
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
        return packageName === AndroidDeviceInfo.GooglePlayPackageName;
    }

    public static getStatusBarHeight() {
        return DeviceInfo._statusBarHeight;
    }

    public static getCPUCount() {
        return DeviceInfo._cpuCount;
    }

    public static getGLVersion() {
        return DeviceInfo._glVersion;
    }

    public static getApkDigest() {
        return DeviceInfo._apkDigest;
    }

    public static getCertificateFingerprint() {
        return DeviceInfo._certificateFingerprint;
    }

    public static getBoard() {
        return DeviceInfo._board;
    }

    public static getBootloader() {
        return DeviceInfo._bootLoader;
    }

    public static getBrand() {
        return DeviceInfo._brand;
    }

    public static getDevice() {
        return DeviceInfo._device;
    }

    public static getHardware() {
        return DeviceInfo._hardware;
    }

    public static getHost() {
        return DeviceInfo._host;
    }

    public static getProduct() {
        return DeviceInfo._product;
    }

    public static getFingerprint() {
        return DeviceInfo._fingerPrint;
    }

    public static getSupportedAbis() {
        return DeviceInfo._supportedAbis;
    }

    public static getSensorList() {
        return DeviceInfo._sensorList;
    }

    public static isUSBConnected() {
        return DeviceInfo._usbConnected;
    }

    public static getUptime() {
        return DeviceInfo._upTime;
    }

    public static getElapsedRealtime() {
        return DeviceInfo._elapsedRealtime;
    }

    public static getStatusBarWidth() {
        return DeviceInfo._statusBarWidth;
    }

    public static isStatusBarHidden() {
        return DeviceInfo._statusBarHidden;
    }

    public static isAdbEnabled() {
        return DeviceInfo._adbEnabled;
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
    private static _networkMetered: boolean = false;
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
    private static _cpuCount: number = 1;
    private static _glVersion: string = '2.0';
    private static _apkDigest: string = 'apkDigest';
    private static _certificateFingerprint: string = 'certificateFingerprint';
    private static _board: string = 'board';
    private static _bootLoader: string = 'bootLoader';
    private static _brand: string = 'brand';
    private static _device: string = 'device';
    private static _hardware: string = 'hardware';
    private static _host: string = 'host';
    private static _product: string = 'product';
    private static _fingerPrint: string = 'fingerPrint';
    private static _supportedAbis: string[] = ['supported_abi_1', 'supported_abi_2'];
    private static _sensorList: object[] = [];
    private static _usbConnected: boolean = false;
    private static _upTime: number = 10000;
    private static _elapsedRealtime: number = 10000;
    private static _statusBarWidth: number = 0;
    private static _statusBarHidden: boolean = true;
    private static _adbEnabled = false;

    private static getGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
            const randomValue = Math.random() * 16 | 0;
            const value = char === 'x' ? randomValue : (randomValue & 0x3 | 0x8);
            return value.toString(16);
        });
    }

}
