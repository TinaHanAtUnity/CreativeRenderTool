import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { ISchema, Model } from 'Core/Models/Model';

export interface IMediationDetectionInfo {
    mediationA: boolean;
    mediationB: boolean;
    mediationC: boolean;
    mediationD: boolean;
}

export class MediationDetectionInfo extends Model<IMediationDetectionInfo> {

    public static Schema: ISchema<IMediationDetectionInfo> = {
        mediationA: ['boolean'],
        mediationB: ['boolean'],
        mediationC: ['boolean'],
        mediationD: ['boolean']
    };

    protected _platform: Platform;
    protected _core: ICoreApi;

    constructor(platform: Platform, core: ICoreApi) {
        super('MediationDetectionInfo', {
            mediationA: ['boolean'],
            mediationB: ['boolean'],
            mediationC: ['boolean'],
            mediationD: ['boolean']
        });

        this._platform = platform;
        this._core = core;
    }

    public detectMediation(): Promise<unknown[]> {
        const promises: Promise<unknown>[] = [];
        promises.push(this._core.ClassDetection.isClassPresent('com.unity3d.ads.UnityAds').then(result => this.set('mediationA', result)).catch(err => this.handleDeviceInfoError(err)));
        promises.push(this._core.ClassDetection.isClassPresent('mediationBClassName').then(result => this.set('mediationB', result)).catch(err => this.handleDeviceInfoError(err)));
        promises.push(this._core.ClassDetection.isClassPresent('mediationCClassName').then(result => this.set('mediationC', result)).catch(err => this.handleDeviceInfoError(err)));
        promises.push(this._core.ClassDetection.isClassPresent('mediationDClassName').then(result => this.set('mediationD', result)).catch(err => this.handleDeviceInfoError(err)));
        return Promise.all(promises);
    }

    public getMediationDetectionJSON(): string {
       return this.toJSON();
    }

    protected handleDeviceInfoError(error: unknown) {
        this._core.Sdk.logWarning(JSON.stringify(error));
    }

    public getDTO() {
        return {
            'mediationA': this.get('mediationA'),
            'mediationB': this.get('mediationB'),
            'mediationC': this.get('mediationC'),
            'mediationD': this.get('mediationD')
        };
    }
}
