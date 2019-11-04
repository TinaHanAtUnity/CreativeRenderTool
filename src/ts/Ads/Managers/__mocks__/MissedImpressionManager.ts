import { MissedImpressionManager as Base } from 'Ads/Managers/MissedImpressionManager';

export type MissedImpressionManagerMock = Base & {
};

export const MissedImpressionManager = jest.fn(() => {
    return <MissedImpressionManagerMock><unknown>{
    };
});
