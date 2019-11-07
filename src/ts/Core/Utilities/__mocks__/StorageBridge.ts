import { StorageBridge as Base } from 'Core/Utilities/StorageBridge';

export type StorageBridgeMock = Base & {
};

export const StorageBridge = jest.fn(() => {
    return <StorageBridgeMock>{};
});
