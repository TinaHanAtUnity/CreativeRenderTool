import { AdsConfiguration as Base } from 'Ads/Models/AdsConfiguration';

export type AdsConfigurationMock = Base & {
    getPlacement: jest.Mock;
    getPlacements: jest.Mock;
    getPlacementIds: jest.Mock;
    getHidePrivacy: jest.Mock<boolean>;
    getPlacementsForAdunit: jest.Mock<string[]>;
};

export const AdsConfiguration = jest.fn(() => {
    return <AdsConfigurationMock>{
        getPlacement: jest.fn(),
        getPlacements: jest.fn().mockReturnValue({}),
        getPlacementIds: jest.fn().mockReturnValue([]),
        getHidePrivacy: jest.fn().mockImplementation(() => true),
        getPlacementsForAdunit: jest.fn().mockReturnValue([])
    };
});
