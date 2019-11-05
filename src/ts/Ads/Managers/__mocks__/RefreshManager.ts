import { RefreshManager as Base } from 'Ads/Managers/RefreshManager';

export type RefreshManagerMock = Base & {
};

export const RefreshManager = jest.fn(() => {
    return <RefreshManagerMock>{
    };
});
