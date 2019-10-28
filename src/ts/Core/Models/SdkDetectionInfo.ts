import {Platform} from 'Core/Constants/Platform';
import {ICoreApi} from 'Core/ICore';
import {ISchema, Model} from 'Core/Models/Model';

export interface ISdkDetectionInfo {
    AdMob: boolean;
    MoPub: boolean;
    IronSource: boolean;
    Fyber: boolean;
}

export class SdkDetectionInfo extends Model<ISdkDetectionInfo> {

    public static Schema: ISchema<ISdkDetectionInfo> = {
        AdMob: ['boolean'],
        MoPub: ['boolean'],
        IronSource: ['boolean'],
        Fyber: ['boolean']
    };

    protected _platform: Platform;
    protected _core: ICoreApi;

    constructor(platform: Platform, core: ICoreApi) {
        super('MediationDetectionInfo', {
            AdMob: ['boolean'],
            MoPub: ['boolean'],
            IronSource: ['boolean'],
            Fyber: ['boolean']
        });

        this._platform = platform;
        this._core = core;
    }

    public detectSdks(): Promise<unknown[]> {
        const promises: Promise<unknown>[] = [];
        if (this._platform === Platform.ANDROID) {
            promises.push(this._core.ClassDetection.isClassPresent('com.google.android.gms.ads.MobileAds').then(result => this.set('AdMob', result)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._core.ClassDetection.isClassPresent('com.mopub.common.MoPub').then(result => this.set('MoPub', result)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._core.ClassDetection.isClassPresent('com.ironsource.mediationsdk.IronSource').then(result => this.set('IronSource', result)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._core.ClassDetection.isClassPresent('com.fyber.FairBid').then(result => this.set('Fyber', result)).catch(err => this.handleDeviceInfoError(err)));
        } else if (this._platform === Platform.IOS) {
            promises.push(this._core.ClassDetection.isClassPresent('mediationAClassNameOnIOS').then(result => this.set('AdMob', result)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._core.ClassDetection.isClassPresent('mediationBClassNameOnIOS').then(result => this.set('MoPub', result)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._core.ClassDetection.isClassPresent('mediationCClassNameOnIOS').then(result => this.set('IronSource', result)).catch(err => this.handleDeviceInfoError(err)));
            promises.push(this._core.ClassDetection.isClassPresent('mediationDClassNameOnIOS').then(result => this.set('Fyber', result)).catch(err => this.handleDeviceInfoError(err)));
        }
        return Promise.all(promises);
    }

    public getSdkDetectionJSON(): string {
       return this.toJSON();
    }

    protected handleDeviceInfoError(error: unknown) {
        this._core.Sdk.logWarning(JSON.stringify(error));
    }

    public getDTO() {
        return {
            'mediationA': this.get('AdMob'),
            'mediationB': this.get('MoPub'),
            'mediationC': this.get('IronSource'),
            'mediationD': this.get('Fyber')
        };
    }
}
