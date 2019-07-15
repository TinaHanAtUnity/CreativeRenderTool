import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { AnalyticsManager } from 'Analytics/AnalyticsManager';
import { AnalyticsStorage } from 'Analytics/AnalyticsStorage';
import { IAnalytics, IAnalyticsApi } from 'Analytics/IAnalytics';
import { AnalyticsApi } from 'Analytics/Native/Analytics';
import { ICore } from 'Core/ICore';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';

export class Analytics implements IAnalytics {

    public readonly Api: Readonly<IAnalyticsApi>;

    public AnalyticsManager: AnalyticsManager;
    public AnalyticsStorage: AnalyticsStorage;

    private _core: ICore;

    constructor(core: ICore, adsConfiguration: AdsConfiguration) {
        this._core = core;

        this.Api = {
            Analytics: new AnalyticsApi(core.NativeBridge)
        };

        this.AnalyticsStorage = new AnalyticsStorage(core.Api);
        this.AnalyticsManager = new AnalyticsManager(core.NativeBridge.getPlatform(), core.Api, this.Api, core.RequestManager, core.ClientInfo, core.DeviceInfo, core.Config, adsConfiguration, core.FocusManager, this.AnalyticsStorage);
    }

    public initialize(): Promise<number> {
        if (this._core.Config.isAnalyticsEnabled() || CustomFeatures.isExampleGameId(this._core.ClientInfo.getGameId())) {
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
