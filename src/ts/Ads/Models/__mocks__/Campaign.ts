import { Campaign as Base } from 'Ads/Models/Campaign';
import { PerformanceAdUnitFactory } from 'Performance/AdUnits/PerformanceAdUnitFactory';
import { Session } from 'Ads/Models/__mocks__/Session';
import { JaegerUtilities } from 'Core/Jaeger/JaegerUtilities';

export type CampaignMock = Base & {
    getId: jest.Mock<string>;
    isExpired: jest.Mock<boolean>;
    getContentType: jest.Mock<string>;
    getTrackingUrlsForEvent: jest.Mock;
    getSession: jest.Mock;
    getUniqueId: jest.Mock;
};

export const Campaign = jest.fn((contentType: string = PerformanceAdUnitFactory.ContentType, id: string = 'test') => {
    return <CampaignMock>{
        getId: jest.fn().mockReturnValue(id),
        isExpired: jest.fn().mockReturnValue(false),
        getContentType: jest.fn().mockReturnValue(contentType),
        getTrackingUrlsForEvent: jest.fn().mockReturnValue([]),
        getSession: jest.fn().mockReturnValue(Session()),
        getUniqueId: jest.fn().mockReturnValue(JaegerUtilities.uuidv4())
    };
});
