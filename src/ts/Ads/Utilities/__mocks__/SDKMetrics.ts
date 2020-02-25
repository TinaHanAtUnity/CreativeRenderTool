import { SDKMetrics as Base } from 'Ads/Utilities/SDKMetrics';

// Called from test_utils/jest.setup.js to mock before every test
export function MockMetrics(): void {
    Base.initialize = jest.fn();
    Base.createAdsSdkTag = jest.fn().mockImplementation((suffix, tagValue) => `ads_sdk2_${suffix}:${tagValue}`);
    Base.reportMetricEvent = jest.fn();
    Base.reportMetricEventWithTags = jest.fn();
    Base.reportTimingEvent = jest.fn();
    Base.reportTimingEventWithTags = jest.fn();
    Base.sendBatchedEvents = jest.fn();
}
