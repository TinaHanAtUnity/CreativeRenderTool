import { AdRequestManager as Base } from 'Ads/Managers/AdRequestManager';
import { ObservableMock, Observable } from 'Core/Utilities/__mocks__/Observable';

export type AdRequestManagerMock = Base & {
    onNoFill: ObservableMock;
    onCampaign: ObservableMock;
    requestPreload: jest.Mock;
    loadCampaign: jest.Mock;
    requestReload: jest.Mock;
    request: jest.Mock;
    isPreloadDataExpired: jest.Mock<boolean>;
};

export const AdRequestManager = jest.fn(() => {
    return <AdRequestManagerMock>{
        onNoFill: Observable(),
        onCampaign: Observable(),
        requestPreload: jest.fn().mockImplementation(() => Promise.resolve()),
        loadCampaign: jest.fn().mockImplementation(() => Promise.resolve()),
        requestReload: jest.fn().mockImplementation(() => Promise.resolve()),
        request: jest.fn().mockImplementation(() => Promise.resolve()),
        isPreloadDataExpired: jest.fn().mockReturnValue(false)
    };
});
