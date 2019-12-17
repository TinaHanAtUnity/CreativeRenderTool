import { Session as Base } from 'Ads/Models/Session';
import Mock = jest.Mock;
import { IGameSessionCounters } from 'Ads/Utilities/GameSessionCounters';
import { IRequestPrivacy, ILegacyRequestPrivacy } from 'Ads/Models/RequestPrivacy';

export type SessionMock = Base & {
    getId: Mock<string>;
    getAdPlan: Mock<string | undefined>;
    setAdPlan: Mock<void>;
    getEventSent: Mock<boolean>;
    setEventSent: Mock<void>;
    setGameSessionCounters: Mock<void>;
    getGameSessionCounters: Mock<IGameSessionCounters>;
    setPrivacy: Mock<void>;
    getPrivacy: Mock<IRequestPrivacy | undefined>;
    setLegacyPrivacy: Mock<void>;
    getLegacyPrivacy: Mock<ILegacyRequestPrivacy | undefined>;
    setDeviceFreeSpace: Mock<void>;
    getDeviceFreeSpace: Mock<number>;
    getDTO: Mock<{ [key: string]: unknown }>;
};

export const Session = jest.fn(() => {
    return <SessionMock>{
        getId: jest.fn(),
        getAdPlan: jest.fn(),
        setAdPlan: jest.fn(),
        getEventSent: jest.fn(),
        setEventSent: jest.fn(),
        setGameSessionCounters: jest.fn(),
        getGameSessionCounters: jest.fn(),
        setPrivacy: jest.fn(),
        getPrivacy: jest.fn(),
        setLegacyPrivacy: jest.fn(),
        getLegacyPrivacy: jest.fn(),
        setDeviceFreeSpace: jest.fn(),
        getDeviceFreeSpace: jest.fn(),
        getDTO: jest.fn()
    };
});
