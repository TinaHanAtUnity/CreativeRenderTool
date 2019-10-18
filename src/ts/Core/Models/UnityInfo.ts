import { Model } from 'Core/Models/Model';
import { ICoreApi } from 'Core/ICore';
import { Platform } from 'Core/Constants/Platform';

export interface IUnityInfo {
    analyticsUserId: string | undefined;
    analyticsSessionId: string | undefined; // stored as a string to avoid problems with unsigned 64 bit integers going over js max safe number limit
    isMadeWithUnity: boolean;
}

export class UnityInfo extends Model<IUnityInfo> {
    // from Unity engine Modules/UnityAnalytics/CoreStats/UnityConnectService.cpp
    private static _userIdKey = 'unity.cloud_userid';
    private static _sessionIdKey = 'unity.player_sessionid';
    private static _iOSUnityEngineClassName = 'UnityAppController';
    private static _AndroidUnityEngineClassName = 'com.unity3d.player.UnityPlayer';

    private _platform: Platform;
    private _core: ICoreApi;

    constructor(platform: Platform, core: ICoreApi) {
        super('UnityInfo', {
            analyticsUserId: ['string', 'undefined'],
            analyticsSessionId: ['string', 'undefined'],
            isMadeWithUnity: ['boolean']
        });

        this._platform = platform;
        this._core = core;
    }

    public fetch(applicationName: string): Promise<void[]> {
        let nativeUserIdPromise: Promise<string>;
        let nativeSessionIdPromise: Promise<string>;
        let nativeDetectUnityPromise: Promise<boolean>;

        if (this._platform === Platform.IOS) {
            nativeUserIdPromise = this._core.iOS!.Preferences.getString(UnityInfo._userIdKey);
            nativeSessionIdPromise = this._core.iOS!.Preferences.getString(UnityInfo._sessionIdKey);
            nativeDetectUnityPromise = this._core.ClassDetection.isClassPresent(UnityInfo._iOSUnityEngineClassName);
        } else {
            // from Unity engine PlatformDependent/AndroidPlayer/Source/PlayerPrefs.cpp
            const settingsFile = applicationName + '.v2.playerprefs';
            nativeUserIdPromise = this._core.Android!.Preferences.getString(settingsFile, UnityInfo._userIdKey);
            nativeSessionIdPromise = this._core.Android!.Preferences.getString(settingsFile, UnityInfo._sessionIdKey);
            nativeDetectUnityPromise = this._core.ClassDetection.isClassPresent(UnityInfo._AndroidUnityEngineClassName);
        }

        const userIdPromise = nativeUserIdPromise.then(userId => {
            this.set('analyticsUserId', userId);
        }).catch(() => {
            // user id not found, do nothing
        });

        const sessionIdPromise = nativeSessionIdPromise.then(sessionId => {
            this.set('analyticsSessionId', sessionId);
        }).catch(() => {
            // session id not found, do nothing
        });

        const detectUnityPromise = nativeDetectUnityPromise.then(isMadeWithUnity => {
            this.set('isMadeWithUnity', isMadeWithUnity);
        }).catch(() => {
            this.set('isMadeWithUnity', false);
        });

        return Promise.all([userIdPromise, sessionIdPromise, detectUnityPromise]);
    }

    public getAnalyticsUserId(): string | undefined {
        return this.get('analyticsUserId');
    }

    public getAnalyticsSessionId(): string | undefined {
        return this.get('analyticsSessionId');
    }

    public isMadeWithUnity(): boolean {
        return this.get('isMadeWithUnity');
    }

    public getDTO() {
        return {
            'analyticsUserId': this.getAnalyticsUserId(),
            'analyticsSessionId': this.getAnalyticsSessionId()
        };
    }
}
