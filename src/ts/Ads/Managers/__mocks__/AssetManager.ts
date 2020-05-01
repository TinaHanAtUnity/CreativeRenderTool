import { AssetManager as Base } from 'Ads/Managers/AssetManager';

export type AssetManagerMock = Base & {
    enableCaching: jest.Mock;
    checkFreeSpace: jest.Mock;
    setup: jest.Mock;
};

export const AssetManager = jest.fn(() => {
    return <AssetManagerMock>{
        enableCaching: jest.fn(),
        checkFreeSpace: jest.fn(),
        setup: jest.fn().mockImplementation((campaign) => Promise.resolve(campaign))
    };
});
