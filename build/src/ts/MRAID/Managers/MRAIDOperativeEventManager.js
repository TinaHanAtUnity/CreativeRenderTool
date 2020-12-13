import { ProgrammaticOperativeEventManager } from 'Ads/Managers/ProgrammaticOperativeEventManager';
import { Url } from 'Core/Utilities/Url';
export class MRAIDOperativeEventManager extends ProgrammaticOperativeEventManager {
    constructor(params) {
        super(params);
        this._mraidCampaign = params.campaign;
    }
    createVideoEventUrl(type) {
        const url = this._mraidCampaign.getVideoEventUrl(type);
        if (url) {
            return url;
        }
        return super.createVideoEventUrl(type);
    }
    createClickEventUrl() {
        const clickUrl = this._mraidCampaign.getClickUrl();
        if (clickUrl) {
            return Url.addParameters(clickUrl, { redirect: false });
        }
        return super.createClickEventUrl();
    }
    getInfoJson(params, eventId, gameSession, gamerSid, previousPlacementId) {
        return super.getInfoJson(params, eventId, gameSession, previousPlacementId).then(([id, infoJson]) => {
            if (params.asset) {
                infoJson.unityCreativeId = params.asset.getCreativeId();
            }
            return [eventId, infoJson];
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTVJBSURPcGVyYXRpdmVFdmVudE1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvTVJBSUQvTWFuYWdlcnMvTVJBSURPcGVyYXRpdmVFdmVudE1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFFLGlDQUFpQyxFQUFFLE1BQU0sZ0RBQWdELENBQUM7QUFDbkcsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBR3pDLE1BQU0sT0FBTywwQkFBMkIsU0FBUSxpQ0FBaUM7SUFHN0UsWUFBWSxNQUFtRDtRQUMzRCxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFZCxJQUFJLENBQUMsY0FBYyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUM7SUFDMUMsQ0FBQztJQUVTLG1CQUFtQixDQUFDLElBQVk7UUFDdEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN2RCxJQUFJLEdBQUcsRUFBRTtZQUNMLE9BQU8sR0FBRyxDQUFDO1NBQ2Q7UUFFRCxPQUFPLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBRVMsbUJBQW1CO1FBQ3pCLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDbkQsSUFBSSxRQUFRLEVBQUU7WUFDVixPQUFPLEdBQUcsQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7U0FDM0Q7UUFFRCxPQUFPLEtBQUssQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0lBQ3ZDLENBQUM7SUFFUyxXQUFXLENBQUMsTUFBNkIsRUFBRSxPQUFlLEVBQUUsV0FBbUIsRUFBRSxRQUFpQixFQUFFLG1CQUE0QjtRQUN0SSxPQUFPLEtBQUssQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsbUJBQW1CLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxRQUFRLENBQWlDLEVBQUUsRUFBRTtZQUNoSSxJQUFJLE1BQU0sQ0FBQyxLQUFLLEVBQUU7Z0JBQ2QsUUFBUSxDQUFDLGVBQWUsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxDQUFDO2FBQzNEO1lBQ0QsT0FBdUMsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDL0QsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0oifQ==