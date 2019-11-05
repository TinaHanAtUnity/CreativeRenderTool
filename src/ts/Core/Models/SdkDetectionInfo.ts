import {Platform} from 'Core/Constants/Platform';
import {ICoreApi} from 'Core/ICore';
import {ISchema, Model} from 'Core/Models/Model';

export interface ISdkDetectionInfo {
    AdMob: boolean | undefined;
    MoPub: boolean | undefined;
    IronSource: boolean | undefined;
    Fyber: boolean | undefined;
    SafeDK: boolean | undefined;
    UnityEngine: boolean | undefined;
}

const SdkAndroidClassMap = new Map<string, string>([
    ['com.google.ads.mediation.admob.AdMobAdapter', 'AdMob'],
    ['com.mopub.common.MoPub', 'MoPub'],
    ['com.ironsource.mediationsdk.IronSource', 'IronSource'],
    ['com.fyber.FairBid', 'Fyber'],
    ['com.safedk.android.SafeDK', 'SafeDK'],
    ['com.unity3d.player.UnityPlayer', 'UnityEngine']
]);

const SdkiOSClassMap = new Map<string, string>([
    ['GADMobileAds', 'AdMob'],
    ['MoPub', 'MoPub'],
    ['IronSource', 'IronSource'],
    ['FyberSDK', 'Fyber'],
    ['SafeDK', 'SafeDK'],
    ['UnityAppController', 'UnityEngine']
]);

export class SdkDetectionInfo extends Model<ISdkDetectionInfo> {

    public static Schema: ISchema<ISdkDetectionInfo> = {
        AdMob: ['boolean', 'undefined'],
        MoPub: ['boolean', 'undefined'],
        IronSource: ['boolean', 'undefined'],
        Fyber: ['boolean', 'undefined'],
        SafeDK: ['boolean', 'undefined'],
        UnityEngine: ['boolean', 'undefined']
    };

    protected _platform: Platform;
    protected _core: ICoreApi;

    constructor(platform: Platform, core: ICoreApi) {
        super('SdkDetectionInfo', {
            AdMob: ['boolean', 'undefined'],
            MoPub: ['boolean', 'undefined'],
            IronSource: ['boolean', 'undefined'],
            Fyber: ['boolean', 'undefined'],
            SafeDK: ['boolean', 'undefined'],
            UnityEngine: ['boolean', 'undefined']
        });

        this._platform = platform;
        this._core = core;
    }

    public detectSdks(): Promise<unknown[]> {
        const promises: Promise<unknown>[] = [];
        let classNames: string[];
        if (this._platform === Platform.ANDROID) {
            classNames = Array.from(SdkAndroidClassMap.keys());
        } else if (this._platform === Platform.IOS) {
            classNames = Array.from(SdkiOSClassMap.keys());
        } else {
            classNames = [];
        }
        promises.push(this._core.ClassDetection.areClassesPresent(classNames)
            .then(results => {
                results.forEach(r => {
                    let name: string = '';
                    if (this._platform === Platform.ANDROID) {
                        name = SdkAndroidClassMap.get(r.class)!;
                    } else if (this._platform === Platform.IOS) {
                        name = SdkiOSClassMap.get(r.class)!;
                    }
                    if (name === 'AdMob') { this.set('AdMob', r.found); }
                    if (name === 'MoPub') { this.set('MoPub', r.found); }
                    if (name === 'IronSource') { this.set('IronSource', r.found); }
                    if (name === 'Fyber') { this.set('Fyber', r.found); }
                    if (name === 'SafeDK') { this.set('SafeDK', r.found); }
                    if (name === 'UnityEngine') { this.set('UnityEngine', r.found); }
                });
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
