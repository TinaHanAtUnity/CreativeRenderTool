import { ThirdPartyEventManager as Base } from 'Ads/Managers/ThirdPartyEventManager';

export type ThirdPartyEventManagerMock = Base & {
    sendTrackingEvents: jest.Mock;
};

export const ThirdPartyEventManager = jest.fn(() => {
    return <ThirdPartyEventManagerMock>{
        sendTrackingEvents: jest.fn().mockImplementation(() => Promise.resolve())
    };
});
