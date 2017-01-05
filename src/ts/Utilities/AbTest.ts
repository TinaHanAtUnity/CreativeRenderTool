import { Campaign } from 'Models/Campaign';
export class AbTest {

    public static isOverlayTestActive(campaign: Campaign): boolean {
        const abGroup = campaign.getAbGroup();
        if (abGroup === 18 || abGroup === 19) {
            return true;
        }
        return false;
    }
}
