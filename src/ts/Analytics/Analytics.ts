import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { AnalyticsManager } from 'Analytics/AnalyticsManager';
import { ICore } from 'Core/ICore';
import { IAnalytics } from './IAnalytics';

export class Analytics implements IAnalytics {

    public AnalyticsManager: AnalyticsManager;

    constructor(core: ICore) {
        if(core.Config.isAnalyticsEnabled() || CustomFeatures.isExampleGameId(core.ClientInfo.getGameId())) {
            this.AnalyticsManager = new AnalyticsManager(core.NativeBridge.getPlatform(), core.Api, core.WakeUpManager, core.RequestManager, core.ClientInfo, core.DeviceInfo, core.Config, core.FocusManager);
            this.AnalyticsManager.init();
        }
    }

}
