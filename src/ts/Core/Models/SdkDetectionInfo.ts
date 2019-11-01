import {Platform} from 'Core/Constants/Platform';
import {ICoreApi} from 'Core/ICore';
import {ISchema, Model} from 'Core/Models/Model';

export interface ISdkDetectionInfo {
    AdMob: boolean;
    MoPub: boolean;
    IronSource: boolean;
    Fyber: boolean;
    SafeDK: boolean;
    UnityEngine: boolean;
}

const SdkAndroidClassMap = {
    AdMob: 'com.google.ads.mediation.admob.AdMobAdapter',
    MoPub: 'com.mopub.common.MoPub',
    IronSource: 'com.ironsource.mediationsdk.IronSource',
    Fyber: 'com.fyber.FairBid',
    SafeDK: 'com.safedk.android.SafeDK',
    UnityEngine: 'com.unity3d.player.UnityPlayer'
};

const SdkiOSClassMap = {
    AdMob: 'GADMobileAds',
    MoPub: 'MoPub',
    IronSource: 'IronSource',
    Fyber: 'FyberSDK',
    SafeDK: 'SafeDK',
    UnityEngine: 'UnityAppController'
};

export class SdkDetectionInfo extends Model<ISdkDetectionInfo> {

    public static Schema: ISchema<ISdkDetectionInfo> = {
        AdMob: ['boolean'],
        MoPub: ['boolean'],
        IronSource: ['boolean'],
        Fyber: ['boolean'],
        SafeDK: ['boolean'],
        UnityEngine: ['boolean']
    };

    protected _platform: Platform;
    protected _core: ICoreApi;

    constructor(platform: Platform, core: ICoreApi) {
        super('MediationDetectionInfo', {
            AdMob: ['boolean'],
            MoPub: ['boolean'],
            IronSource: ['boolean'],
            Fyber: ['boolean'],
            SafeDK: ['boolean'],
            UnityEngine: ['boolean']
        });

        this._platform = platform;
        this._core = core;
    }

    public detectSdks(): Promise<unknown[]> {
        const promises: Promise<unknown>[] = [];
        let classNames: string[];
        if (this._platform === Platform.ANDROID) {
            classNames = [SdkAndroidClassMap.AdMob, SdkAndroidClassMap.MoPub, SdkAndroidClassMap.IronSource, SdkAndroidClassMap.Fyber, SdkAndroidClassMap.SafeDK, SdkAndroidClassMap.UnityEngine];
        } else if (this._platform === Platform.IOS) {
            classNames = [SdkiOSClassMap.AdMob, SdkiOSClassMap.MoPub, SdkiOSClassMap.IronSource, SdkiOSClassMap.Fyber, SdkiOSClassMap.SafeDK, SdkiOSClassMap.UnityEngine];
        } else {
            classNames = [];
        }
        promises.push(this._core.ClassDetection.areClassesPresent(classNames)
            .then(result => {
                this.set('AdMob', result[0]);
                this.set('MoPub', result[1]);
                this.set('IronSource', result[2]);
                this.set('Fyber', result[3]);
                this.set('SafeDK', result[4]);
                this.set('UnityEngine', result[5]);
            }).catch(err => this.handleDeviceInfoError(err)));
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
            'AdMob': this.get('AdMob'),
            'MoPub': this.get('MoPub'),
            'IronSource': this.get('IronSource'),
            'Fyber': this.get('Fyber'),
            'SafeDK': this.get('SafeDK'),
            'UnityEngine': this.get('UnityEngine')
        };
    }
}
