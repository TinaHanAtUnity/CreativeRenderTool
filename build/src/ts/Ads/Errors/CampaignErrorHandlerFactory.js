import { VastCampaignErrorHandler } from 'VAST/EventHandlers/VastCampaignErrorHandler';
import { CampaignContentTypes } from 'Ads/Utilities/CampaignContentTypes';
import { DefaultCampaignErrorHandler } from 'Ads/Errors/DefaultCampaignErrorHandler';
export class CampaignErrorHandlerFactory {
    static getCampaignErrorHandler(contentType, core, request) {
        switch (contentType) {
            case CampaignContentTypes.ProgrammaticVast:
                return new VastCampaignErrorHandler(core, request);
            default:
                return new DefaultCampaignErrorHandler();
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FtcGFpZ25FcnJvckhhbmRsZXJGYWN0b3J5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9FcnJvcnMvQ2FtcGFpZ25FcnJvckhhbmRsZXJGYWN0b3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxNQUFNLDZDQUE2QyxDQUFDO0FBRXZGLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBQzFFLE9BQU8sRUFBRSwyQkFBMkIsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBUXJGLE1BQU0sT0FBTywyQkFBMkI7SUFDN0IsTUFBTSxDQUFDLHVCQUF1QixDQUFDLFdBQW1CLEVBQUUsSUFBYyxFQUFFLE9BQXVCO1FBQzlGLFFBQVEsV0FBVyxFQUFFO1lBQ2pCLEtBQUssb0JBQW9CLENBQUMsZ0JBQWdCO2dCQUN0QyxPQUFPLElBQUksd0JBQXdCLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3ZEO2dCQUNJLE9BQU8sSUFBSSwyQkFBMkIsRUFBRSxDQUFDO1NBQ2hEO0lBQ0wsQ0FBQztDQUNKIn0=