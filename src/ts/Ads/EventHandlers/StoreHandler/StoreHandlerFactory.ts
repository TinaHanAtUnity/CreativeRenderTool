import { IStoreHandlerParameters, StoreHandler } from 'Ads/EventHandlers/StoreHandler/StoreHandler';
import { AppleStoreHandler } from 'Ads/EventHandlers/StoreHandler/AppleStoreHandler';
import { GoogleStoreHandler } from 'Ads/EventHandlers/StoreHandler/GoogleStoreHandler';
import { StandaloneAndroidStoreHandler } from 'Ads/EventHandlers/StoreHandler/StandaloneAndroidStoreHandler';
import { Platform } from 'Core/Constants/Platform';
import { PerformanceCampaign, StoreName } from 'Performance/Models/PerformanceCampaign';

export class StoreHandlerFactory {

    public static getNewStoreHandler(storeHandlerParameters: IStoreHandlerParameters): StoreHandler {
        if (storeHandlerParameters.adUnit instanceof PerformanceCampaign &&
            storeHandlerParameters.campaign instanceof PerformanceCampaign &&
            storeHandlerParameters.campaign.getStore() === StoreName.STANDALONE_ANDROID) {
            return new StandaloneAndroidStoreHandler(storeHandlerParameters);
        }
        if (storeHandlerParameters.platform === Platform.IOS) {
            return new AppleStoreHandler(storeHandlerParameters);
        } else if (storeHandlerParameters.platform === Platform.ANDROID) {
            return new GoogleStoreHandler(storeHandlerParameters);
        } else {
            throw new Error('Invalid store for creating new store handler');
        }
    }
}
