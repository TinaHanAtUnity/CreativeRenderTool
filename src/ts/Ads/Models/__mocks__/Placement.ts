import { Placement as Base } from 'Ads/Models/Placement';
import Mock = jest.Mock;

export type PlacementMock = Base & {
    allowSkip: Mock<boolean>;
    getId: Mock<string>;
    muteVideo: Mock<boolean>;
};

export const Placement = jest.fn(() => {
    return <PlacementMock>{
        allowSkip: jest.fn(),
        getId: jest.fn(),
        muteVideo: jest.fn()
    };
});
