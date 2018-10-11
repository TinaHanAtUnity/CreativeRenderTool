import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { BackendApi } from '../BackendApi';

export class DeviceInfo extends BackendApi {

    public setAdvertisingTrackingId(value: string) {
        this._advertisingTrackingId = value;
    }

    public setLimitAdTrackingFlag(value: boolean) {
        this._limitAdTrackingFlag = value;
    }

    public setOsVersion(value: string) {
        this._osVersion = value;
    }

    public setModel(value: string) {
        this._model = value;
    }

    public setScreenWidth(value: number) {
        this._screenWidth = value;
    }

    public setScreenHeight(value: number) {
        this._screenHeight = value;
    }

    public setSystemLanguage(value: string) {
        this._systemLanguage = value;
    }

    public setRooted(value: boolean) {
        this._rooted = value;
    }

    public setTimeZone(value: string) {
        this._timeZone = value;
    }

    public setTotalMemory(value: number) {
        this._totalMemory = value;
    }

    public setAndroidId(value: string) {
        this._androidId = value;
    }

    public setApiLevel(value: number) {
        this._apiLevel = value;
    }

    public setTotalSpace(value: number) {
        this._totalSpace = value;
    }

    public setManufacturer(value: string) {
        this._manufacturer = value;
    }

    public setScreenDensity(value: number) {
        this._screenDensity = value;
    }

    public setScreenLayout(value: number) {
        this._screenLayout = value;
    }

    public setConnectionType(value: string) {
        this._connectionType = value;
    }

    public setNetworkType(value: number) {
        this._networkType = value;
    }

    public setNetworkOperator(value: string) {
        this._networkOperator = value;
    }

    public setNetworkOperatorName(value: string) {
        this._networkOperatorName = value;
    }

    public setNetworkMetered(value: boolean) {
        this._networkMetered = value;
    }

    public setHeadset(value: boolean) {
        this._headset = value;
    }

    public setDeviceVolume(value: number) {
        this._deviceVolume = value;
    }

    public setScreenBrightness(value: number) {
        this._screenBrightness = value;
    }

    public setFreeSpace(value: number) {
        this._freeSpace = value;
    }

    public setBatteryLevel(value: number) {
        this._batteryLevel = value;
    }

    public setBatteryStatus(value: number) {
        this._batteryStatus = value;
    }

    public setFreeMemory(value: number) {
        this._freeMemory = value;
    }

    public setRingerMode(value: number) {
        this._ringerMode = value;
    }

    public setUserInterfaceIdiom(value: number) {
        this._userInterfaceIdiom = value;
    }

    public setScreenScale(value: number) {
        this._screenScale = value;
    }

    public setSimulator(value: boolean) {
        this._simulator = value;
    }

    public setStatusBarHeight(value: number) {
        this._statusBarHeight = value;
    }

    public setCPUCount(count: number) {
        this._cpuCount = count;
    }

    public setGLVersion(version: string) {
        this._glVersion = version;
    }

    public setApkDigest(digest: string) {
        this._apkDigest = digest;
    }

    public setCertificateFingerprint(fingerPrint: string) {
        this._certificateFingerprint = fingerPrint;
    }

    public setBoard(board: string) {
        this._board = board;
    }

    public setBootloader(bootLoader: string) {
        this._bootLoader = bootLoader;
    }

    public setBrand(brand: string) {
        this._brand = brand;
    }

    public setDevice(device: string) {
        this._device = device;
    }

    public setHardware(hardware: string) {
        this._hardware = hardware;
    }

    public setHost(host: string) {
        this._host = host;
    }

    public setProduct(product: string) {
        this._product = product;
    }

    public setFingerprint(fingerPrint: string) {
        this._fingerPrint = fingerPrint;
    }

    public setSupportedAbis(supportedAbis: string[]) {
        this._supportedAbis = supportedAbis;
    }

    public setSensorList(sensorList: object[]) {
        this._sensorList = sensorList;
    }

    public setIsUSBConnected(connected: boolean) {
        this._usbConnected = connected;
    }

    public setUptime(upTime: number) {
        this._upTime = upTime;
    }

    public setElapsedRealtime(realtime: number) {
        this._elapsedRealtime = realtime;
    }

    public setStatusBarWidth(width: number) {
        this._statusBarWidth = width;
    }

    public setIsStatusBarHidden(hidden: boolean) {
        this._statusBarHidden = hidden;
    }

    public getAdvertisingTrackingId() {
        return this._advertisingTrackingId;
    }

    public getLimitAdTrackingFlag() {
        return this._limitAdTrackingFlag;
    }

    public getOsVersion() {
        return this._osVersion;
    }

    public getModel() {
        return this._model;
    }

    public getScreenWidth() {
        return this._screenWidth;
    }

    public getScreenHeight() {
        return this._screenHeight;
    }

    public getSystemLanguage() {
        return this._systemLanguage;
    }

    public isRooted() {
        return this._rooted;
    }

    public getTimeZone(dst: boolean) {
        return this._timeZone;
    }

    public getTotalMemory() {
        return this._totalMemory;
    }

    public getAndroidId() {
        return this._androidId;
    }

    public getApiLevel() {
        return this._apiLevel;
    }

    public getTotalSpace(storageType: string) {
        return this._totalSpace;
    }

    public getManufacturer() {
        return this._manufacturer;
    }

    public getScreenDensity() {
        return this._screenDensity;
    }

    public getScreenLayout() {
        return this._screenLayout;
    }

    public getConnectionType() {
        return this._connectionType;
    }

    public getNetworkType() {
        return this._networkType;
    }

    public getNetworkOperator() {
        return this._networkOperator;
    }

    public getNetworkOperatorName() {
        return this._networkOperatorName;
    }

    public getNetworkMetered() {
        return this._networkMetered;
    }

    public getHeadset() {
        return this._headset;
    }

    public getDeviceVolume(volumeStream: number) {
        return this._deviceVolume;
    }

    public getScreenBrightness() {
        return this._screenBrightness;
    }

    public getFreeSpace(storageType: string) {
        return this._freeSpace;
    }

    public getBatteryLevel() {
        return this._batteryLevel;
    }

    public getBatteryStatus() {
        return this._batteryStatus;
    }

    public getFreeMemory() {
        return this._freeMemory;
    }

    public getRingerMode() {
        return this._ringerMode;
    }

    public getUniqueEventId() {
        return this.getGuid();
    }

    public getUserInterfaceIdiom() {
        return this._userInterfaceIdiom;
    }

    public getScreenScale() {
        return this._screenScale;
    }

    public getDeviceMaxVolume() {
        return this._maxVolume;
    }

    public registerVolumeChangeListener() {
        return undefined;
    }

    public unregisterVolumeChangeListener() {
        return undefined;
    }

    public getPackageInfo() {
        return {};
    }

    public isSimulator() {
        return this._simulator;
    }

    public isAppInstalled(packageName: string) {
        return packageName === AndroidDeviceInfo.GooglePlayPackageName;
    }

    public getStatusBarHeight() {
        return this._statusBarHeight;
    }

    public getCPUCount() {
        return this._cpuCount;
    }

    public getGLVersion() {
        return this._glVersion;
    }

    public getApkDigest() {
        return this._apkDigest;
    }

    public getCertificateFingerprint() {
        return this._certificateFingerprint;
    }

    public getBoard() {
        return this._board;
    }

    public getBootloader() {
        return this._bootLoader;
    }

    public getBrand() {
        return this._brand;
    }

    public getDevice() {
        return this._device;
    }

    public getHardware() {
        return this._hardware;
    }

    public getHost() {
        return this._host;
    }

    public getProduct() {
        return this._product;
    }

    public getFingerprint() {
        return this._fingerPrint;
    }

    public getSupportedAbis() {
        return this._supportedAbis;
    }

    public getSensorList() {
        return this._sensorList;
    }

    public isUSBConnected() {
        return this._usbConnected;
    }

    public getUptime() {
        return this._upTime;
    }

    public getElapsedRealtime() {
        return this._elapsedRealtime;
    }

    public getStatusBarWidth() {
        return this._statusBarWidth;
    }

    public isStatusBarHidden() {
        return this._statusBarHidden;
    }

    public isAdbEnabled() {
        return this._adbEnabled;
    }

    private _advertisingTrackingId: string = 'DA276DED-8DFE-4C57-A75E-9D7F7BBF2D21';
    private _limitAdTrackingFlag: boolean = true;
    private _osVersion: string = '10.1.1';
    private _model: string = 'iPhone7,2';
    private _screenWidth: number = 647;
    private _screenHeight: number = 357;
    private _systemLanguage: string = 'en_US';
    private _rooted: boolean = false;
    private _timeZone: string = '+0200';
    private _totalMemory: number = 1899508;
    private _androidId: string = 'de88c6a5d783745b';
    private _apiLevel: number = 23;
    private _totalSpace: number = 13162172;
    private _manufacturer: string = 'Apple';
    private _screenDensity: number = 480;
    private _screenLayout: number = 268435794;
    private _connectionType: string = 'wifi';
    private _networkType: number = 0;
    private _networkOperator: string = '24412';
    private _networkOperatorName: string = 'DNA';
    private _networkMetered: boolean = false;
    private _headset: boolean = false;
    private _deviceVolume: number = 1;
    private _screenBrightness: number = 1;
    private _freeSpace: number = 10159440;
    private _batteryLevel: number = 1;
    private _batteryStatus: number = 1;
    private _freeMemory: number = 1000000;
    private _ringerMode: number = 0;
    private _userInterfaceIdiom: number = 0;
    private _screenScale: number = 2;
    private _simulator: boolean = false;
    private _statusBarHeight: number = 0;
    private _maxVolume: number = 1;
    private _cpuCount: number = 1;
    private _glVersion: string = '2.0';
    private _apkDigest: string = 'apkDigest';
    private _certificateFingerprint: string = 'certificateFingerprint';
    private _board: string = 'board';
    private _bootLoader: string = 'bootLoader';
    private _brand: string = 'brand';
    private _device: string = 'device';
    private _hardware: string = 'hardware';
    private _host: string = 'host';
    private _product: string = 'product';
    private _fingerPrint: string = 'fingerPrint';
    private _supportedAbis: string[] = ['supported_abi_1', 'supported_abi_2'];
    private _sensorList: object[] = [];
    private _usbConnected: boolean = false;
    private _upTime: number = 10000;
    private _elapsedRealtime: number = 10000;
    private _statusBarWidth: number = 0;
    private _statusBarHidden: boolean = true;
    private _adbEnabled = false;

    private getGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
            const randomValue = Math.random() * 16 | 0;
            const value = char === 'x' ? randomValue : (randomValue & 0x3 | 0x8);
            return value.toString(16);
        });
    }

}
