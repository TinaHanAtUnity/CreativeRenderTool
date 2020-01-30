import { StorageApi as Base } from 'Core/Native/Storage';
import { ObservableMock, Observable } from 'Core/Utilities/__mocks__/Observable';

export type StorageApiMock = Base & {
    onSet: ObservableMock;
};

export const StorageApi = jest.fn(() => {
    return <StorageApiMock>{
        onSet: Observable()
    };
});
