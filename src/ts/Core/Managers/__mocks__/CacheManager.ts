import { CacheManager as Base } from 'Core/Managers/CacheManager';

export type CacheManagerMock = Base & {
};

export const CacheManager = jest.fn(() => {
    return <CacheManagerMock>{};
});
