import { VastCampaign as Base } from 'VAST/Models/VastCampaign';

export type VastCampaignMock = Base & {
    setOmEnabled: jest.Mock;
    setOMVendors: jest.Mock;
    getSeatId: jest.Mock;
    getVast: jest.Mock;
};

export const VastCampaign = jest.fn(() => {
    return <VastCampaignMock>{
        setOmEnabled: jest.fn(),
        setOMVendors: jest.fn(),
        getSeatId: jest.fn(),
        getVast: jest.fn()
    };
});
