import { StorageApi as Base } from 'Core/Native/Storage';
import { ObservableMock, Observable } from 'Core/Utilities/__mocks__/Observable';

export type StorageApiMock = Base & {
    get: jest.Mock;
    onSet: ObservableMock;
    getKeys: jest.Mock;
};

export const StorageApi = jest.fn(() => {
    return <StorageApiMock>{
        get: jest.fn().mockImplementation(() => Promise.resolve()),
        onSet: Observable(),
        getKeys: jest.fn().mockResolvedValue([])
    };
});
