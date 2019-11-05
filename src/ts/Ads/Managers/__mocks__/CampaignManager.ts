import { CampaignManager as Base } from 'Ads/Managers/CampaignManager';

export type CampaignManagerMock = Base & {
};

export const CampaignManager = jest.fn(() => {
    return <CampaignManagerMock><unknown>{
    };
});
