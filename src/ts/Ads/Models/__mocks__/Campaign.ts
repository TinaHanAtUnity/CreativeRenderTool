import { Campaign as Base } from 'Ads/Models/Campaign';
import { PerformanceAdUnitFactory } from 'Performance/AdUnits/PerformanceAdUnitFactory';

export type CampaignMock = Base & {
    getId: jest.Mock<string>;
    isExpired: jest.Mock<boolean>;
    getContentType: jest.Mock<string>;
};

export const Campaign = jest.fn((contentType: string = PerformanceAdUnitFactory.ContentType, id: string = 'test') => {
    return <CampaignMock>{
        getId: jest.fn().mockReturnValue(id),
        isExpired: jest.fn().mockReturnValue(false),
        getContentType: jest.fn().mockReturnValue(contentType)
    };
});
