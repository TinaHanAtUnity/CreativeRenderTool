import { VastCampaign as Base } from 'VAST/Models/VastCampaign';

export type VastCampaignMock = Base & {
};

export const VastCampaign = jest.fn(() => {
    return <VastCampaignMock>{
    };
});
