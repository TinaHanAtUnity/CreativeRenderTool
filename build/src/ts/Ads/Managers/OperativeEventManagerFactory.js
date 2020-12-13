import { PerformanceOperativeEventManager } from 'Ads/Managers/PerformanceOperativeEventManager';
import { ProgrammaticOperativeEventManager } from 'Ads/Managers/ProgrammaticOperativeEventManager';
import { MRAIDOperativeEventManager } from 'MRAID/Managers/MRAIDOperativeEventManager';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { XPromoOperativeEventManager } from 'XPromo/Managers/XPromoOperativeEventManager';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';
export class OperativeEventManagerFactory {
    static createOperativeEventManager(params) {
        if (params.campaign instanceof PerformanceCampaign) {
            return new PerformanceOperativeEventManager(params);
        }
        else if (params.campaign instanceof XPromoCampaign) {
            return new XPromoOperativeEventManager(params);
        }
        else if (params.campaign instanceof MRAIDCampaign) {
            return new MRAIDOperativeEventManager(params);
        }
        else {
            return new ProgrammaticOperativeEventManager(params);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3BlcmF0aXZlRXZlbnRNYW5hZ2VyRmFjdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9BZHMvTWFuYWdlcnMvT3BlcmF0aXZlRXZlbnRNYW5hZ2VyRmFjdG9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsZ0NBQWdDLEVBQUUsTUFBTSwrQ0FBK0MsQ0FBQztBQUNqRyxPQUFPLEVBQUUsaUNBQWlDLEVBQUUsTUFBTSxnREFBZ0QsQ0FBQztBQUVuRyxPQUFPLEVBQUUsMEJBQTBCLEVBQUUsTUFBTSwyQ0FBMkMsQ0FBQztBQUN2RixPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDM0QsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFDN0UsT0FBTyxFQUFFLDJCQUEyQixFQUFFLE1BQU0sNkNBQTZDLENBQUM7QUFDMUYsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRTlELE1BQU0sT0FBTyw0QkFBNEI7SUFDOUIsTUFBTSxDQUFDLDJCQUEyQixDQUFDLE1BQThDO1FBQ3BGLElBQUksTUFBTSxDQUFDLFFBQVEsWUFBWSxtQkFBbUIsRUFBRTtZQUNoRCxPQUFPLElBQUksZ0NBQWdDLENBQW9ELE1BQU0sQ0FBQyxDQUFDO1NBQzFHO2FBQU0sSUFBSSxNQUFNLENBQUMsUUFBUSxZQUFZLGNBQWMsRUFBRTtZQUNsRCxPQUFPLElBQUksMkJBQTJCLENBQStDLE1BQU0sQ0FBQyxDQUFDO1NBQ2hHO2FBQU0sSUFBSSxNQUFNLENBQUMsUUFBUSxZQUFZLGFBQWEsRUFBRTtZQUNqRCxPQUFPLElBQUksMEJBQTBCLENBQThDLE1BQU0sQ0FBQyxDQUFDO1NBQzlGO2FBQU07WUFDSCxPQUFPLElBQUksaUNBQWlDLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDeEQ7SUFDTCxDQUFDO0NBQ0oifQ==