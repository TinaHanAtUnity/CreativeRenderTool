import { PlacementApi as Base } from 'Ads/Native/Placement';

export type PlacementApiMock = Base & {
    setPlacementState: jest.Mock;
};

export const PlacementApi = jest.fn(() => {
    return <PlacementApiMock>{
        setPlacementState: jest.fn()
    };
});
