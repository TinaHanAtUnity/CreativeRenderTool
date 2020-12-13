import { Model } from 'Core/Models/Model';
export var CacheMode;
(function (CacheMode) {
    CacheMode[CacheMode["FORCED"] = 0] = "FORCED";
    CacheMode[CacheMode["ALLOWED"] = 1] = "ALLOWED";
    CacheMode[CacheMode["DISABLED"] = 2] = "DISABLED";
})(CacheMode || (CacheMode = {}));
export class CoreConfiguration extends Model {
    constructor(data) {
        super('Configuration', CoreConfiguration.Schema, data);
    }
    isEnabled() {
        return this.get('enabled');
    }
    getCountry() {
        return this.get('country');
    }
    getSubdivision() {
        return this.get('subdivision');
    }
    isCoppaCompliant() {
        return this.get('coppaCompliant');
    }
    isAnalyticsEnabled() {
        return this.get('analytics');
    }
    isJaegerTracingEnabled() {
        return this.get('jaegerTracing');
    }
    getAbGroup() {
        return this.get('abGroup');
    }
    getProperties() {
        return this.get('properties');
    }
    getToken() {
        return this.get('token');
    }
    getUnityProjectId() {
        return this.get('projectId');
    }
    getTestMode() {
        return this.get('test');
    }
    getOrganizationId() {
        return this.get('organizationId');
    }
    getDeveloperId() {
        return this.get('developerId');
    }
    getFeatureFlags() {
        return this.get('featureFlags');
    }
    getDTO() {
        return {
            'enabled': this.isEnabled(),
            'country': this.getCountry(),
            'coppaCompliant': this.isCoppaCompliant(),
            'abGroup': this.getAbGroup(),
            'gamerToken': this.getToken(),
            'projectId': this.getUnityProjectId(),
            'testMode': this.getTestMode(),
            'organizationId': this.getOrganizationId(),
            'developerId': this.getDeveloperId(),
            'featureFlags': this.getFeatureFlags()
        };
    }
}
CoreConfiguration.Schema = {
    enabled: ['boolean'],
    country: ['string'],
    subdivision: ['string'],
    coppaCompliant: ['boolean'],
    abGroup: ['number'],
    properties: ['string'],
    analytics: ['boolean'],
    test: ['boolean'],
    projectId: ['string'],
    token: ['string'],
    jaegerTracing: ['boolean'],
    organizationId: ['string', 'undefined'],
    developerId: ['number', 'undefined'],
    featureFlags: ['array']
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29yZUNvbmZpZ3VyYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQ29yZS9Nb2RlbHMvQ29yZUNvbmZpZ3VyYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFXLEtBQUssRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRW5ELE1BQU0sQ0FBTixJQUFZLFNBSVg7QUFKRCxXQUFZLFNBQVM7SUFDakIsNkNBQU0sQ0FBQTtJQUNOLCtDQUFPLENBQUE7SUFDUCxpREFBUSxDQUFBO0FBQ1osQ0FBQyxFQUpXLFNBQVMsS0FBVCxTQUFTLFFBSXBCO0FBbUJELE1BQU0sT0FBTyxpQkFBa0IsU0FBUSxLQUF5QjtJQWtCNUQsWUFBWSxJQUF3QjtRQUNoQyxLQUFLLENBQUMsZUFBZSxFQUFFLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztJQUMzRCxDQUFDO0lBRU0sU0FBUztRQUNaLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRU0sVUFBVTtRQUNiLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRU0sY0FBYztRQUNqQixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUVNLGdCQUFnQjtRQUNuQixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBRU0sa0JBQWtCO1FBQ3JCLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUNqQyxDQUFDO0lBRU0sc0JBQXNCO1FBQ3pCLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRU0sVUFBVTtRQUNiLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRU0sYUFBYTtRQUNoQixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUVNLFFBQVE7UUFDWCxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDN0IsQ0FBQztJQUVNLGlCQUFpQjtRQUNwQixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUVNLFdBQVc7UUFDZCxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDNUIsQ0FBQztJQUVNLGlCQUFpQjtRQUNwQixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBRU0sY0FBYztRQUNqQixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUVNLGVBQWU7UUFDbEIsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFFTSxNQUFNO1FBQ1QsT0FBTztZQUNILFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQzNCLFNBQVMsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQzVCLGdCQUFnQixFQUFFLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtZQUN6QyxTQUFTLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUM1QixZQUFZLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUM3QixXQUFXLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixFQUFFO1lBQ3JDLFVBQVUsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQzlCLGdCQUFnQixFQUFFLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtZQUMxQyxhQUFhLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRTtZQUNwQyxjQUFjLEVBQUUsSUFBSSxDQUFDLGVBQWUsRUFBRTtTQUN6QyxDQUFDO0lBQ04sQ0FBQzs7QUExRmEsd0JBQU0sR0FBZ0M7SUFDaEQsT0FBTyxFQUFFLENBQUMsU0FBUyxDQUFDO0lBQ3BCLE9BQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQztJQUNuQixXQUFXLEVBQUUsQ0FBQyxRQUFRLENBQUM7SUFDdkIsY0FBYyxFQUFFLENBQUMsU0FBUyxDQUFDO0lBQzNCLE9BQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQztJQUNuQixVQUFVLEVBQUUsQ0FBQyxRQUFRLENBQUM7SUFDdEIsU0FBUyxFQUFFLENBQUMsU0FBUyxDQUFDO0lBQ3RCLElBQUksRUFBRSxDQUFDLFNBQVMsQ0FBQztJQUNqQixTQUFTLEVBQUUsQ0FBQyxRQUFRLENBQUM7SUFDckIsS0FBSyxFQUFFLENBQUMsUUFBUSxDQUFDO0lBQ2pCLGFBQWEsRUFBRSxDQUFDLFNBQVMsQ0FBQztJQUMxQixjQUFjLEVBQUUsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDO0lBQ3ZDLFdBQVcsRUFBRSxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUM7SUFDcEMsWUFBWSxFQUFFLENBQUMsT0FBTyxDQUFDO0NBQzFCLENBQUMifQ==