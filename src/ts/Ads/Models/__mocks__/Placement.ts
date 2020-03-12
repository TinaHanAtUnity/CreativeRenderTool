import { Placement as Base, PlacementAuctionType, DefaultPlacementAuctionType } from 'Ads/Models/Placement';
import Mock = jest.Mock;

export type PlacementMock = Base & {
    allowSkip: Mock<boolean>;
    getId: Mock<string>;
    getAdTypes: Mock<string[]>;
    getAuctionType: Mock<PlacementAuctionType>;
    isBannerPlacement: Mock<boolean>;
    muteVideo: Mock<boolean>;
};

export const Placement = jest.fn((id: string = 'video') => {
    return <PlacementMock>{
        allowSkip: jest.fn().mockReturnValue(false),
        getId: jest.fn().mockReturnValue(id),
        getAdTypes: jest.fn().mockReturnValue(['VIDEO']),
        getAuctionType: jest.fn().mockReturnValue(DefaultPlacementAuctionType),
        isBannerPlacement: jest.fn().mockReturnValue(false),
        muteVideo: jest.fn()
    };
});
