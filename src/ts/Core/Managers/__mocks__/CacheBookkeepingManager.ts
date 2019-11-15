import { CacheBookkeepingManager as Base } from 'Core/Managers/CacheBookkeepingManager';

export type CacheBookkeepingManagerMock = Base & {
};

export const CacheBookkeepingManager = jest.fn(() => {
    return <CacheBookkeepingManagerMock>{};
});
