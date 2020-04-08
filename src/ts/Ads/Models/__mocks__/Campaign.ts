import { Campaign as Base } from 'Ads/Models/Campaign';

export type CampaignMock = Base & {
    isExpired: jest.Mock<boolean>;
};

export const Campaign = jest.fn(() => {
    return <CampaignMock>{
        isExpired: jest.fn().mockReturnValue(false)
    };
});
