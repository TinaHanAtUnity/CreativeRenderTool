import { AdMobCampaign as Base } from 'AdMob/Models/AdMobCampaign';
import Mock = jest.Mock;

export type AdMobCampaignMock = Base & {
    isOMEnabled: Mock<boolean>;
};

export const AdMobCampaign = jest.fn(() => {
    return <AdMobCampaignMock>{
        isOMEnabled: jest.fn().mockImplementation(() => false)
    };
});
