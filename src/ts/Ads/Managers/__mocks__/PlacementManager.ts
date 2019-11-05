import { PlacementManager as Base } from 'Ads/Managers/PlacementManager';

export type PlacementManagerMock = Base & {};

export const PlacementManager = jest.fn(() => {
    return <PlacementManagerMock>{};
});
