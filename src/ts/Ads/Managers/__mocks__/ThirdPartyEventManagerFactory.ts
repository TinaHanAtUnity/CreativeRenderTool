import { ThirdPartyEventManagerFactory as Base } from 'Ads/Managers/ThirdPartyEventManagerFactory';
import { ThirdPartyEventManager } from 'Ads/Managers/__mocks__/ThirdPartyEventManager.ts';

export type ThirdPartyEventManagerFactoryMock = Base & {
    create: jest.Mock;
};

export const ThirdPartyEventManagerFactory = jest.fn(() => {
    return <ThirdPartyEventManagerFactoryMock>{
        create: jest.fn().mockReturnValue(new ThirdPartyEventManager())
    };
});
