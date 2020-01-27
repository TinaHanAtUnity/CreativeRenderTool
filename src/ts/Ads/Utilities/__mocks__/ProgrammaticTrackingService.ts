import { ProgrammaticTrackingService as Base } from 'Ads/Utilities/ProgrammaticTrackingService';

// Called from test_utils/jest.setup.js to mock before every test
export function MockPTS(): void {
    Base.initialize = jest.fn();
    Base.createAdsSdkTag = jest.fn();
    Base.reportErrorEvent = jest.fn();
    Base.reportMetricEvent = jest.fn();
    Base.reportMetricEventWithTags = jest.fn();
    Base.reportTimingEvent = jest.fn();
    Base.batchEvent = jest.fn();
    Base.sendBatchedEvents = jest.fn();
}
