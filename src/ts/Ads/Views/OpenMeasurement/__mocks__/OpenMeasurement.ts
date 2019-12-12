import { OpenMeasurement as Base } from 'Ads/Views/OpenMeasurement/OpenMeasurement';

export type OpenMeasurementMock = Base & {
    getOMAdSessionId: jest.Mock;
};

export const OpenMeasurement = jest.fn(() => {
    return <OpenMeasurementMock>{
        getOMAdSessionId: jest.fn().mockImplementation(() => '')
    };
});
