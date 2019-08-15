import { ProgrammaticTrackingService as Base } from 'Ads/Utilities/ProgrammaticTrackingService';

export type ProgrammaticTrackingServiceMock = Base & {
    reportError: jest.Mock;
    reportMetric: jest.Mock;
};

export const ProgrammaticTrackingService = jest.fn(() => {
    return <ProgrammaticTrackingServiceMock>{
        reportError: jest.fn(),
        reportMetric: jest.fn()
    };
});
