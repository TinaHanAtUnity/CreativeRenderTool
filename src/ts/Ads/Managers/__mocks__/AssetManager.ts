import { AssetManager as Base } from 'Ads/Managers/AssetManager';

export type AssetManagerMock = Base & {
};

export const AssetManager = jest.fn(() => {
    return <AssetManagerMock><unknown>{
    };
});
