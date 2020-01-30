import { OpenMeasurementAdViewBuilder as Base } from 'Ads/Views/OpenMeasurement/OpenMeasurementAdViewBuilder';

export type OpenMeasurementAdViewBuilderMock = Base & {

};

export const OpenMeasurementAdViewBuilder = jest.fn(() => {
  return <OpenMeasurementAdViewBuilderMock> {};
});
