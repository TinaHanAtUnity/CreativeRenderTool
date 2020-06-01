import { SdkApi as Base } from 'Core/Native/Sdk';

export type SdkApiMock = Base & {
    logDebug: jest.Mock;
    logError: jest.Mock;
    logInfo: jest.Mock;
};

export const SdkApi = jest.fn(() => {
    return <SdkApiMock>{
        logDebug: jest.fn(),
        logError: jest.fn(),
        logInfo: jest.fn()
    };
});
