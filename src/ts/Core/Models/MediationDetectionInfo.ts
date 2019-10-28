import {Platform} from 'Core/Constants/Platform';
import {ICoreApi} from 'Core/ICore';
import {ISchema, Model} from 'Core/Models/Model';

export interface IMediationDetectionInfo {
    mediationAdMob: boolean;
    mediationMoPub: boolean;
    mediationC: boolean;
    mediationD: boolean;
}

export class MediationDetectionInfo extends Model<IMediationDetectionInfo> {

    public static Schema: ISchema<IMediationDetectionInfo> = {
        mediationAdMob: ['boolean'],
        mediationMoPub: ['boolean'],
        mediationC: ['boolean'],
        mediationD: ['boolean']
    };

    protected _platform: Platform;
    protected _core: ICoreApi;

    constructor(platform: Platform, core: ICoreApi) {
        super('MediationDetectionInfo', {
            mediationAdMob: ['boolean'],
            mediationMoPub: ['boolean'],
            mediationC: ['boolean'],
            mediationD: ['boolean']
        });

        this._platform = platform;
        this._core = core;
    }

    public detectMediation(): Promise<unknown[]> {
        const promises: Promise<unknown>[] = [];
        if (this._platform === Platform.ANDROID) {
            promises.push(this._core.ClassDetection.isClassPresent('com.google.android.gms.ads.MobileAds').then(result => this.set('mediationAdMob', result)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._core.ClassDetection.isClassPresent('com.mopub.common.MoPub').then(result => this.set('mediationMoPub', result)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._core.ClassDetection.isClassPresent('mediationCClassName').then(result => this.set('mediationC', result)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._core.ClassDetection.isClassPresent('mediationDClassName').then(result => this.set('mediationD', result)).catch(err => this.handleDeviceInfoError(err)));
        } else if (this._platform === Platform.IOS) {
            promises.push(this._core.ClassDetection.isClassPresent('mediationAClassNameOnIOS').then(result => this.set('mediationAdMob', result)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._core.ClassDetection.isClassPresent('mediationBClassNameOnIOS').then(result => this.set('mediationMoPub', result)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._core.ClassDetection.isClassPresent('mediationCClassNameOnIOS').then(result => this.set('mediationC', result)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._core.ClassDetection.isClassPresent('mediationDClassNameOnIOS').then(result => this.set('mediationD', result)).catch(err => this.handleDeviceInfoError(err)));
        }
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
            'mediationA': this.get('mediationAdMob'),
            'mediationB': this.get('mediationMoPub'),
            'mediationC': this.get('mediationC'),
            'mediationD': this.get('mediationD')
        };
    }
}
