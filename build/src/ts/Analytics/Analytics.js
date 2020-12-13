import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { AnalyticsManager } from 'Analytics/AnalyticsManager';
import { AnalyticsStorage } from 'Analytics/AnalyticsStorage';
import { AnalyticsApi } from 'Analytics/Native/Analytics';
import { SilentAnalyticsManager } from 'Analytics/SilentAnalyticsManager';
export class Analytics {
    constructor(core, privacySDK) {
        this._core = core;
        this._analyticsEnabled = core.Config.isAnalyticsEnabled() || CustomFeatures.isExampleGameId(this._core.ClientInfo.getGameId());
        this.Api = {
            Analytics: new AnalyticsApi(core.NativeBridge)
        };
        this.AnalyticsStorage = new AnalyticsStorage(core.Api);
        if (this._analyticsEnabled) {
            this.AnalyticsManager = new AnalyticsManager(core, this.Api, privacySDK, this.AnalyticsStorage);
        }
        else {
            this.AnalyticsManager = new SilentAnalyticsManager();
        }
    }
    initialize() {
        if (this._analyticsEnabled) {
            return this.AnalyticsManager.init().then(() => {
                return this.AnalyticsManager.getGameSessionId();
            });
        }
        else {
            return this.AnalyticsStorage.getSessionId(this._core.ClientInfo.isReinitialized()).then(gameSessionId => {
                this.AnalyticsStorage.setSessionId(gameSessionId);
                return gameSessionId;
            });
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQW5hbHl0aWNzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3RzL0FuYWx5dGljcy9BbmFseXRpY3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzlELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQzlELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBRTlELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUUxRCxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUkxRSxNQUFNLE9BQU8sU0FBUztJQVVsQixZQUFZLElBQVcsRUFBRSxVQUFzQjtRQUMzQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUNsQixJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLGNBQWMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztRQUMvSCxJQUFJLENBQUMsR0FBRyxHQUFHO1lBQ1AsU0FBUyxFQUFFLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUM7U0FDakQsQ0FBQztRQUVGLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLGdCQUFnQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN2RCxJQUFJLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtZQUN4QixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7U0FDbkc7YUFBTTtZQUNILElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLHNCQUFzQixFQUFFLENBQUM7U0FDeEQ7SUFDTCxDQUFDO0lBRU0sVUFBVTtRQUNiLElBQUksSUFBSSxDQUFDLGlCQUFpQixFQUFFO1lBQ3hCLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7Z0JBQzFDLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDcEQsQ0FBQyxDQUFDLENBQUM7U0FDTjthQUFNO1lBQ0gsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFO2dCQUNwRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDO2dCQUNsRCxPQUFPLGFBQWEsQ0FBQztZQUN6QixDQUFDLENBQUMsQ0FBQztTQUNOO0lBQ0wsQ0FBQztDQUVKIn0=