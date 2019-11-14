import { SessionManager as Base } from 'Ads/Managers/SessionManager';

export type SessionManagerMock = Base & {
    create: jest.Mock;
    startNewSession: jest.Mock;
    sendUnsentSeessions: jest.Mock;
    setGameSessionId: jest.Mock;
    getGameSessionId: jest.Mock;
};

export const SessionManager = jest.fn(() => {
    return <SessionManagerMock><unknown>{ // TODO: Remove unknown cast
        create: jest.fn(),
        startNewSession: jest.fn(),
        sendUnsentSessions: jest.fn(),
        setGameSessionId: jest.fn(),
        getGameSessionId: jest.fn()
    };
});
