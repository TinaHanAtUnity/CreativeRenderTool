import { SessionManager as Base } from 'Ads/Managers/SessionManager';

export type SessionManagerMock = Base & {
    sendSkip: jest.Mock;
    sendThirdQuartile: jest.Mock;
    sendView: jest.Mock;
};

export const SessionManager = jest.fn(() => {
    return <SessionManagerMock>{
        create: jest.fn(),
        startNewSession: jest.fn(),
        sendUnsentSessions: jest.fn(),
        setGameSessionId: jest.fn()
        getGameSessionId
    };
});
