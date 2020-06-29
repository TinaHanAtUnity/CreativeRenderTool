import { TrackingManagerApi as Base, TrackingAuthorizationStatus } from 'Core/Native/iOS/TrackingManager';

export type TrackingManagerApiMock = Base & {
    available: jest.Mock<Promise<boolean>>;
    requestTrackingAuthorization: jest.Mock<Promise<void>>;
    getTrackingAuthorizationStatus: jest.Mock<Promise<TrackingAuthorizationStatus>>;
};

export const TrackingManagerApi = jest.fn(() => {
    return <TrackingManagerApiMock>{
        available: jest.fn().mockResolvedValue(true),
        requestTrackingAuthorization: jest.fn().mockResolvedValue(undefined),
        getTrackingAuthorizationStatus: jest.fn().mockResolvedValue(TrackingAuthorizationStatus.NotDetermined)
    };
});
