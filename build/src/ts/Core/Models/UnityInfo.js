import { Model } from 'Core/Models/Model';
import { Platform } from 'Core/Constants/Platform';
export class UnityInfo extends Model {
    constructor(platform, core) {
        super('UnityInfo', {
            analyticsUserId: ['string', 'undefined'],
            analyticsSessionId: ['string', 'undefined']
        });
        this._platform = platform;
        this._core = core;
    }
    fetch(applicationName) {
        let nativeUserIdPromise;
        let nativeSessionIdPromise;
        if (this._platform === Platform.IOS) {
            nativeUserIdPromise = this._core.iOS.Preferences.getString(UnityInfo._userIdKey);
            nativeSessionIdPromise = this._core.iOS.Preferences.getString(UnityInfo._sessionIdKey);
        }
        else {
            // from Unity engine PlatformDependent/AndroidPlayer/Source/PlayerPrefs.cpp
            const settingsFile = applicationName + '.v2.playerprefs';
            nativeUserIdPromise = this._core.Android.Preferences.getString(settingsFile, UnityInfo._userIdKey);
            nativeSessionIdPromise = this._core.Android.Preferences.getString(settingsFile, UnityInfo._sessionIdKey);
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
        return Promise.all([userIdPromise, sessionIdPromise]);
    }
    getAnalyticsUserId() {
        return this.get('analyticsUserId');
    }
    getAnalyticsSessionId() {
        return this.get('analyticsSessionId');
    }
    getDTO() {
        return {
            'analyticsUserId': this.getAnalyticsUserId(),
            'analyticsSessionId': this.getAnalyticsSessionId()
        };
    }
}
// from Unity engine Modules/UnityAnalytics/CoreStats/UnityConnectService.cpp
UnityInfo._userIdKey = 'unity.cloud_userid';
UnityInfo._sessionIdKey = 'unity.player_sessionid';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVW5pdHlJbmZvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0NvcmUvTW9kZWxzL1VuaXR5SW5mby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFFMUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBT25ELE1BQU0sT0FBTyxTQUFVLFNBQVEsS0FBaUI7SUFRNUMsWUFBWSxRQUFrQixFQUFFLElBQWM7UUFDMUMsS0FBSyxDQUFDLFdBQVcsRUFBRTtZQUNmLGVBQWUsRUFBRSxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUM7WUFDeEMsa0JBQWtCLEVBQUUsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDO1NBQzlDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO1FBQzFCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0lBQ3RCLENBQUM7SUFFTSxLQUFLLENBQUMsZUFBdUI7UUFDaEMsSUFBSSxtQkFBb0MsQ0FBQztRQUN6QyxJQUFJLHNCQUF1QyxDQUFDO1FBRTVDLElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxRQUFRLENBQUMsR0FBRyxFQUFFO1lBQ2pDLG1CQUFtQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ2xGLHNCQUFzQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1NBQzNGO2FBQU07WUFDSCwyRUFBMkU7WUFDM0UsTUFBTSxZQUFZLEdBQUcsZUFBZSxHQUFHLGlCQUFpQixDQUFDO1lBQ3pELG1CQUFtQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBUSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNwRyxzQkFBc0IsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVEsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLFlBQVksRUFBRSxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUM7U0FDN0c7UUFFRCxNQUFNLGFBQWEsR0FBRyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDcEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN4QyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFO1lBQ1YsZ0NBQWdDO1FBQ3BDLENBQUMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxnQkFBZ0IsR0FBRyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDN0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUM5QyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFO1lBQ1YsbUNBQW1DO1FBQ3ZDLENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsYUFBYSxFQUFFLGdCQUFnQixDQUFDLENBQUMsQ0FBQztJQUMxRCxDQUFDO0lBRU0sa0JBQWtCO1FBQ3JCLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFTSxxQkFBcUI7UUFDeEIsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUVNLE1BQU07UUFDVCxPQUFPO1lBQ0gsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixFQUFFO1lBQzVDLG9CQUFvQixFQUFFLElBQUksQ0FBQyxxQkFBcUIsRUFBRTtTQUNyRCxDQUFDO0lBQ04sQ0FBQzs7QUEzREQsNkVBQTZFO0FBQzlELG9CQUFVLEdBQUcsb0JBQW9CLENBQUM7QUFDbEMsdUJBQWEsR0FBRyx3QkFBd0IsQ0FBQyJ9