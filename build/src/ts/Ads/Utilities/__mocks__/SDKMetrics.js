import { SDKMetrics as Base } from 'Ads/Utilities/SDKMetrics';
// Called from test_utils/jest.setup.js to mock before every test
export function MockMetrics() {
    Base.initialize = jest.fn();
    Base.setMetricInstance = jest.fn();
    Base.reportMetricEvent = jest.fn();
    Base.reportMetricEventWithTags = jest.fn();
    Base.reportTimingEvent = jest.fn();
    Base.reportTimingEventWithTags = jest.fn();
    Base.sendBatchedEvents = jest.fn();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU0RLTWV0cmljcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy90cy9BZHMvVXRpbGl0aWVzL19fbW9ja3NfXy9TREtNZXRyaWNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLElBQUksSUFBSSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFFOUQsaUVBQWlFO0FBQ2pFLE1BQU0sVUFBVSxXQUFXO0lBQ3ZCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO0lBQzVCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUM7SUFDbkMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQztJQUNuQyxJQUFJLENBQUMseUJBQXlCLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO0lBQzNDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUM7SUFDbkMsSUFBSSxDQUFDLHlCQUF5QixHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQztJQUMzQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO0FBQ3ZDLENBQUMifQ==