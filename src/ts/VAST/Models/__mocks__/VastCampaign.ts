import { VastCampaign as Base } from 'VAST/Models/VastCampaign';

export type VastCampaignMock = Base & {
    setOmEnabled: jest.Mock;
    setOMVendors: jest.Mock;
    getSeatId: jest.Mock;
    getVast: jest.Mock;
    getVideo: jest.Mock;
    hasStaticEndscreen: jest.Mock<boolean>;
    hasIframeEndscreen: jest.Mock<boolean>;
    hasHtmlEndscreen: jest.Mock<boolean>;
};

export const VastCampaign = jest.fn(() => {
    return <VastCampaignMock>{
        setOmEnabled: jest.fn(),
        setOMVendors: jest.fn(),
        getSeatId: jest.fn(),
        getVast: jest.fn(),
        getVideo: jest.fn(),
        hasStaticEndscreen: jest.fn().mockImplementation(() => false),
        hasIframeEndscreen: jest.fn().mockImplementation(() => false),
        hasHtmlEndscreen: jest.fn().mockImplementation(() => false)
    };
});
