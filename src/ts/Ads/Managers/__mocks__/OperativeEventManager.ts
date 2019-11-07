import { OperativeEventManager as Base } from 'Ads/Managers/OperativeEventManager';

export type OperativeEventManagerMock = Base & {
    sendSkip: jest.Mock;
    sendThirdQuartile: jest.Mock;
    sendView: jest.Mock;
};

export const OperativeEventManager = jest.fn(() => {
    return <OperativeEventManagerMock>{
        sendSkip: jest.fn().mockImplementation(() => Promise.resolve()),
        sendThirdQuartile: jest.fn().mockImplementation(() => Promise.resolve()),
        sendView: jest.fn().mockImplementation(() => Promise.resolve())
    };
});
