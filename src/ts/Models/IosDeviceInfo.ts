import { DeviceInfo, IDeviceInfo } from 'Models/DeviceInfo';
import { UIUserInterfaceIdiom } from 'Constants/iOS/UIUserInterfaceIdiom';
import { NativeBridge } from 'Native/NativeBridge';

export interface IIosDeviceInfo extends IDeviceInfo {
    userInterfaceIdiom: UIUserInterfaceIdiom;
    screenScale: number;
    statusBarHeight: number;
    statusBarWidth: number;
    statusBarHidden: boolean;
    simulator: boolean;
    sensorList: string[];
}

export class IosDeviceInfo extends DeviceInfo<IIosDeviceInfo> {
    constructor(nativeBridge: NativeBridge) {
        super('IosDeviceInfo', {
            ... DeviceInfo.Schema,
            userInterfaceIdiom: ['number'],
            screenScale: ['number'],
            statusBarHeight: ['number'],
            statusBarWidth: ['number'],
            statusBarHidden: ['boolean'],
            simulator: ['boolean'],
            sensorList: ['array']
        }, nativeBridge);
    }

    public fetch(): Promise<any[]> {
        return super.fetch().then(() => {
            const promises: Array<Promise<any>> = [];

            promises.push(this._nativeBridge.DeviceInfo.Ios.getUserInterfaceIdiom().then(userInterfaceIdiom => this.set('userInterfaceIdiom', userInterfaceIdiom)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._nativeBridge.DeviceInfo.Ios.getScreenScale().then(screenScale => this.set('screenScale', screenScale)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._nativeBridge.DeviceInfo.Ios.isSimulator().then(simulator => this.set('simulator', simulator)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._nativeBridge.DeviceInfo.Ios.getTotalSpace().then(totalSpace => this.set('totalInternalSpace', totalSpace)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._nativeBridge.DeviceInfo.Ios.getStatusBarHeight().then(statusBarHeight => this.set('statusBarHeight', statusBarHeight)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._nativeBridge.DeviceInfo.Ios.getStatusBarWidth().then(statusBarWidth => this.set('statusBarWidth', statusBarWidth)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._nativeBridge.DeviceInfo.Ios.getDeviceMaxVolume().then(maxVolume => this.set('maxVolume', maxVolume)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._nativeBridge.DeviceInfo.Ios.getSensorList().then(sensorList => this.set('sensorList', sensorList)).catch(err => this.handleDeviceInfoError(err)));

            return Promise.all(promises);
        });
    }

    public getStores(): string {
        return "apple";
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

    public isStatusBarHidden(): Promise<boolean> {
        return this._nativeBridge.DeviceInfo.Ios.isStatusBarHidden().then(isStatusBarHidden => {
            this.set('statusBarHidden', isStatusBarHidden);
            return this.get('statusBarHidden');
        });
    }

    public getSensorList(): string[] {
        return this.get('sensorList');
    }

    public getDTO(): Promise<any> {
        return super.getDTO().then((commonDTO) => {
            return {
                ...commonDTO,
                'screenScale': this.getScreenScale(),
                'userInterfaceIdiom': this.getUserInterfaceIdiom(),
                'simulator': this.isSimulator(),
            };
        });
    }

    public getStaticDTO(): any {
        return {
            ... super.getStaticDTO(),
            'screenScale': this.getScreenScale(),
            'userInterfaceIdiom': this.getUserInterfaceIdiom(),
            'simulator': this.isSimulator(),
        };
    }
}
