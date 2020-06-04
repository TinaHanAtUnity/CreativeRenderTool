import { VastOpenMeasurementController as Base } from 'Ads/Views/OpenMeasurement/VastOpenMeasurementController';

export type VastOpenMeasurementControllerMock = Base & {
};

export const VastOpenMeasurementController = jest.fn(() => {
    return <VastOpenMeasurementControllerMock>{
    };
});
