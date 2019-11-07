import { Placement as Base } from 'Ads/Models/Placement';
import Mock = jest.Mock;

export type PlacementMock = Base & {
    allowSkip: Mock<boolean>;
    getId: Mock<string>;
};

export const Placement = jest.fn(() => {
    return <PlacementMock>{
        allowSkip: jest.fn(),
        getId: jest.fn()
    };
});
