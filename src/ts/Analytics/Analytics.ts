import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { AnalyticsManager } from 'Analytics/AnalyticsManager';
import { AnalyticsStorage } from 'Analytics/AnalyticsStorage';
import { IAnalytics, IAnalyticsApi } from 'Analytics/IAnalytics';
import { AnalyticsApi } from 'Analytics/Native/Analytics';
import { ICore } from 'Core/ICore';
import { IApiModule } from 'Core/Modules/IApiModule';

export class Analytics implements IAnalytics, IApiModule {

    public readonly Api: Readonly<IAnalyticsApi>;

    public AnalyticsManager: AnalyticsManager;
    public AnalyticsStorage: AnalyticsStorage;

    constructor(core: ICore) {
        this.Api = {
            Analytics: new AnalyticsApi(core.NativeBridge)
        };

        if(core.Config.isAnalyticsEnabled() || CustomFeatures.isExampleGameId(core.ClientInfo.getGameId())) {
            this.AnalyticsStorage = new AnalyticsStorage(core.Api);
            this.AnalyticsManager = new AnalyticsManager(core.NativeBridge.getPlatform(), core.Api, this.Api, core.RequestManager, core.ClientInfo, core.DeviceInfo, core.Config, core.FocusManager, this.AnalyticsStorage);
            this.AnalyticsManager.init();
        }
    }

}
