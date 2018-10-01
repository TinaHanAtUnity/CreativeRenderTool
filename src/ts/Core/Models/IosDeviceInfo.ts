import { UIUserInterfaceIdiom } from 'Core/Constants/iOS/UIUserInterfaceIdiom';
import { DeviceInfo, IDeviceInfo } from 'Core/Models/DeviceInfo';
import { Core } from '../Core';

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

    constructor(core: Core) {
        super('IosDeviceInfo', {
            ... DeviceInfo.Schema,
            userInterfaceIdiom: ['number'],
            screenScale: ['number'],
            statusBarHeight: ['number'],
            statusBarWidth: ['number'],
            statusBarHidden: ['boolean'],
            simulator: ['boolean'],
            sensorList: ['array']
        }, core);
    }

    public fetch(): Promise<any[]> {
        return super.fetch().then(() => {
            const promises: Array<Promise<any>> = [];

            promises.push(this._core.Api.iOS!.DeviceInfo.getUserInterfaceIdiom().then(userInterfaceIdiom => this.set('userInterfaceIdiom', userInterfaceIdiom)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._core.Api.iOS!.DeviceInfo.getScreenScale().then(screenScale => this.set('screenScale', screenScale)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._core.Api.iOS!.DeviceInfo.isSimulator().then(simulator => this.set('simulator', simulator)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._core.Api.iOS!.DeviceInfo.getTotalSpace().then(totalSpace => this.set('totalInternalSpace', totalSpace)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._core.Api.iOS!.DeviceInfo.getStatusBarHeight().then(statusBarHeight => this.set('statusBarHeight', statusBarHeight)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._core.Api.iOS!.DeviceInfo.getStatusBarWidth().then(statusBarWidth => this.set('statusBarWidth', statusBarWidth)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._core.Api.iOS!.DeviceInfo.getDeviceMaxVolume().then(maxVolume => this.set('maxVolume', maxVolume)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._core.Api.iOS!.DeviceInfo.getSensorList().then(sensorList => this.set('sensorList', sensorList)).catch(err => this.handleDeviceInfoError(err)));

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

    public isStatusBarHidden(): Promise<boolean> {
        return this._core.Api.iOS!.DeviceInfo.isStatusBarHidden().then(isStatusBarHidden => {
            this.set('statusBarHidden', isStatusBarHidden);
            return this.get('statusBarHidden');
        });
    }

    public getSensorList(): string[] {
        return this.get('sensorList');
    }

    public getFreeSpace(): Promise<number> {
        return this._core.Api.iOS!.DeviceInfo.getFreeSpace().then(freeInternalSpace => {
            this.set('freeInternalSpace', freeInternalSpace);
            return this.get('freeInternalSpace');
        });
    }

    public getDTO(): Promise<any> {
        return super.getDTO().then((commonDTO) => {
            return {
                ...commonDTO,
                'screenScale': this.getScreenScale(),
                'userInterfaceIdiom': this.getUserInterfaceIdiom(),
                'simulator': this.isSimulator()
            };
        });
    }

    public getAnonymousDTO(): Promise<any> {
        return super.getAnonymousDTO().then((commonDTO) => {
            return {
                ...commonDTO,
                'screenScale': this.getScreenScale(),
                'userInterfaceIdiom': this.getUserInterfaceIdiom(),
                'simulator': this.isSimulator()
            };
        });
    }

    public getStaticDTO(): any {
        return {
            ... super.getStaticDTO(),
            'screenScale': this.getScreenScale(),
            'userInterfaceIdiom': this.getUserInterfaceIdiom(),
            'simulator': this.isSimulator()
        };
    }

    public getAnonymousStaticDTO(): any {
        return {
            ... super.getAnonymousStaticDTO(),
            'screenScale': this.getScreenScale(),
            'userInterfaceIdiom': this.getUserInterfaceIdiom(),
            'simulator': this.isSimulator()
        };
    }
}
