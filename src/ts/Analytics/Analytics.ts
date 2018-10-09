import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { AnalyticsManager } from 'Analytics/AnalyticsManager';
import { Core, CoreModule } from 'Core/Core';

export class Analytics extends CoreModule {

    public AnalyticsManager: AnalyticsManager;

    constructor(core: Core) {
        super(core);
    }

    public initialize(): Promise<void> {
        if(this.Core.Config.isAnalyticsEnabled() || CustomFeatures.isExampleGameId(this.Core.ClientInfo.getGameId())) {
            this.AnalyticsManager = new AnalyticsManager(this.Core.NativeBridge.getPlatform(), this.Core.Api, this.Core.WakeUpManager, this.Core.RequestManager, this.Core.ClientInfo, this.Core.DeviceInfo, this.Core.Config, this.Core.FocusManager);
            return this.AnalyticsManager.init().then(() => {
                this._initialized = true;
            });
        }
        return Promise.resolve();
    }

}
