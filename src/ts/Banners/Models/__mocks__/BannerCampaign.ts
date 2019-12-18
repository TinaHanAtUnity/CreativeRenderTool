import { BannerCampaign as Base } from 'Banners/Models/BannerCampaign';
import Mock = jest.Mock;
import { Asset } from 'Ads/Models/Assets/Asset';

export type BannerCampaignMock = Base & {
    getRequiredAssets: Mock<Asset[]>;
    getOptionalAssets: Mock<Asset[]>;
    isConnectionNeeded: Mock<boolean>;
    getWidth: Mock<number>;
    getHeight: Mock<number>;
    getMarkup: Mock<string>;
};

export const BannerCampaign = jest.fn(() => {
    return <BannerCampaignMock>{
        getRequiredAssets: jest.fn(),
        getOptionalAssets: jest.fn(),
        isConnectionNeeded: jest.fn(),
        getWidth: jest.fn(),
        getHeight: jest.fn(),
        getMarkup: jest.fn()
    };
});
