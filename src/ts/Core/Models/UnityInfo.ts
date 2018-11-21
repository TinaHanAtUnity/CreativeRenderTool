import { Model } from 'Core/Models/Model';
import { ICoreApi } from 'Core/ICore';
import { Platform } from 'Core/Constants/Platform';

export interface IUnityInfo {
    analyticsUserId: string | undefined;
    analyticsSessionId: number | undefined;
}

export class UnityInfo extends Model<IUnityInfo> {
    // from Unity engine Modules/UnityAnalytics/CoreStats/UnityConnectService.cpp
    private static _userIdKey = 'unity.cloud_userid';
    private static _sessionIdKey = 'unity.player_sessionid';

    private _platform: Platform;
    private _core: ICoreApi;

    constructor(platform: Platform, core: ICoreApi) {
        super('UnityInfo', {
            analyticsUserId: ['string', 'undefined'],
            analyticsSessionId: ['number', 'undefined']
        });

        this._platform = platform;
        this._core = core;
    }

    public fetch(applicationName: string): Promise<void[]> {
        let nativeUserIdPromise: Promise<string>;
        let nativeSessionIdPromise: Promise<string>;

        if(this._platform === Platform.IOS) {
            nativeUserIdPromise = this._core.iOS!.Preferences.getString(UnityInfo._userIdKey);
            nativeSessionIdPromise = this._core.iOS!.Preferences.getString(UnityInfo._sessionIdKey);
        } else {
            // from Unity engine PlatformDependent/AndroidPlayer/Source/PlayerPrefs.cpp
            const settingsFile = applicationName + '.v2.playerprefs';

            nativeUserIdPromise = this._core.Android!.Preferences.getString(settingsFile, UnityInfo._userIdKey);
            nativeSessionIdPromise = this._core.Android!.Preferences.getString(settingsFile, UnityInfo._sessionIdKey);
        }

        const userIdPromise = nativeUserIdPromise.then(userId => {
            this.set('analyticsUserId', userId);
        }).catch(() => {
            // user id not found, do nothing
        });

        const sessionIdPromise = nativeSessionIdPromise.then(sessionId => {
            this.set('analyticsSessionId', parseInt(sessionId, 10));
        }).catch(() => {
            // session id not found, do nothing
        });

        return Promise.all([userIdPromise, sessionIdPromise]);
    }

    public getAnalyticsUserId(): string | undefined {
        return this.get('analyticsUserId');
    }

    public getAnalyticsSessionId(): number | undefined {
        return this.get('analyticsSessionId');
    }

    public getDTO() {
        return {
            'analyticsUserId': this.getAnalyticsUserId(),
            'analyticsSessionId': this.getAnalyticsSessionId()
        };
    }
}
