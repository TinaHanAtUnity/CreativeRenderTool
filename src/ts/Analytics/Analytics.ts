import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { AnalyticsManager } from 'Analytics/AnalyticsManager';
import { ICore } from 'Core/ICore';
import { IAnalytics, IAnalyticsApi } from './IAnalytics';
import { IApiModule } from '../Core/Modules/IApiModule';
import { AnalyticsApi } from './Native/Analytics';

export class Analytics implements IAnalytics, IApiModule {

    public readonly Api: Readonly<IAnalyticsApi>;

    public AnalyticsManager: AnalyticsManager;

    constructor(core: ICore) {
        this.Api = {
            Analytics: new AnalyticsApi(core.NativeBridge)
        };

        if(core.Config.isAnalyticsEnabled() || CustomFeatures.isExampleGameId(core.ClientInfo.getGameId())) {
            this.AnalyticsManager = new AnalyticsManager(core.NativeBridge.getPlatform(), core.Api, this.Api, core.RequestManager, core.ClientInfo, core.DeviceInfo, core.Config, core.FocusManager);
            this.AnalyticsManager.init();
        }
    }

}
