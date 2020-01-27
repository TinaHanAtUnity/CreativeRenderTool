import { StorageApi as Base } from 'Core/Native/Storage';

export type StorageApiMock = Base & {
};

export const StorageApi = jest.fn(() => {
    return <StorageApiMock>{
    };
});
