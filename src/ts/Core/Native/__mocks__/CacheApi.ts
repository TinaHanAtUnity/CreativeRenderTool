import { CacheApi as Base } from 'Core/Native/Cache';

export type CacheApiMock = Base & {
};

export const CacheApi = jest.fn(() => {
    return <CacheApiMock>{
    };
});
