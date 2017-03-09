import { PerformanceCampaign } from 'Models/PerformanceCampaign';

export class AbTest {

    public static isCoCAnimatedTest(campaign: PerformanceCampaign): boolean {
        const abGroup = campaign.getAbGroup();
        const gameId = campaign.getGameId();
        if((abGroup === 8 || abGroup === 9) && (gameId === 45236 || gameId === 45237)) {
            return true;
        }
        return false;
    }

    public static isCoCAnimatedTest2(campaign: PerformanceCampaign): boolean {
        const abGroup = campaign.getAbGroup();
        const gameId = campaign.getGameId();
        if((abGroup === 10 || abGroup === 11) && (gameId === 45236 || gameId === 45237)) {
            return true;
        }
        return false;
    }
}
