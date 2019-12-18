import {BackendApi} from 'Backend/BackendApi';
import {Platform} from 'Core/Constants/Platform';

export class ClassDetection extends BackendApi {

    private _classesArePresent: boolean = false;
    private _platform: Platform = Platform.TEST;
    public setClassesArePresent(present: boolean) {
        this._classesArePresent = present;
    }
    public setPlatform(platform: Platform) {
       this._platform = platform;
    }

    public areClassesPresent(className: string[]) {
        if (this._classesArePresent) {
            if (this._platform === Platform.ANDROID) {
                return [{class: 'com.google.ads.mediation.admob.AdMobAdapter', found: true}, {class: 'com.mopub.common.MoPub', found: true}, {class: 'com.ironsource.mediationsdk.IronSource', found: true}, {class: 'com.fyber.FairBid', found: true}, {class: 'com.safedk.android.SafeDK', found: true}, {class: 'com.unity3d.player.UnityPlayer', found: true}];
            }
            if (this._platform === Platform.IOS) {
                return [{class: 'GADMobileAds', found: true}, {class: 'MoPub', found: true}, {class: 'IronSource', found: true}, {class: 'FyberSDK', found: true}, {class: 'SafeDK', found: true}, {class: 'UnityAppController', found: true}];
            }
            return [];
        }
        if (this._platform === Platform.ANDROID) {
            return [{class: 'com.google.ads.mediation.admob.AdMobAdapter', found: false}, {class: 'com.mopub.common.MoPub', found: false}, {class: 'com.ironsource.mediationsdk.IronSource', found: false}, {class: 'com.fyber.FairBid', found: false}, {class: 'com.safedk.android.SafeDK', found: false}, {class: 'com.unity3d.player.UnityPlayer', found: false}];
        }
        if (this._platform === Platform.IOS) {
            return [{class: 'GADMobileAds', found: false}, {class: 'MoPub', found: false}, {class: 'IronSource', found: false}, {class: 'FyberSDK', found: false}, {class: 'SafeDK', found: false}, {class: 'UnityAppController', found: false}];
        }
        return [];
    }
}
