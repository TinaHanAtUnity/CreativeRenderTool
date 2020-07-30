import { LoadAndFillEventManager as Base } from 'Ads/Managers/LoadAndFillEventManager';

export type LoadAndFillEventManagerMock = Base & {
    sendLoadTrackingEvents: jest.Mock;
    sendFillTrackingEvents: jest.Mock;
};

export const LoadAndFillEventManager = jest.fn(() => {
    return <LoadAndFillEventManagerMock>{
        sendLoadTrackingEvents: jest.fn().mockImplementation(() => Promise.resolve()),
        sendFillTrackingEvents: jest.fn().mockImplementation(() => Promise.resolve())
    };
});
