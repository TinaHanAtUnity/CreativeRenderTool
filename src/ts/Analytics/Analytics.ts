import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { AnalyticsManager } from 'Analytics/AnalyticsManager';
import { AnalyticsStorage } from 'Analytics/AnalyticsStorage';
import { IAnalytics, IAnalyticsApi } from 'Analytics/IAnalytics';
import { AnalyticsApi } from 'Analytics/Native/Analytics';
import { ICore } from 'Core/ICore';
import { SilentAnalyticsManager } from 'Analytics/SilentAnalyticsManager';
import { IAnalyticsManager } from 'Analytics/IAnalyticsManager';
import { PrivacySDK } from 'Privacy/PrivacySDK';

export class Analytics implements IAnalytics {

    public readonly Api: Readonly<IAnalyticsApi>;

    public AnalyticsManager: IAnalyticsManager;
    public AnalyticsStorage: AnalyticsStorage;

    private _core: ICore;
    private _analyticsEnabled: boolean;

    constructor(core: ICore, privacySDK: PrivacySDK) {
        this._core = core;
        this._analyticsEnabled = core.Config.isAnalyticsEnabled() || CustomFeatures.isExampleGameId(this._core.ClientInfo.getGameId());
        this.Api = {
            Analytics: new AnalyticsApi(core.NativeBridge)
        };

        this.AnalyticsStorage = new AnalyticsStorage(core.Api);
        if (this._analyticsEnabled) {
            this.AnalyticsManager = new AnalyticsManager(core, this.Api, privacySDK, this.AnalyticsStorage);
        } else {
            this.AnalyticsManager = new SilentAnalyticsManager();
        }
    }

    public initialize(): Promise<number> {
        if (this._analyticsEnabled) {
            return this.AnalyticsManager.init().then(() => {
                return this.AnalyticsManager.getGameSessionId();
            });
        } else {
            return this.AnalyticsStorage.getSessionId(this._core.ClientInfo.isReinitialized()).then(gameSessionId => {
                this.AnalyticsStorage.setSessionId(gameSessionId);
                return gameSessionId;
            });
        }
    }

}
