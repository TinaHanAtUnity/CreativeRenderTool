import { AdMobCampaign as Base } from 'AdMob/Models/AdMobCampaign';

export type AdMobCampaignMock = Base & {
};

export const AdMobCampaign = jest.fn(() => {
    return <AdMobCampaignMock>{
    };
});
