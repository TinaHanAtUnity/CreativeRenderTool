import { Campaign as Base } from 'Ads/Models/Campaign';
import { PerformanceAdUnitFactory } from 'Performance/AdUnits/PerformanceAdUnitFactory';

export type CampaignMock = Base & {
    isExpired: jest.Mock<boolean>;
    getContentType: jest.Mock<string>;
};

export const Campaign = jest.fn((contentType: string = PerformanceAdUnitFactory.ContentType) => {
    return <CampaignMock>{
        isExpired: jest.fn().mockReturnValue(false),
        getContentType: jest.fn().mockReturnValue(contentType)
    };
});
