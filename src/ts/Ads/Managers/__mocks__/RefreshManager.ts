import { RefreshManager as Base } from 'Ads/Managers/RefreshManager';

export type RefreshManagerMock = Base & {
    setPlacementState: jest.Mock;
};

export const RefreshManager = jest.fn(() => {
    return <RefreshManagerMock>{
        setPlacementState: jest.fn()
    };
});
