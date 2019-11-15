import { StoreManager as Base } from 'Store/Managers/StoreManager';

export type StoreManagerMock = Base & {};

export const StoreManager = jest.fn(() => {
    return <StoreManagerMock>{};
});
