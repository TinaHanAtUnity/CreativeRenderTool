import { AdsConfiguration as Base } from 'Ads/Models/AdsConfiguration';

export type AdsConfigurationMock = Base & {
    getHidePrivacy: jest.Mock<boolean>;
};

export const AdsConfiguration = jest.fn(() => {
    return <AdsConfigurationMock>{
        getHidePrivacy: jest.fn().mockImplementation(() => true)
    };
});
