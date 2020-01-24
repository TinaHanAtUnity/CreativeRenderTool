import { OpenMeasurement as Base } from 'Ads/Views/OpenMeasurement/OpenMeasurement';

export type OpenMeasurementMock = Base & {
    getOMAdSessionId: jest.Mock;
    sessionStart: jest.Mock;
    getVastVerification: jest.Mock;
    setAdmobOMSessionId: jest.Mock;
    addToViewHierarchy: jest.Mock;
    injectVerificationResources: jest.Mock;
    getVerificationResource: jest.Mock;
};

export const OpenMeasurement = jest.fn(() => {
    return <OpenMeasurementMock>{
        getOMAdSessionId: jest.fn().mockImplementation(() => ''),
        sessionStart: jest.fn().mockImplementation(() => ''),
        getVastVerification: jest.fn(),
        setAdmobOMSessionId: jest.fn(),
        addToViewHierarchy: jest.fn(),
        injectVerificationResources: jest.fn(),
        getVerificationResource: jest.fn()
    };
});
