import { BannerModule as Base } from 'Banners/BannerModule';
import { BannerAdUnitParametersFactoryMock, BannerAdUnitParametersFactory } from 'Banners/AdUnits/__mocks__/BannerAdUnitParametersFactory';
import { BannerCampaignManagerMock, BannerCampaignManager } from 'Banners/Managers/__mocks__/BannerCampaignManager';
import { BannerPlacementManagerMock, BannerPlacementManager } from 'Banners/Managers/__mocks__/BannerPlacementManager';
import { BannerAdUnitFactoryMock, BannerAdUnitFactory } from 'Banners/AdUnits/__mocks__/BannerAdUnitFactory';
import { BannerAdContextManagerMock, BannerAdContextManager } from 'Banners/Managers/__mocks__/BannerAdContextManager';
import { IBannerNativeApi } from 'Banners/IBannerModule';
import { BannerApi, BannerApiMock } from 'Banners/Native/__mocks__/BannerApi';
import { BannerListenerApi, BannerListenerApiMock } from 'Banners/Native/__mocks__/BannerListenerApi';

export type BannerNativeApiMock = IBannerNativeApi & {
    BannerApi: BannerApiMock;
    BannerListenerApi: BannerListenerApiMock;
};

export type BannerModuleMock = Base & {
    readonly Api: BannerNativeApiMock;
    AdUnitParametersFactory: BannerAdUnitParametersFactoryMock;
    CampaignManager: BannerCampaignManagerMock;
    PlacementManager: BannerPlacementManagerMock;
    AdUnitFactory: BannerAdUnitFactoryMock;
    BannerAdContextManager: BannerAdContextManagerMock;
};

export const BannerModule = jest.fn(() => {
    return <BannerModuleMock>{
        Api: {
            BannerApi: BannerApi(),
            BannerListenerApi: BannerListenerApi()
        },
        AdUnitParametersFactory: BannerAdUnitParametersFactory(),
        CampaignManager: BannerCampaignManager(),
        PlacementManager: BannerPlacementManager(),
        AdUnitFactory: BannerAdUnitFactory(),
        BannerAdContextManager: BannerAdContextManager()
    };
});
