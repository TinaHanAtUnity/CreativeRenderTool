import { ThirdPartyEventManagerFactory as Base } from 'Ads/Managers/ThirdPartyEventManagerFactory';

export type ThirdPartyEventManagerFactoryMock = Base & {
    create: jest.Mock;
};

export const ThirdPartyEventManagerFactory = jest.fn(() => {
    return <ThirdPartyEventManagerFactoryMock>{
        create: jest.fn()
    };
});
