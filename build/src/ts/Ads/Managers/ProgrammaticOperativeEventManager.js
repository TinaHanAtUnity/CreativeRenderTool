import { OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
export class ProgrammaticOperativeEventManager extends OperativeEventManager {
    constructor(params) {
        super(params);
    }
    static setTestBaseUrl(baseUrl) {
        ProgrammaticOperativeEventManager.VideoEventBaseUrl = baseUrl + '/events/v2/brand/video';
    }
    createVideoEventUrl(type) {
        return [
            ProgrammaticOperativeEventManager.VideoEventBaseUrl,
            type,
            this._clientInfo.getGameId(),
            this._campaign.getId()
        ].join('/');
    }
    createClickEventUrl() {
        return undefined;
    }
    getInfoJson(params, eventId, gameSession, gamerSid, previousPlacementId) {
        return super.getInfoJson(params, eventId, gameSession, previousPlacementId).then(([id, infoJson]) => {
            infoJson.creativeId = this._campaign.getCreativeId();
            return [eventId, infoJson];
        });
    }
}
ProgrammaticOperativeEventManager.VideoEventBaseUrl = 'https://adserver.unityads.unity3d.com/events/v2/brand/video';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvZ3JhbW1hdGljT3BlcmF0aXZlRXZlbnRNYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9NYW5hZ2Vycy9Qcm9ncmFtbWF0aWNPcGVyYXRpdmVFdmVudE1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUlILHFCQUFxQixFQUN4QixNQUFNLG9DQUFvQyxDQUFDO0FBTzVDLE1BQU0sT0FBTyxpQ0FBa0MsU0FBUSxxQkFBcUI7SUFPeEUsWUFBWSxNQUE4QztRQUN0RCxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbEIsQ0FBQztJQVJNLE1BQU0sQ0FBQyxjQUFjLENBQUMsT0FBZTtRQUN4QyxpQ0FBaUMsQ0FBQyxpQkFBaUIsR0FBRyxPQUFPLEdBQUcsd0JBQXdCLENBQUM7SUFDN0YsQ0FBQztJQVFTLG1CQUFtQixDQUFDLElBQVk7UUFDdEMsT0FBTztZQUNILGlDQUFpQyxDQUFDLGlCQUFpQjtZQUNuRCxJQUFJO1lBQ0osSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUU7WUFDNUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUU7U0FDekIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDaEIsQ0FBQztJQUVTLG1CQUFtQjtRQUN6QixPQUFPLFNBQVMsQ0FBQztJQUNyQixDQUFDO0lBRVMsV0FBVyxDQUFDLE1BQTZCLEVBQUUsT0FBZSxFQUFFLFdBQW1CLEVBQUUsUUFBaUIsRUFBRSxtQkFBNEI7UUFDdEksT0FBTyxLQUFLLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLG1CQUFtQixDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsUUFBUSxDQUFrQyxFQUFFLEVBQUU7WUFDakksUUFBUSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBRXJELE9BQXdDLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ2hFLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQzs7QUF6QmMsbURBQWlCLEdBQVcsNkRBQTZELENBQUMifQ==