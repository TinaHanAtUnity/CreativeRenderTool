import { LoadApi as Base } from 'Core/Native/LoadApi';
import { ObservableMock, Observable } from 'Core/Utilities/__mocks__/Observable';

export type LoadApiMock = Base & {
    onLoad: ObservableMock;
};

export const LoadApi = jest.fn(() => {
    return <LoadApiMock>{
        onLoad: Observable()
    };
});
