import { IStoreHandlerParameters, StoreHandler } from 'Ads/EventHandlers/StoreHandlers/StoreHandler';
import { AppleStoreHandler } from 'Ads/EventHandlers/StoreHandlers/AppleStoreHandler';
import { GoogleStoreHandler } from 'Ads/EventHandlers/StoreHandlers/GoogleStoreHandler';
import { StandaloneAndroidStoreHandler } from 'Ads/EventHandlers/StoreHandlers/StandaloneAndroidStoreHandler';
import { Platform } from 'Core/Constants/Platform';
import { PerformanceCampaign, StoreName } from 'Performance/Models/PerformanceCampaign';
import { XiaomiStoreHandler } from 'Ads/EventHandlers/StoreHandlers/XiaomiStoreHandler';

export class StoreHandlerFactory {

    /**
     * Factory method for constructing instance of StoreHandlers concrete class.
     * @param storeHandlerParameters parameters for deciding which concrete class to construct and the construct itself.
     * @returns the newly created instance of StoreHandlers concrete class.
     */
    public static getNewStoreHandler(storeHandlerParameters: IStoreHandlerParameters): StoreHandler {
        if (this.isAPKCampaign(storeHandlerParameters)) {
            return new StandaloneAndroidStoreHandler(storeHandlerParameters);
        } else if (storeHandlerParameters.platform === Platform.IOS) {
            return new AppleStoreHandler(storeHandlerParameters);
        } else if (this.isXiaomi(storeHandlerParameters)) {
            return new XiaomiStoreHandler(storeHandlerParameters);
        } else if (storeHandlerParameters.platform === Platform.ANDROID) {
            return new GoogleStoreHandler(storeHandlerParameters);
        } else {
            throw new Error('Invalid store for creating new store handler');
        }
    }

    private static isXiaomi(storeHandlerParameters: IStoreHandlerParameters): boolean {
        return storeHandlerParameters.campaign instanceof PerformanceCampaign &&
            storeHandlerParameters.campaign.getStore() === StoreName.XIAOMI;
    }

    private static isAPKCampaign(storeHandlerParameters: IStoreHandlerParameters): boolean {
        return storeHandlerParameters.adUnit instanceof PerformanceCampaign &&
            storeHandlerParameters.campaign instanceof PerformanceCampaign &&
            storeHandlerParameters.campaign.getStore() === StoreName.STANDALONE_ANDROID;
    }
}
