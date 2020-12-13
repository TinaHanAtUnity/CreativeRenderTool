import { Model } from 'Core/Models/Model';
export class VastVerificationResource extends Model {
    constructor(resourceUrl, apiFramework, browserOptional, type) {
        super('VastVerificationResource', {
            resourceUrl: ['string'],
            apiFramework: ['string'],
            browserOptional: ['boolean', 'null'],
            type: ['string', 'null']
        });
        this.set('resourceUrl', resourceUrl);
        this.set('apiFramework', apiFramework);
        this.set('browserOptional', browserOptional || null);
        this.set('type', type || 'other'); // javascript and other
    }
    getResourceUrl() {
        return this.get('resourceUrl');
    }
    getApiFramework() {
        return this.get('apiFramework');
    }
    getBrowserOptional() {
        return this.get('browserOptional');
    }
    getType() {
        return this.get('type');
    }
    getDTO() {
        return {
            'resourceUrl': this.getResourceUrl(),
            'apiFramework': this.getApiFramework(),
            'browserOptional': this.getBrowserOptional(),
            'type': this.getType()
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdFZlcmlmaWNhdGlvblJlc291cmNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL1ZBU1QvTW9kZWxzL1Zhc3RWZXJpZmljYXRpb25SZXNvdXJjZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFTMUMsTUFBTSxPQUFPLHdCQUF5QixTQUFRLEtBQWdDO0lBRTFFLFlBQVksV0FBbUIsRUFBRSxZQUFvQixFQUFFLGVBQXlCLEVBQUUsSUFBYTtRQUMzRixLQUFLLENBQUMsMEJBQTBCLEVBQUU7WUFDOUIsV0FBVyxFQUFFLENBQUMsUUFBUSxDQUFDO1lBQ3ZCLFlBQVksRUFBRSxDQUFDLFFBQVEsQ0FBQztZQUN4QixlQUFlLEVBQUUsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDO1lBQ3BDLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUM7U0FDM0IsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDckMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDdkMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRSxlQUFlLElBQUksSUFBSSxDQUFDLENBQUM7UUFDckQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsdUJBQXVCO0lBQzlELENBQUM7SUFFTSxjQUFjO1FBQ2pCLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRU0sZUFBZTtRQUNsQixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVNLGtCQUFrQjtRQUNyQixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRU0sT0FBTztRQUNWLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBRU0sTUFBTTtRQUNULE9BQU87WUFDSCxhQUFhLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRTtZQUNwQyxjQUFjLEVBQUUsSUFBSSxDQUFDLGVBQWUsRUFBRTtZQUN0QyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsa0JBQWtCLEVBQUU7WUFDNUMsTUFBTSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUU7U0FDekIsQ0FBQztJQUNOLENBQUM7Q0FDSiJ9