import { NativeBridge as Base } from 'Core/Native/Bridge/NativeBridge';

export type NativeBridgeMock = Base & {
    handleCallback: jest.Mock;
    handleEvent: jest.Mock;
    handleInvocation: jest.Mock;
    invoke: jest.Mock;
};

export const NativeBridge = jest.fn(() => {
    return <NativeBridgeMock><unknown>{
        handleCallback: jest.fn(),
        handleEvent: jest.fn(),
        handleInvocation: jest.fn(),
        invoke: jest.fn(),
        addEventHandler: jest.fn(),
        registerCallback: jest.fn(),
        getPlatform: jest.fn(),
        setAutoBatchEnabled: jest.fn(),
        invokeBatch: jest.fn(),
        invokeCallback: jest.fn()
    };
});
