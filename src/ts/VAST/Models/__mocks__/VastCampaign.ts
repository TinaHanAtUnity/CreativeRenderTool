import { VastCampaign as Base } from 'VAST/Models/VastCampaign';
import { Asset } from 'Ads/Models/Assets/Asset';
import { Vast, VastMock } from 'VAST/Models/__mocks__/Vast';

export type VastCampaignMock = Base & {
    setOmEnabled: jest.Mock;
    setOMVendors: jest.Mock;
    getSeatId: jest.Mock;
    getVast: jest.Mock<VastMock>;
    getVideo: jest.Mock;
    getStaticLandscape: jest.Mock<Asset>;
    getStaticPortrait: jest.Mock<Asset>;
    hasStaticEndscreen: jest.Mock<boolean>;
    hasIframeEndscreen: jest.Mock<boolean>;
    hasHtmlEndscreen: jest.Mock<boolean>;
    getUseWebViewUserAgentForTracking: jest.Mock;
};

export const VastCampaign = jest.fn(() => {
    return <VastCampaignMock>{
        setOmEnabled: jest.fn(),
        setOMVendors: jest.fn(),
        getSeatId: jest.fn(),
        getVideo: jest.fn(),
        getStaticLandscape: jest.fn().mockImplementation(() => undefined),
        getStaticPortrait: jest.fn().mockImplementation(() => undefined),
        hasStaticEndscreen: jest.fn().mockImplementation(() => false),
        hasIframeEndscreen: jest.fn().mockImplementation(() => false),
        hasHtmlEndscreen: jest.fn().mockImplementation(() => false),
        getVast: jest.fn().mockImplementation(() => new Vast()),
        getUseWebViewUserAgentForTracking: jest.fn()
    };
});
