import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
export var ClickDelayRange;
(function (ClickDelayRange) {
    ClickDelayRange[ClickDelayRange["LOW"] = 4000] = "LOW";
    ClickDelayRange[ClickDelayRange["MID"] = 8000] = "MID";
    ClickDelayRange[ClickDelayRange["HIGH"] = 12000] = "HIGH";
})(ClickDelayRange || (ClickDelayRange = {}));
export class ClickDiagnostics {
    static getClickDelayRange(duration) {
        if (duration <= ClickDelayRange.LOW) {
            return 'LOW';
        }
        else if (duration > ClickDelayRange.LOW && duration <= ClickDelayRange.MID) {
            return 'MID';
        }
        else if (duration > ClickDelayRange.MID && duration <= ClickDelayRange.HIGH) {
            return 'HIGH';
        }
        else {
            return 'VERY_HIGH';
        }
    }
    static sendClickDiagnosticsEvent(clickDuration, clickUrl, clickLocation, clickedCampaign, abGroup, gameSessionId) {
        if (clickLocation === 'programmatic_mraid_webplayer' || (gameSessionId && gameSessionId % 10 === 1)) {
            SessionDiagnostics.trigger('click_delay', {
                duration: clickDuration,
                delayRange: ClickDiagnostics.getClickDelayRange(clickDuration),
                delayedUrl: clickUrl,
                location: clickLocation,
                seatId: clickedCampaign.getSeatId(),
                creativeId: clickedCampaign.getCreativeId(),
                abGroup: abGroup
            }, clickedCampaign.getSession());
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2xpY2tEaWFnbm9zdGljcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9BZHMvVXRpbGl0aWVzL0NsaWNrRGlhZ25vc3RpY3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sa0NBQWtDLENBQUM7QUFFdEUsTUFBTSxDQUFOLElBQVksZUFJWDtBQUpELFdBQVksZUFBZTtJQUN2QixzREFBVSxDQUFBO0lBQ1Ysc0RBQVUsQ0FBQTtJQUNWLHlEQUFZLENBQUE7QUFDaEIsQ0FBQyxFQUpXLGVBQWUsS0FBZixlQUFlLFFBSTFCO0FBRUQsTUFBTSxPQUFPLGdCQUFnQjtJQUNqQixNQUFNLENBQUMsa0JBQWtCLENBQUMsUUFBZ0I7UUFDOUMsSUFBSSxRQUFRLElBQUksZUFBZSxDQUFDLEdBQUcsRUFBRTtZQUNqQyxPQUFPLEtBQUssQ0FBQztTQUNoQjthQUFNLElBQUksUUFBUSxHQUFHLGVBQWUsQ0FBQyxHQUFHLElBQUksUUFBUSxJQUFJLGVBQWUsQ0FBQyxHQUFHLEVBQUU7WUFDMUUsT0FBTyxLQUFLLENBQUM7U0FDaEI7YUFBTSxJQUFJLFFBQVEsR0FBRyxlQUFlLENBQUMsR0FBRyxJQUFJLFFBQVEsSUFBSSxlQUFlLENBQUMsSUFBSSxFQUFFO1lBQzNFLE9BQU8sTUFBTSxDQUFDO1NBQ2pCO2FBQU07WUFDSCxPQUFPLFdBQVcsQ0FBQztTQUN0QjtJQUNMLENBQUM7SUFFTSxNQUFNLENBQUMseUJBQXlCLENBQUMsYUFBcUIsRUFBRSxRQUFnQixFQUFFLGFBQXFCLEVBQUUsZUFBeUIsRUFBRSxPQUFlLEVBQUUsYUFBaUM7UUFDakwsSUFBSSxhQUFhLEtBQUssOEJBQThCLElBQUksQ0FBQyxhQUFhLElBQUksYUFBYSxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRTtZQUNqRyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFO2dCQUN0QyxRQUFRLEVBQUUsYUFBYTtnQkFDdkIsVUFBVSxFQUFFLGdCQUFnQixDQUFDLGtCQUFrQixDQUFDLGFBQWEsQ0FBQztnQkFDOUQsVUFBVSxFQUFFLFFBQVE7Z0JBQ3BCLFFBQVEsRUFBRSxhQUFhO2dCQUN2QixNQUFNLEVBQUUsZUFBZSxDQUFDLFNBQVMsRUFBRTtnQkFDbkMsVUFBVSxFQUFFLGVBQWUsQ0FBQyxhQUFhLEVBQUU7Z0JBQzNDLE9BQU8sRUFBRSxPQUFPO2FBQ25CLEVBQUUsZUFBZSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7U0FDcEM7SUFDTCxDQUFDO0NBQ0oifQ==