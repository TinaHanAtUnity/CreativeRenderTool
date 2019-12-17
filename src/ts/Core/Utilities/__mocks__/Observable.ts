import { Observable0 as Base } from 'Core/Utilities/Observable';

export type ObservableMock = Base & {
    subscribe: jest.Mock;
    unsubscribe: jest.Mock;
    trigger: jest.Mock;
};

export const Observable = jest.fn(() => {
    return <ObservableMock>{
        subscribe: jest.fn(),
        unsubscribe: jest.fn(),
        trigger: jest.fn()
    };
});
