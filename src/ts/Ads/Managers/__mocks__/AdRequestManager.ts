import { AdRequestManager as Base, INotCachedLoadedCampaign } from 'Ads/Managers/AdRequestManager';
import { ObservableMock, Observable } from 'Core/Utilities/__mocks__/Observable';
import { ILoadedCampaign } from 'Ads/Managers/CampaignManager';

export type AdRequestManagerMock = Base & {
    onNoFill: ObservableMock;
    onCampaign: ObservableMock;
    requestPreload: jest.Mock;
    loadCampaign: jest.Mock;
    requestReload: jest.Mock;
    request: jest.Mock;
    isPreloadDataExpired: jest.Mock<boolean>;
    hasPreloadFailed: jest.Mock<boolean>;
    onAdditionalPlacementsReady: ObservableMock;
    cacheCampaign: jest.Mock<Promise<ILoadedCampaign>>;
    loadCampaignWithAdditionalPlacement: jest.Mock;
    reportMetricEvent: jest.Mock;
};

export const AdRequestManager = jest.fn(() => {
    return <AdRequestManagerMock>{
        onNoFill: Observable(),
        onCampaign: Observable(),
        requestPreload: jest.fn().mockImplementation(() => Promise.resolve()),
        loadCampaign: jest.fn().mockImplementation(() => Promise.resolve()),
        requestReload: jest.fn().mockImplementation(() => Promise.resolve()),
        request: jest.fn().mockImplementation(() => Promise.resolve()),
        isPreloadDataExpired: jest.fn().mockReturnValue(false),
        hasPreloadFailed: jest.fn().mockReturnValue(false),
        onAdditionalPlacementsReady: Observable(),
        cacheCampaign: jest.fn().mockImplementation((notCachedLoadedCampaign: INotCachedLoadedCampaign) => Promise.resolve({
            campaign: notCachedLoadedCampaign.notCachedCampaign,
            trackingUrl: notCachedLoadedCampaign.notCachedTrackingUrls
        })),
        loadCampaignWithAdditionalPlacement: jest.fn().mockImplementation(() => Promise.resolve()),
        reportMetricEvent: jest.fn()
    };
});
