import { BannerPlacementManager as Base } from 'Banners/Managers/BannerPlacementManager';

export type BannerPlacementManagerMock = Base & {
    sendBannersReady: jest.Mock;
    getPlacement: jest.Mock;
    setPlacementState: jest.Mock;
};

export const BannerPlacementManager = jest.fn(() => {
    return <BannerPlacementManagerMock>{
        sendBannersReady: jest.fn(),
        getPlacement: jest.fn(),
        setPlacementState: jest.fn()
    };
});
