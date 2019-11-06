import { PlacementApi as Base } from 'Ads/Native/Placement';

export type PlacementApiMock = Base & {};

export const PlacementApi = jest.fn(() => {
    return <PlacementApiMock>{
    };
});
