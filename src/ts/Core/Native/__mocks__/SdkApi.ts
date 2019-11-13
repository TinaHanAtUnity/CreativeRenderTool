import { SdkApi as Base } from 'Core/Native/Sdk';

export type SdkApiMock = Base & {
};

export const SdkApi = jest.fn(() => {
    return <SdkApiMock>{
    };
});
