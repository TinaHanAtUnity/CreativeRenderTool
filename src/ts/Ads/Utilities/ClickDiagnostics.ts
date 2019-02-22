import { Campaign } from 'Ads/Models/Campaign';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';

export enum ClickDelayRange {
    LOW = 4000, // 4000 ms
    MID = 8000,
    HIGH = 12000
}

export class ClickDiagnostics {
    private static getClickDelayRange(duration: number): string {
        if (duration <= ClickDelayRange.LOW) {
            return 'LOW';
        } else if (duration > ClickDelayRange.LOW && duration <= ClickDelayRange.MID) {
            return 'MID';
        } else if (duration > ClickDelayRange.MID && duration <= ClickDelayRange.HIGH) {
            return 'HIGH';
        } else {
            return 'VERY_HIGH';
        }
    }

    public static sendClickDiagnosticsEvent(clickDuration: number, clickUrl: string, clickLocation: string, clickedCampaign: Campaign, abGroup: number, gameSessionId: number | undefined) {
        if (gameSessionId && gameSessionId % 10 === 1) {
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
