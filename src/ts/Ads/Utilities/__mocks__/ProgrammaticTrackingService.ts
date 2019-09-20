import { ProgrammaticTrackingService as Base } from 'Ads/Utilities/ProgrammaticTrackingService';

export type ProgrammaticTrackingServiceMock = Base & {
    reportErrorEvent: jest.Mock;
    reportMetricEvent: jest.Mock;
};

export const ProgrammaticTrackingService = jest.fn(() => {
    return <ProgrammaticTrackingServiceMock>{
        reportErrorEvent: jest.fn(),
        reportMetricEvent: jest.fn()
    };
});
