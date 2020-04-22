import { StorageBridge as Base } from 'Core/Utilities/StorageBridge';

export type StorageBridgeMock = Base & {
    queue: jest.Mock;
};

export const StorageBridge = jest.fn(() => {
    return <StorageBridgeMock>{
        queue: jest.fn()
    };
});
