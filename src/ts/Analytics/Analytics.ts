import { Ads, AdsModule } from '../Ads/Ads';
import { CustomFeatures } from '../Ads/Utilities/CustomFeatures';
import { AnalyticsManager } from './AnalyticsManager';
import { AnalyticsStorage } from './AnalyticsStorage';

export class Analytics extends AdsModule {

    public AnalyticsManager: AnalyticsManager;

    constructor(ads: Ads) {
        super(ads);
    }

    public initialize(): Promise<void> {
        let analyticsPromise;
        if(this.Core.Config.isAnalyticsEnabled() || CustomFeatures.isExampleGameId(this.Core.ClientInfo.getGameId())) {
            this.AnalyticsManager = new AnalyticsManager(this);
            analyticsPromise = this.AnalyticsManager.init().then(() => {
                this.Ads.SessionManager.setGameSessionId(this.AnalyticsManager.getGameSessionId());
            });
        } else {
            const analyticsStorage: AnalyticsStorage = new AnalyticsStorage(this);
            analyticsPromise = analyticsStorage.getSessionId(this.Core.ClientInfo.isReinitialized()).then(gameSessionId => {
                analyticsStorage.setSessionId(gameSessionId);
                this.Ads.SessionManager.setGameSessionId(gameSessionId);
            });
        }
        return analyticsPromise;
    }

}
