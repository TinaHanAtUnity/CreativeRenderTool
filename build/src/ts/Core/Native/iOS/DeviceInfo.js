import { EventCategory } from 'Core/Constants/EventCategory';
import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { DeviceInfoEvent } from 'Core/Native/DeviceInfoEvent';
import { Observable1, Observable2 } from 'Core/Utilities/Observable';
export var IosUiTheme;
(function (IosUiTheme) {
    IosUiTheme[IosUiTheme["Unspecified"] = 0] = "Unspecified";
    IosUiTheme[IosUiTheme["Light"] = 1] = "Light";
    IosUiTheme[IosUiTheme["Dark"] = 2] = "Dark";
})(IosUiTheme || (IosUiTheme = {}));
export class IosDeviceInfoApi extends NativeApi {
    constructor(nativeBridge) {
        super(nativeBridge, 'DeviceInfo', ApiPackage.CORE, EventCategory.DEVICEINFO);
        this.onVolumeChanged = new Observable2();
        this.onMuteChanged = new Observable1();
    }
    getScreenScale() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getScreenScale');
    }
    getUserInterfaceIdiom() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getUserInterfaceIdiom');
    }
    getDeviceVolume() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getDeviceVolume');
    }
    checkIsMuted() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'checkIsMuted');
    }
    getFreeSpace() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getFreeSpace');
    }
    getTotalSpace() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getTotalSpace');
    }
    isSimulator() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'isSimulator');
    }
    getSensorList() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getSensorList');
    }
    getStatusBarHeight() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getStatusBarHeight');
    }
    getStatusBarWidth() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getStatusBarWidth');
    }
    isStatusBarHidden() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'isStatusBarHidden');
    }
    getDeviceMaxVolume() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getDeviceMaxVolume');
    }
    getDeviceName() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getDeviceName');
    }
    getVendorIdentifier() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getVendorIdentifier');
    }
    getCurrentUITheme() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getCurrentUITheme');
    }
    getLocaleList() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getLocaleList');
    }
    getAdNetworkIdsPlist() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getAdNetworkIdsPlist');
    }
    getSystemBootTime() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getSystemBootTime');
    }
    registerVolumeChangeListener() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'registerVolumeChangeListener');
    }
    unregisterVolumeChangeListener() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'unregisterVolumeChangeListener');
    }
    handleEvent(event, parameters) {
        switch (event) {
            case DeviceInfoEvent[DeviceInfoEvent.VOLUME_CHANGED]:
                this.onVolumeChanged.trigger(parameters[0], parameters[1]);
                break;
            case DeviceInfoEvent[DeviceInfoEvent.MUTE_STATE_RECEIVED]:
                this.onMuteChanged.trigger(parameters[0]);
                break;
            default:
                super.handleEvent(event, parameters);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGV2aWNlSW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy90cy9Db3JlL05hdGl2ZS9pT1MvRGV2aWNlSW5mby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFFN0QsT0FBTyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUVyRSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDOUQsT0FBTyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUVyRSxNQUFNLENBQU4sSUFBWSxVQUlYO0FBSkQsV0FBWSxVQUFVO0lBQ2xCLHlEQUFXLENBQUE7SUFDWCw2Q0FBSyxDQUFBO0lBQ0wsMkNBQUksQ0FBQTtBQUNSLENBQUMsRUFKVyxVQUFVLEtBQVYsVUFBVSxRQUlyQjtBQUVELE1BQU0sT0FBTyxnQkFBaUIsU0FBUSxTQUFTO0lBSTNDLFlBQVksWUFBMEI7UUFDbEMsS0FBSyxDQUFDLFlBQVksRUFBRSxZQUFZLEVBQUUsVUFBVSxDQUFDLElBQUksRUFBRSxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7UUFKakUsb0JBQWUsR0FBRyxJQUFJLFdBQVcsRUFBa0IsQ0FBQztRQUNwRCxrQkFBYSxHQUFHLElBQUksV0FBVyxFQUFXLENBQUM7SUFJM0QsQ0FBQztJQUVNLGNBQWM7UUFDakIsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBUyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztJQUN2RixDQUFDO0lBRU0scUJBQXFCO1FBQ3hCLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQXVCLElBQUksQ0FBQyxpQkFBaUIsRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO0lBQzVHLENBQUM7SUFFTSxlQUFlO1FBQ2xCLE9B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