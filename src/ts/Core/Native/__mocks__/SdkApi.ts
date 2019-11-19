import { SdkApi as Base } from 'Core/Native/Sdk';

export type SdkApiMock = Base & {
    logDebug: jest.Mock;
};

export const SdkApi = jest.fn(() => {
    return <SdkApiMock>{
        logDebug: jest.fn()
    };
});
