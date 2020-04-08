import { Placement as Base, PlacementAuctionType, DefaultPlacementAuctionType, PlacementState } from 'Ads/Models/Placement';
import Mock = jest.Mock;
import { Campaign } from 'Ads/Models/Campaign';

export type PlacementMock = Base & {
    allowSkip: Mock<boolean>;
    getId: Mock<string>;
    getAdTypes: Mock<string[]>;
    getAuctionType: Mock<PlacementAuctionType>;
    isBannerPlacement: Mock<boolean>;
    muteVideo: Mock<boolean>;
    getState: Mock<PlacementState>;
    setState: Mock;
    getCurrentCampaign: Mock<Campaign>;
    setCurrentCampaign: Mock;
    getPlacementStateChanged: Mock<boolean>;
    setPlacementStateChanged: Mock;
    getPreviousState: Mock<PlacementState>;
    setCurrentTrackingUrls: Mock;
    isInvalidationPending: Mock<boolean>;
    setInvalidationPending: Mock;
};

export const Placement = jest.fn((id: string = 'video', state: PlacementState = PlacementState.READY, campaign: Campaign | undefined = undefined) => {
    const classState = {
        placementStateChanged: false,
        state: state,
        perviousState: state,
        invalidationPending: false
    };
    return <PlacementMock>{
        allowSkip: jest.fn().mockReturnValue(false),
        getId: jest.fn().mockReturnValue(id),
        getAdTypes: jest.fn().mockReturnValue(['VIDEO']),
        getAuctionType: jest.fn().mockReturnValue(DefaultPlacementAuctionType),
        isBannerPlacement: jest.fn().mockReturnValue(false),
        muteVideo: jest.fn(),
        getState: jest.fn().mockImplementation((x) => classState.state),
        setState: jest.fn().mockImplementation((x) => { classState.placementStateChanged = true; classState.perviousState = classState.state; classState.state = x; }),
        getCurrentCampaign: jest.fn().mockReturnValue(campaign),
        setCurrentCampaign: jest.fn(),
        getPlacementStateChanged: jest.fn().mockImplementation(() => classState.placementStateChanged),
        setPlacementStateChanged: jest.fn().mockImplementation((x) => classState.placementStateChanged = x),
        getPreviousState: jest.fn().mockImplementation((x) => classState.perviousState),
        setCurrentTrackingUrls: jest.fn(),
        setInvalidationPending: jest.fn().mockImplementation((x) => classState.invalidationPending = x),
        isInvalidationPending: jest.fn().mockImplementation((x) => classState.invalidationPending),
    };
});
