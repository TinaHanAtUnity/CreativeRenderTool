import { OpenMeasurement as Base } from 'Ads/Views/OpenMeasurement/OpenMeasurement';
import { CampaignMock } from 'Ads/Models/__mocks__/Campaign';

export type OpenMeasurementMock = Base<CampaignMock> & {
    getOMAdSessionId: jest.Mock;
};

export const OpenMeasurement = jest.fn(() => {
    return <OpenMeasurementMock>{
        getOMAdSessionId: jest.fn().mockImplementation(() => '')
    };
});
