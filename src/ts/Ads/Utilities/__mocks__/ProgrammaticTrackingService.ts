import { ProgrammaticTrackingService as Base } from 'Ads/Utilities/ProgrammaticTrackingService';

export type ProgrammaticTrackingServiceMock = Base & {
    createAdsSdkTag: jest.Mock;
    reportErrorEvent: jest.Mock;
    reportMetricEvent: jest.Mock;
    reportMetricEventWithTags: jest.Mock;
    reportTimingEvent: jest.Mock;
    batchEvent: jest.Mock;
    sendBatchedEvents: jest.Mock;
};

export const ProgrammaticTrackingService = jest.fn(() => {
    return <ProgrammaticTrackingServiceMock>{
        createAdsSdkTag: jest.fn(),
        reportErrorEvent: jest.fn(),
        reportMetricEvent: jest.fn(),
        reportMetricEventWithTags: jest.fn(),
        reportTimingEvent: jest.fn(),
        batchEvent: jest.fn(),
        sendBatchedEvents: jest.fn()
    };
});
