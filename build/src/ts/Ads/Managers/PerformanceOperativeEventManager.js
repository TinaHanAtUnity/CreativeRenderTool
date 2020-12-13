import { OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { Url } from 'Core/Utilities/Url';
export class PerformanceOperativeEventManager extends OperativeEventManager {
    constructor(params) {
        super(params);
        this._performanceCampaign = params.campaign;
    }
    createVideoEventUrl(type) {
        return this._performanceCampaign.getVideoEventUrl(type);
    }
    createClickEventUrl() {
        return Url.addParameters(this._performanceCampaign.getClickUrl(), { redirect: false });
    }
    getInfoJson(params, eventId, gameSession, previousPlacementId) {
        return super.getInfoJson(params, eventId, gameSession, previousPlacementId).then(([id, infoJson]) => {
            if (params.asset) {
                infoJson.unityCreativeId = params.asset.getCreativeId();
            }
            return [eventId, infoJson];
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGVyZm9ybWFuY2VPcGVyYXRpdmVFdmVudE1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL01hbmFnZXJzL1BlcmZvcm1hbmNlT3BlcmF0aXZlRXZlbnRNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFJSCxxQkFBcUIsRUFDeEIsTUFBTSxvQ0FBb0MsQ0FBQztBQUM1QyxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFPekMsTUFBTSxPQUFPLGdDQUFpQyxTQUFRLHFCQUFxQjtJQUd2RSxZQUFZLE1BQXlEO1FBQ2pFLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUVkLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO0lBQ2hELENBQUM7SUFFUyxtQkFBbUIsQ0FBQyxJQUFZO1FBQ3RDLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzVELENBQUM7SUFFUyxtQkFBbUI7UUFDekIsT0FBTyxHQUFHLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxXQUFXLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBQzNGLENBQUM7SUFFUyxXQUFXLENBQUMsTUFBNkIsRUFBRSxPQUFlLEVBQUUsV0FBbUIsRUFBRSxtQkFBNEI7UUFDbkgsT0FBTyxLQUFLLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLG1CQUFtQixDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsUUFBUSxDQUFpQyxFQUFFLEVBQUU7WUFDaEksSUFBSSxNQUFNLENBQUMsS0FBSyxFQUFFO2dCQUNkLFFBQVEsQ0FBQyxlQUFlLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsQ0FBQzthQUMzRDtZQUNELE9BQTRCLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3BELENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKIn0=