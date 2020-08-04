import { SKAdNetworkApi as Base } from 'Core/Native/iOS/SKAdNetwork';

export type SKAdNetworkApiMock = Base & {
    available: jest.Mock<Promise<boolean>>;
    updateConversionValue: jest.Mock<Promise<void>>;
    registerAppForAdNetworkAttribution: jest.Mock<Promise<void>>;
};

export const SKAdNetworkApi = jest.fn(() => {
    return <SKAdNetworkApiMock>{
        available: jest.fn().mockResolvedValue(Promise.resolve(true)),
        updateConversionValue: jest.fn().mockResolvedValue(Promise.resolve()),
        registerAppForAdNetworkAttribution: jest.fn().mockResolvedValue(Promise.resolve())
    };
});
