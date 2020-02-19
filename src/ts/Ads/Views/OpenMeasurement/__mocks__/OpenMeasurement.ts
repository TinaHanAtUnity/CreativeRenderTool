import { OpenMeasurement as Base } from 'Ads/Views/OpenMeasurement/OpenMeasurement';
import { VastCampaignMock } from 'VAST/Models/__mocks__/VastCampaign';
import { AdMobCampaignMock } from 'AdMob/Models/__mocks__/AdMobCampaign';

export type OpenMeasurementMockAdmob = Base<AdMobCampaignMock> & {
    getOMAdSessionId: jest.Mock;
    sessionStart: jest.Mock;
    getVastVerification: jest.Mock;
    setAdmobOMSessionId: jest.Mock;
    addToViewHierarchy: jest.Mock;
    injectVerificationResources: jest.Mock;
    getVerificationResource: jest.Mock;
};

export const OpenMeasurementAdmob = jest.fn(() => {
    return <OpenMeasurementMockAdmob>{
        getOMAdSessionId: jest.fn().mockImplementation(() => ''),
        sessionStart: jest.fn().mockImplementation(() => ''),
        getVastVerification: jest.fn(),
        setAdmobOMSessionId: jest.fn(),
        addToViewHierarchy: jest.fn(),
        injectVerificationResources: jest.fn(),
        getVerificationResource: jest.fn()
    };
});

export type OpenMeasurementMockVast = Base<VastCampaignMock> & {
    getOMAdSessionId: jest.Mock;
    sessionStart: jest.Mock;
    getVastVerification: jest.Mock;
    setAdmobOMSessionId: jest.Mock;
    addToViewHierarchy: jest.Mock;
    injectVerificationResources: jest.Mock;
    getVerificationResource: jest.Mock;
};

export const OpenMeasurementVast = jest.fn(() => {
    return <OpenMeasurementMockVast>{
        getOMAdSessionId: jest.fn().mockImplementation(() => ''),
        sessionStart: jest.fn().mockImplementation(() => ''),
        getVastVerification: jest.fn(),
        setAdmobOMSessionId: jest.fn(),
        addToViewHierarchy: jest.fn(),
        injectVerificationResources: jest.fn(),
        getVerificationResource: jest.fn()
    };
});
