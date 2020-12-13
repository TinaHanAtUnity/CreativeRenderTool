import { BackendApi } from 'Backend/BackendApi';
export class DeviceInfo extends BackendApi {
    constructor() {
        super(...arguments);
        this._advertisingTrackingId = 'DA276DED-8DFE-4C57-A75E-9D7F7BBF2D21';
        this._limitAdTrackingFlag = true;
        this._osVersion = '10.1.1';
        this._model = 'iPhone7,2';
        this._screenWidth = 647;
        this._screenHeight = 357;
        this._systemLanguage = 'en_US';
        this._rooted = false;
        this._timeZone = '+0200';
        this._totalMemory = 1899508;
        this._androidId = 'de88c6a5d783745b';
        this._apiLevel = 23;
        this._totalSpace = 13162172;
        this._manufacturer = 'Apple';
        this._displayMetricDensity = 1;
        this._screenDensity = 480;
        this._screenLayout = 268435794;
        this._connectionType = 'wifi';
        this._networkType = 0;
        this._networkOperator = '24412';
        this._networkOperatorName = 'DNA';
        this._networkMetered = false;
        this._headset = false;
        this._deviceVolume = 1;
        this._screenBrightness = 1;
        this._freeSpace = 10159440;
        this._batteryLevel = 1;
        this._batteryStatus = 1;
        this._freeMemory = 1000000;
        this._ringerMode = 0;
        this._userInterfaceIdiom = 0;
        this._screenScale = 2;
        this._simulator = false;
        this._statusBarHeight = 0;
        this._maxVolume = 1;
        this._cpuCount = 1;
        this._glVersion = '2.0';
        this._apkDigest = 'apkDigest';
        this._certificateFingerprint = 'certificateFingerprint';
        this._board = 'board';
        this._bootLoader = 'bootLoader';
        this._brand = 'brand';
        this._device = 'device';
        this._hardware = 'hardware';
        this._host = 'host';
        this._product = 'product';
        this._fingerPrint = 'fingerPrint';
        this._supportedAbis = ['supported_abi_1', 'supported_abi_2'];
        this._sensorList = [];
        this._usbConnected = false;
        this._upTime = 10000;
        this._elapsedRealtime = 10000;
        this._statusBarWidth = 0;
        this._statusBarHidden = true;
        this._adbEnabled = false;
    }
    setAdvertisingTrackingId(value) {
        this._advertisingTrackingId = value;
    }
    setLimitAdTrackingFlag(value) {
        this._limitAdTrackingFlag = value;
    }
    setOsVersion(value) {
        this._osVersion = value;
    }
    setModel(value) {
        this._model = value;
    }
    setScreenWidth(value) {
        this._screenWidth = value;
    }
    setScreenHeight(value) {
        this._screenHeight = value;
    }
    setSystemLanguage(value) {
        this._systemLanguage = value;
    }
    setRooted(value) {
        this._rooted = value;
    }
    setTimeZone(value) {
        this._timeZone = value;
    }
    setTotalMemory(value) {
        this._totalMemory = value;
    }
    setAndroidId(value) {
        this._androidId = value;
    }
    setDeviceId(value) {
        this._deviceId = value;
    }
    setApiLevel(value) {
        this._apiLevel = value;
    }
    setTotalSpace(value) {
        this._totalSpace = value;
    }
    setManufacturer(value) {
        this._manufacturer = value;
    }
    setDisplayMetricDensity(value) {
        this._displayMetricDensity = value;
    }
    setScreenDensity(value) {
        this._screenDensity = value;
    }
    setScreenLayout(value) {
        this._screenLayout = value;
    }
    setConnectionType(value) {
        this._connectionType = value;
    }
    setNetworkType(value) {
        this._networkType = value;
    }
    setNetworkOperator(value) {
        this._networkOperator = value;
    }
    setNetworkOperatorName(value) {
        this._networkOperatorName = value;
    }
    setNetworkMetered(value) {
        this._networkMetered = value;
    }
    setHeadset(value) {
        this._headset = value;
    }
    setDeviceVolume(value) {
        this._deviceVolume = value;
    }
    setScreenBrightness(value) {
        this._screenBrightness = value;
    }
    setFreeSpace(value) {
        this._freeSpace = value;
    }
    setBatteryLevel(value) {
        this._batteryLevel = value;
    }
    setBatteryStatus(value) {
        this._batteryStatus = value;
    }
    setFreeMemory(value) {
        this._freeMemory = value;
    }
    setRingerMode(value) {
        this._ringerMode = value;
    }
    setUserInterfaceIdiom(value) {
        this._userInterfaceIdiom = value;
    }
    setScreenScale(value) {
        this._screenScale = value;
    }
    setSimulator(value) {
        this._simulator = value;
    }
    setStatusBarHeight(value) {
        this._statusBarHeight = value;
    }
    setCPUCount(count) {
        this._cpuCount = count;
    }
    setGLVersion(version) {
        this._glVersion = version;
    }
    setApkDigest(digest) {
        this._apkDigest = digest;
    }
    setCertificateFingerprint(fingerPrint) {
        this._certificateFingerprint = fingerPrint;
    }
    setBoard(board) {
        this._board = board;
    }
    setBootloader(bootLoader) {
        this._bootLoader = bootLoader;
    }
    setBrand(brand) {
        this._brand = brand;
    }
    setDevice(device) {
        this._device = device;
    }
    setHardware(hardware) {
        this._hardware = hardware;
    }
    setHost(host) {
        this._host = host;
    }
    setProduct(product) {
        this._product = product;
    }
    setFingerprint(fingerPrint) {
        this._fingerPrint = fingerPrint;
    }
    setSupportedAbis(supportedAbis) {
        this._supportedAbis = supportedAbis;
    }
    setSensorList(sensorList) {
        this._sensorList = sensorList;
    }
    setIsUSBConnected(connected) {
        this._usbConnected = connected;
    }
    setUptime(upTime) {
        this._upTime = upTime;
    }
    setElapsedRealtime(realtime) {
        this._elapsedRealtime = realtime;
    }
    setStatusBarWidth(width) {
        this._statusBarWidth = width;
    }
    setIsStatusBarHidden(hidden) {
        this._statusBarHidden = hidden;
    }
    getAdvertisingTrackingId() {
        return this._advertisingTrackingId;
    }
    getLimitAdTrackingFlag() {
        return this._limitAdTrackingFlag;
    }
    getOsVersion() {
        return this._osVersion;
    }
    getModel() {
        return this._model;
    }
    getScreenWidth() {
        return this._screenWidth;
    }
    getScreenHeight() {
        return this._screenHeight;
    }
    getSystemLanguage() {
        return this._systemLanguage;
    }
    isRooted() {
        return this._rooted;
    }
    getTimeZone(dst) {
        return this._timeZone;
    }
    getTotalMemory() {
        return this._totalMemory;
    }
    getAndroidId() {
        return this._androidId;
    }
    getApiLevel() {
        return this._apiLevel;
    }
    getTotalSpace(storageType) {
        return this._totalSpace;
    }
    getManufacturer() {
        return this._manufacturer;
    }
    getDisplayMetricDensity() {
        return this._displayMetricDensity;
    }
    getScreenDensity() {
        return this._screenDensity;
    }
    getScreenLayout() {
        return this._screenLayout;
    }
    getConnectionType() {
        return this._connectionType;
    }
    getNetworkType() {
        return this._networkType;
    }
    getNetworkOperator() {
        return this._networkOperator;
    }
    getNetworkOperatorName() {
        return this._networkOperatorName;
    }
    getNetworkMetered() {
        return this._networkMetered;
    }
    getHeadset() {
        return this._headset;
    }
    getDeviceVolume(volumeStream) {
        return this._deviceVolume;
    }
    getScreenBrightness() {
        return this._screenBrightness;
    }
    getFreeSpace(storageType) {
        return this._freeSpace;
    }
    getBatteryLevel() {
        return this._batteryLevel;
    }
    getBatteryStatus() {
        return this._batteryStatus;
    }
    getFreeMemory() {
        return this._freeMemory;
    }
    getRingerMode() {
        return this._ringerMode;
    }
    getUniqueEventId() {
        return this.getGuid();
    }
    getUserInterfaceIdiom() {
        return this._userInterfaceIdiom;
    }
    getScreenScale() {
        return this._screenScale;
    }
    getDeviceMaxVolume() {
        return this._maxVolume;
    }
    registerVolumeChangeListener() {
        return undefined;
    }
    unregisterVolumeChangeListener() {
        return undefined;
    }
    getPackageInfo() {
        return {};
    }
    isSimulator() {
        return this._simulator;
    }
    getStatusBarHeight() {
        return this._statusBarHeight;
    }
    getCPUCount() {
        return this._cpuCount;
    }
    getGLVersion() {
        return this._glVersion;
    }
    getApkDigest() {
        return this._apkDigest;
    }
    getCertificateFingerprint() {
        return this._certificateFingerprint;
    }
    getBoard() {
        return this._board;
    }
    getBootloader() {
        return this._bootLoader;
    }
    getBrand() {
        return this._brand;
    }
    getDevice() {
        return this._device;
    }
    getHardware() {
        return this._hardware;
    }
    getHost() {
        return this._host;
    }
    getProduct() {
        return this._product;
    }
    getFingerprint() {
        return this._fingerPrint;
    }
    getSupportedAbis() {
        return this._supportedAbis;
    }
    getSensorList() {
        return this._sensorList;
    }
    isUSBConnected() {
        return this._usbConnected;
    }
    getUptime() {
        return this._upTime;
    }
    getElapsedRealtime() {
        return this._elapsedRealtime;
    }
    getStatusBarWidth() {
        return this._statusBarWidth;
    }
    isStatusBarHidden() {
        return this._statusBarHidden;
    }
    isAdbEnabled() {
        return this._adbEnabled;
    }
    isMadeWithUnity() {
        return this._isMadeWithUnity;
    }
    getDeviceName() {
        return 'Backend Tester';
    }
    getVendorIdentifier() {
        return '00000000-0000-0000-0000-000000000000';
    }
    getCurrentUITheme() {
        return 1;
    }
    getLocaleList() {
        return ['en', 'fi'];
    }
    getAdNetworkIdsPlist() {
        return [''];
    }
    getSystemBootTime() {
        return 0;
    }
    getGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
            const randomValue = Math.random() * 16 | 0;
            const value = char === 'x' ? randomValue : (randomValue & 0x3 | 0x8);
            return value.toString(16);
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGV2aWNlSW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9CYWNrZW5kL0FwaS9EZXZpY2VJbmZvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUVoRCxNQUFNLE9BQU8sVUFBVyxTQUFRLFVBQVU7SUFBMUM7O1FBa2VZLDJCQUFzQixHQUFXLHNDQUFzQyxDQUFDO1FBQ3hFLHlCQUFvQixHQUFZLElBQUksQ0FBQztRQUNyQyxlQUFVLEdBQVcsUUFBUSxDQUFDO1FBQzlCLFdBQU0sR0FBVyxXQUFXLENBQUM7UUFDN0IsaUJBQVksR0FBVyxHQUFHLENBQUM7UUFDM0Isa0JBQWEsR0FBVyxHQUFHLENBQUM7UUFDNUIsb0JBQWUsR0FBVyxPQUFPLENBQUM7UUFDbEMsWUFBTyxHQUFZLEtBQUssQ0FBQztRQUN6QixjQUFTLEdBQVcsT0FBTyxDQUFDO1FBQzVCLGlCQUFZLEdBQVcsT0FBTyxDQUFDO1FBQy9CLGVBQVUsR0FBVyxrQkFBa0IsQ0FBQztRQUN4QyxjQUFTLEdBQVcsRUFBRSxDQUFDO1FBQ3ZCLGdCQUFXLEdBQVcsUUFBUSxDQUFDO1FBQy9CLGtCQUFhLEdBQVcsT0FBTyxDQUFDO1FBQ2hDLDBCQUFxQixHQUFXLENBQUMsQ0FBQztRQUNsQyxtQkFBYyxHQUFXLEdBQUcsQ0FBQztRQUM3QixrQkFBYSxHQUFXLFNBQVMsQ0FBQztRQUNsQyxvQkFBZSxHQUFXLE1BQU0sQ0FBQztRQUNqQyxpQkFBWSxHQUFXLENBQUMsQ0FBQztRQUN6QixxQkFBZ0IsR0FBVyxPQUFPLENBQUM7UUFDbkMseUJBQW9CLEdBQVcsS0FBSyxDQUFDO1FBQ3JDLG9CQUFlLEdBQVksS0FBSyxDQUFDO1FBQ2pDLGFBQVEsR0FBWSxLQUFLLENBQUM7UUFDMUIsa0JBQWEsR0FBVyxDQUFDLENBQUM7UUFDMUIsc0JBQWlCLEdBQVcsQ0FBQyxDQUFDO1FBQzlC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