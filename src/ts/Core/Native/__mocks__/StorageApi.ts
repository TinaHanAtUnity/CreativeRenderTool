import { StorageApi as Base } from 'Core/Native/Storage';
import { Observable, ObservableMock } from 'Core/Utilities/__mocks__/Observable';

export type StorageApiMock = Base & {
    get: jest.Mock;
    onSet: ObservableMock;
    read: jest.Mock;
    write: jest.Mock;
    set: jest.Mock;
    delete: jest.Mock;
    clear: jest.Mock;
    getKeys: jest.Mock;
    handleEvent: jest.Mock;
};

export const StorageApi = jest.fn(() => {
    return <StorageApiMock>{
        get: jest.fn().mockImplementation(() => Promise.resolve()),
        onSet: Observable(),
        getKeys: jest.fn().mockResolvedValue([]),
        read: jest.fn(),
        write: jest.fn(),
        set: jest.fn(),
        delete: jest.fn(),
        clear: jest.fn(),
        handleEvent: jest.fn()
    };
});
