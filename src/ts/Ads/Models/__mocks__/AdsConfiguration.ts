import { AdsConfiguration as Base } from 'Ads/Models/AdsConfiguration';

export type AdsConfigurationMock = Base & {
};

export const AdsConfiguration = jest.fn(() => {
    return <AdsConfigurationMock>{
    };
});
