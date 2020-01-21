import { Campaign as Base } from 'Ads/Models/Campaign';

export type CampaignMock = Base & {
};

export const Campaign = jest.fn(() => {
    return <CampaignMock>{
    };
});
