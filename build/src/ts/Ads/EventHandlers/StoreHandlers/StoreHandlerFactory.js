import { AppleStoreHandler } from 'Ads/EventHandlers/StoreHandlers/AppleStoreHandler';
import { GoogleStoreHandler } from 'Ads/EventHandlers/StoreHandlers/GoogleStoreHandler';
import { StandaloneAndroidStoreHandler } from 'Ads/EventHandlers/StoreHandlers/StandaloneAndroidStoreHandler';
import { Platform } from 'Core/Constants/Platform';
import { PerformanceCampaign, StoreName } from 'Performance/Models/PerformanceCampaign';
import { XiaomiStoreHandler } from 'Ads/EventHandlers/StoreHandlers/XiaomiStoreHandler';
import { PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
export class StoreHandlerFactory {
    /**
     * Factory method for constructing instance of StoreHandlers concrete class.
     * @param storeHandlerParameters parameters for deciding which concrete class to construct and the construct itself.
     * @returns the newly created instance of StoreHandlers concrete class.
     */
    static getNewStoreHandler(storeHandlerParameters) {
        if (this.isAPKCampaign(storeHandlerParameters)) {
            return new StandaloneAndroidStoreHandler(storeHandlerParameters);
        }
        else if (storeHandlerParameters.platform === Platform.IOS) {
            return new AppleStoreHandler(storeHandlerParameters);
        }
        else if (this.isXiaomi(storeHandlerParameters)) {
            return new XiaomiStoreHandler(storeHandlerParameters);
        }
        else if (storeHandlerParameters.platform === Platform.ANDROID) {
            return new GoogleStoreHandler(storeHandlerParameters);
        }
        else {
            throw new Error('Invalid store for creating new store handler');
        }
    }
    static isXiaomi(storeHandlerParameters) {
        return storeHandlerParameters.campaign instanceof PerformanceCampaign &&
            storeHandlerParameters.campaign.getStore() === StoreName.XIAOMI;
    }
    static isAPKCampaign(storeHandlerParameters) {
        return storeHandlerParameters.adUnit instanceof PerformanceAdUnit &&
            storeHandlerParameters.campaign instanceof PerformanceCampaign &&
            storeHandlerParameters.campaign.getStore() === StoreName.STANDALONE_ANDROID;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RvcmVIYW5kbGVyRmFjdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy90cy9BZHMvRXZlbnRIYW5kbGVycy9TdG9yZUhhbmRsZXJzL1N0b3JlSGFuZGxlckZhY3RvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sbURBQW1ELENBQUM7QUFDdEYsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sb0RBQW9ELENBQUM7QUFDeEYsT0FBTyxFQUFFLDZCQUE2QixFQUFFLE1BQU0sK0RBQStELENBQUM7QUFDOUcsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ25ELE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxTQUFTLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUN4RixPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxvREFBb0QsQ0FBQztBQUN4RixPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUUxRSxNQUFNLE9BQU8sbUJBQW1CO0lBRTVCOzs7O09BSUc7SUFDSSxNQUFNLENBQUMsa0JBQWtCLENBQUMsc0JBQStDO1FBQzVFLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxzQkFBc0IsQ0FBQyxFQUFFO1lBQzVDLE9BQU8sSUFBSSw2QkFBNkIsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1NBQ3BFO2FBQU0sSUFBSSxzQkFBc0IsQ0FBQyxRQUFRLEtBQUssUUFBUSxDQUFDLEdBQUcsRUFBRTtZQUN6RCxPQUFPLElBQUksaUJBQWlCLENBQUMsc0JBQXNCLENBQUMsQ0FBQztTQUN4RDthQUFNLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsQ0FBQyxFQUFFO1lBQzlDLE9BQU8sSUFBSSxrQkFBa0IsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1NBQ3pEO2FBQU0sSUFBSSxzQkFBc0IsQ0FBQyxRQUFRLEtBQUssUUFBUSxDQUFDLE9BQU8sRUFBRTtZQUM3RCxPQUFPLElBQUksa0JBQWtCLENBQUMsc0JBQXNCLENBQUMsQ0FBQztTQUN6RDthQUFNO1lBQ0gsTUFBTSxJQUFJLEtBQUssQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFDO1NBQ25FO0lBQ0wsQ0FBQztJQUVPLE1BQU0sQ0FBQyxRQUFRLENBQUMsc0JBQStDO1FBQ25FLE9BQU8sc0JBQXNCLENBQUMsUUFBUSxZQUFZLG1CQUFtQjtZQUNqRSxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLEtBQUssU0FBUyxDQUFDLE1BQU0sQ0FBQztJQUN4RSxDQUFDO0lBRU8sTUFBTSxDQUFDLGFBQWEsQ0FBQyxzQkFBK0M7UUFDeEUsT0FBTyxzQkFBc0IsQ0FBQyxNQUFNLFlBQVksaUJBQWlCO1lBQzdELHNCQUFzQixDQUFDLFFBQVEsWUFBWSxtQkFBbUI7WUFDOUQsc0JBQXNCLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxLQUFLLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQztJQUNwRixDQUFDO0NBQ0oifQ==