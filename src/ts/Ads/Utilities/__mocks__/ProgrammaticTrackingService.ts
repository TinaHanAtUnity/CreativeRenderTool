import { ProgrammaticTrackingService as Base } from 'Ads/Utilities/ProgrammaticTrackingService';

type ProgrammaticTrackingServiceMock = Base & {
    createAdsSdkTag: jest.Mock;
    reportErrorEvent: jest.Mock;
    reportMetricEvent: jest.Mock;
    reportMetricEventWithTags: jest.Mock;
    reportTimingEvent: jest.Mock;
    batchEvent: jest.Mock;
    sendBatchedEvents: jest.Mock;
};

// Used to not directly use PTS in Jest Tests
export function MockPTS(): void {
    const basePts = <ProgrammaticTrackingServiceMock><unknown>Base;
    basePts.createAdsSdkTag = jest.fn();
    basePts.reportErrorEvent = jest.fn();
    basePts.reportMetricEvent = jest.fn();
    basePts.reportMetricEventWithTags = jest.fn();
    basePts.reportTimingEvent = jest.fn();
    basePts.batchEvent = jest.fn();
    basePts.sendBatchedEvents = jest.fn();
}
