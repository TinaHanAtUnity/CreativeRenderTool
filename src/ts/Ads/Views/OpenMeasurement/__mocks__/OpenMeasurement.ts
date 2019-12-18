import { OpenMeasurement as Base } from 'Ads/Views/OpenMeasurement/OpenMeasurement';
import { Campaign } from 'Ads/Models/Campaign';

export type OpenMeasurementMock = Base<Campaign> & {
    getOMAdSessionId: jest.Mock;
};

export const OpenMeasurement = jest.fn(() => {
    return <OpenMeasurementMock>{
        getOMAdSessionId: jest.fn().mockImplementation(() => '')
    };
});
