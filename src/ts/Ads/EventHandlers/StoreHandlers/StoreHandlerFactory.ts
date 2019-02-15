import { IStoreHandlerParameters, StoreHandler } from 'Ads/EventHandlers/StoreHandlers/StoreHandler';
import { AppleStoreHandler, IAppleStoreHandlerParameters } from 'Ads/EventHandlers/StoreHandlers/AppleStoreHandler';
import { GoogleStoreHandler, IGoogleStoreHandlerParameters } from 'Ads/EventHandlers/StoreHandlers/GoogleStoreHandler';
import {
    IStandaloneAndroidStoreHandlerParameters,
    StandaloneAndroidStoreHandler
} from 'Ads/EventHandlers/StoreHandlers/StandaloneAndroidStoreHandler';
import { Platform } from 'Core/Constants/Platform';
import { PerformanceCampaign, StoreName } from 'Performance/Models/PerformanceCampaign';
import { IXiaomiStoreHandlerParameters, XiaomiStoreHandler } from 'Ads/EventHandlers/StoreHandlers/XiaomiStoreHandler';
import { PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';

export class StoreHandlerFactory {

    /**
     * Factory method for constructing instance of StoreHandlers concrete class.
     * @param parameters parameters for deciding which concrete class to construct and the construct itself.
     * @returns the newly created instance of StoreHandlers concrete class.
     */
    public static getNewStoreHandler(parameters: IStoreHandlerParameters): StoreHandler {
        if (this.isAPKCampaign(parameters)) {
            if (!parameters.deviceInfo || !parameters.coreConfig || !parameters.clientInfo) {
                throw new Error('Missing deviceInfo, coreConfig, or clientInfo for creating StandaloneAndroidStoreHandler');
            }
            return new StandaloneAndroidStoreHandler(<IStandaloneAndroidStoreHandlerParameters>parameters);
        } else if (parameters.platform === Platform.IOS) {
            if (!parameters.deviceInfo) {
                throw new Error('Missing deviceInfo for creating AppleStoreHandler');
            }
            return new AppleStoreHandler(<IAppleStoreHandlerParameters>parameters);
        } else if (this.isXiaomi(parameters)) {
            if (!parameters.clientInfo || !parameters.coreConfig) {
                throw new Error('Missing clientInfo or coreConfig for creating XiaomiStoreHandler');
            }
            return new XiaomiStoreHandler(<IXiaomiStoreHandlerParameters>parameters);
        } else if (parameters.platform === Platform.ANDROID) {
            if (!parameters.clientInfo) {
                throw new Error('Missing clientInfo for creating GoogleStoreHandler');
            }
            return new GoogleStoreHandler(<IGoogleStoreHandlerParameters>parameters);
        } else {
            throw new Error('Invalid store for creating new store handler');
        }
    }

    private static isXiaomi(parameters: IStoreHandlerParameters): boolean {
        return parameters.campaign instanceof PerformanceCampaign &&
            parameters.campaign.getStore() === StoreName.XIAOMI;
    }

    private static isAPKCampaign(parameters: IStoreHandlerParameters): boolean {
        return parameters.adUnit instanceof PerformanceAdUnit &&
            parameters.campaign instanceof PerformanceCampaign &&
            parameters.campaign.getStore() === StoreName.STANDALONE_ANDROID;
    }
}
