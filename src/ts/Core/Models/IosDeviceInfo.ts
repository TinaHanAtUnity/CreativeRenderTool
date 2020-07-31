import { UIUserInterfaceIdiom } from 'Core/Constants/iOS/UIUserInterfaceIdiom';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { DeviceInfo, IDeviceInfo } from 'Core/Models/DeviceInfo';
import { IosUiTheme } from 'Core/Native/iOS/DeviceInfo';

export interface IIosDeviceInfo extends IDeviceInfo {
    userInterfaceIdiom: UIUserInterfaceIdiom;
    screenScale: number;
    statusBarHeight: number;
    statusBarWidth: number;
    statusBarHidden: boolean;
    simulator: boolean;
    sensorList: string[];
    deviceName: string;
    vendorIdentifier: string;
    localeList: string[];
    currentUiTheme: IosUiTheme;
    adNetworksPlist: string[];
    systemBootTime: number;
}

export class IosDeviceInfo extends DeviceInfo<IIosDeviceInfo> {

    constructor(core: ICoreApi) {
        super('IosDeviceInfo', {
            ... DeviceInfo.Schema,
            userInterfaceIdiom: ['number'],
            screenScale: ['number'],
            statusBarHeight: ['number'],
            statusBarWidth: ['number'],
            statusBarHidden: ['boolean'],
            simulator: ['boolean'],
            sensorList: ['array'],
            deviceName: ['string'],
            vendorIdentifier: ['string'],
            localeList: ['array'],
            currentUiTheme: ['number'],
            adNetworksPlist: ['array'],
            systemBootTime: ['number']
        }, Platform.IOS, core);
    }

    public fetch(): Promise<unknown[]> {
        return super.fetch().then(() => {
            const promises: Promise<unknown>[] = [];

            promises.push(this._core.DeviceInfo.Ios!.getUserInterfaceIdiom().then(userInterfaceIdiom => this.set('userInterfaceIdiom', userInterfaceIdiom)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._core.DeviceInfo.Ios!.getScreenScale().then(screenScale => this.set('screenScale', screenScale)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._core.DeviceInfo.Ios!.isSimulator().then(simulator => this.set('simulator', simulator)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._core.DeviceInfo.Ios!.getTotalSpace().then(totalSpace => this.set('totalInternalSpace', totalSpace)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._core.DeviceInfo.Ios!.getStatusBarHeight().then(statusBarHeight => this.set('statusBarHeight', statusBarHeight)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._core.DeviceInfo.Ios!.getStatusBarWidth().then(statusBarWidth => this.set('statusBarWidth', statusBarWidth)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._core.DeviceInfo.Ios!.getDeviceMaxVolume().then(maxVolume => this.set('maxVolume', maxVolume)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._core.DeviceInfo.Ios!.getDeviceName().then(deviceName => this.set('deviceName', deviceName)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._core.DeviceInfo.Ios!.getVendorIdentifier().then(vendorIdentifier => this.set('vendorIdentifier', vendorIdentifier)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._core.DeviceInfo.Ios!.getLocaleList().then(localeList => this.set('localeList', localeList)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._core.DeviceInfo.Ios!.getCurrentUITheme().then(currentUiTheme => this.set('currentUiTheme', currentUiTheme)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._core.DeviceInfo.Ios!.getAdNetworkIdsPlist().then(adNetworksPlist => this.set('adNetworksPlist', adNetworksPlist)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._core.DeviceInfo.Ios!.getSystemBootTime().then(systemBootTime => this.set('systemBootTime', systemBootTime)).catch(err => this.handleDeviceInfoError(err)));

            return Promise.all(promises);
        });
    }

    public getStores(): string {
        return 'apple';
    }

    public getScreenScale(): number {
        return this.get('screenScale');
    }

    public getUserInterfaceIdiom(): UIUserInterfaceIdiom {
        return this.get('userInterfaceIdiom');
    }

    public isSimulator(): boolean {
        return this.get('simulator');
    }

    public getStatusBarHeight(): number {
        return this.get('statusBarHeight');
    }

    public getStatusBarWidth(): number {
        return this.get('statusBarWidth');
    }

    public getDeviceName(): string {
        return this.get('deviceName');
    }

    public getVendorIdentifier(): string {
        return this.get('vendorIdentifier');
    }

    public getLocaleList(): string[] {
        return this.get('localeList');
    }

    public getCurrentUiTheme(): IosUiTheme {
        return this.get('currentUiTheme');
    }

    public getAdNetworksPlist(): string[] {
        return this.get('adNetworksPlist');
    }

    public getSystemBootTime(): number {
        return this.get('systemBootTime');
    }

    public isStatusBarHidden(): Promise<boolean> {
        return this._core.DeviceInfo.Ios!.isStatusBarHidden().then(isStatusBarHidden => {
            this.set('statusBarHidden', isStatusBarHidden);
            return this.get('statusBarHidden');
        });
    }

    public getSensorList(): Promise<string[]> {
        return this._core.DeviceInfo.Ios!.getSensorList().then(sensorList => {
            this.set('sensorList', sensorList);
            return this.get('sensorList');
        });
    }

    public getFreeSpace(): Promise<number> {
        return this._core.DeviceInfo.Ios!.getFreeSpace().then(freeInternalSpace => {
            this.set('freeInternalSpace', freeInternalSpace);
            return this.get('freeInternalSpace');
        });
    }

    public getDTO(): Promise<{ [key: string]: unknown }> {
        return super.getDTO().then((commonDTO) => {
            return {
                ...commonDTO,
                'screenScale': this.getScreenScale(),
                'userInterfaceIdiom': this.getUserInterfaceIdiom(),
                'simulator': this.isSimulator()
            };
        });
    }

    public getAnonymousDTO(): Promise<{ [key: string]: unknown }> {
        return super.getAnonymousDTO().then((commonDTO) => {
            return {
                ...commonDTO,
                'screenScale': this.getScreenScale(),
                'userInterfaceIdiom': this.getUserInterfaceIdiom(),
                'simulator': this.isSimulator()
            };
        });
    }

    public getStaticDTO(): { [key: string]: unknown } {
        return {
            ... super.getStaticDTO(),
            'screenScale': this.getScreenScale(),
            'userInterfaceIdiom': this.getUserInterfaceIdiom(),
            'simulator': this.isSimulator()
        };
    }

    public getAnonymousStaticDTO(): { [key: string]: unknown } {
        return {
            ... super.getAnonymousStaticDTO(),
            'screenScale': this.getScreenScale(),
            'userInterfaceIdiom': this.getUserInterfaceIdiom(),
            'simulator': this.isSimulator()
        };
    }
}
