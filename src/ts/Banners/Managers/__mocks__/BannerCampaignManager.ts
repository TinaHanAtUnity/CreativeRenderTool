import { BannerCampaignManager as Base } from 'Banners/Managers/BannerCampaignManager';

export type BannerCampaignManagerMock = Base & {
    request: jest.Mock;
    setPreviousPlacementId: jest.Mock;
    getPreviousPlacementId: jest.Mock;
};

export const BannerCampaignManager = jest.fn(() => {
    return <BannerCampaignManagerMock>{
        request: jest.fn(),
        setPreviousPlacementId: jest.fn(),
        getPreviousPlacementId: jest.fn()
    };
});
