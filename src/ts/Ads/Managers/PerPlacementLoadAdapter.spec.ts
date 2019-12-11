import { RequestManager, RequestManagerMock } from 'Core/Managers/__mocks__/RequestManager';
import { ThirdPartyEventMacro, ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Platform } from 'Core/Constants/Platform';
import { Core } from 'Core/__mocks__/Core';
import { CoreConfiguration } from 'Core/Models/__mocks__/CoreConfiguration';
import { AdsConfiguration } from 'Ads/Models/__mocks__/AdsConfiguration';
import { WakeUpManager } from 'Core/Managers/__mocks__/WakeUpManager';
import { SessionManager } from 'Ads/Managers/__mocks__/SessionManager';
import { FocusManager} from 'Core/Managers/__mocks__/FocusManager';

import { ClientInfoMock, ClientInfo } from 'Core/Models/__mocks__/ClientInfo';
import { DeviceInfoMock, DeviceInfo } from 'Core/Models/__mocks__/DeviceInfo';
import { PerPlacementLoadAdapter } from 'Ads/Managers/PerPlacementLoadAdapter';
import { CampaignManagerMock, CampaignManager } from 'Ads/Managers/__mocks__/CampaignManager';
import { UserPrivacyManagerMock, UserPrivacyManager } from 'Ads/Managers/__mocks__/UserPrivacyManager';

import { ICore, ICoreApi } from 'Core/ICore';
import { Ads, AdsMock } from 'Ads/__mocks__/Ads';
import { CacheManagerMock, CacheManager } from 'Ads/Managers/__mocks__/CacheManager';

import { Backend } from 'Backend/Backend';




import { AdMobSignalFactory } from 'AdMob/Utilities/AdMobSignalFactory';
import { AssetManager } from 'Ads/Managers/AssetManager';

import { ContentTypeHandlerManager } from 'Ads/Managers/ContentTypeHandlerManager';

import { Placement, PlacementState } from 'Ads/Models/Placement';
import { AdsConfigurationParser } from 'Ads/Parsers/AdsConfigurationParser';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { CacheBookkeepingManager } from 'Core/Managers/CacheBookkeepingManager';

import { MetaDataManager } from 'Core/Managers/MetaDataManager';



import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { CoreConfigurationParser } from 'Core/Parsers/CoreConfigurationParser';
import { StorageBridge } from 'Core/Utilities/StorageBridge';

import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { PrivacySDK } from 'Privacy/PrivacySDK';

import { AbstractAdUnit, IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { Campaign } from 'Ads/Models/Campaign';
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';
import { IStoreApi } from 'Store/IStore';
import { AdUnitContainer, IAdUnit, Orientation, ViewConfiguration } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { Address } from 'cluster';

export class TestContainer extends AdUnitContainer {
    public open(adUnit: IAdUnit, views: string[], allowRotation: boolean, forceOrientation: Orientation, disableBackbutton: boolean, options: any): Promise<void> {
        return Promise.resolve();
    }
    public close(): Promise<void> {
        return Promise.resolve();
    }
    public reconfigure(configuration: ViewConfiguration): Promise<unknown[]> {
        return Promise.all([]);
    }
    public reorient(allowRotation: boolean, forceOrientation: Orientation): Promise<void> {
        return Promise.resolve(void 0);
    }
    public isPaused(): boolean {
        return false;
    }
    public setViewFrame(view: string, x: number, y: number, width: number, height: number): Promise<void> {
        return Promise.resolve();
    }
    public getViews(): Promise<string[]> {
        return Promise.all([]);
    }
}
export class TestAdUnit extends AbstractAdUnit {

    public show(): Promise<void> {
        return Promise.resolve();
    }
    public hide(): Promise<void> {
        return Promise.resolve();
    }
    public description(): string {
        return 'TestAdUnit';
    }
    public isShowing() {
        return true;
    }
    public isCached() {
        return false;
    }
}

describe('PerPlacementLoadAdapterTest', () => {
    //let PerPlacementLoadAdapter: PerPlacementLoadAdapter;
    //let thirdPartyEventManager: ThirdPartyEventManager;
    let request: RequestManagerMock;

    beforeEach(() => {
        const core: ICoreApi = new Core().Api;
        request = new RequestManager();
        thirdPartyEventManager = new ThirdPartyEventManager(core, request);
    });

    describe('when replacing Open Measurement Macros', () => {
        const urlTemplate = 'http://foo.biz/123?is_om_enabled=%25OM_ENABLED%25&om_vendors=%25OM_VENDORS%25';

        it('should replace om_enabled macro correctly', () => {
            thirdPartyEventManager.setTemplateValue(ThirdPartyEventMacro.OM_ENABLED, 'true');
            thirdPartyEventManager.sendWithGet('eventName', 'sessionId', urlTemplate);
            expect(request.get).toHaveBeenCalledWith('http://foo.biz/123?is_om_enabled=true&om_vendors=%25OM_VENDORS%25', expect.anything(), expect.anything());
        });

        it('should replace om_vendors macro correctly', () => {
            thirdPartyEventManager.setTemplateValue(ThirdPartyEventMacro.OM_VENDORS, 'value1|value2|value3');
            thirdPartyEventManager.sendWithGet('eventName', 'sessionId', urlTemplate);
            expect(request.get).toHaveBeenCalledWith('http://foo.biz/123?is_om_enabled=%25OM_ENABLED%25&om_vendors=value1%7Cvalue2%7Cvalue3', expect.anything(), expect.anything());
        });
    });
});

describe('PerPlacementLoadAdapterTest', () => {
    let deviceInfo: DeviceInfoMock;
    let clientInfo: ClientInfoMock;
    let campaignManager: CampaignManagerMock;
    let privacyManager: UserPrivacyManagerMock;
    let cacheManager: CacheManagerMock;
    let ads: AdsMock; // or Ads
    let core: ICoreApi;
    let wakeUpManager: WakeUpManager;
    let sessionManager: SessionManager;
    let focusManager: FocusManager;
    let request: RequestManagerMock; 

    let coreConfig: CoreConfiguration;
    let adsConfig: AdsConfiguration;
   
    let platform: Platform;

    let perPlacementLoadAdapter: PerPlacementLoadAdapter;

    beforeEach(() => {
        platform = Platform.ANDROID;
        core = new Core().Api;
        request = new RequestManager();
        wakeUpManager = new WakeUpManager();
        sessionManager = new SessionManager();
        adsConfig = new AdsConfiguration();
        coreConfig = new CoreConfiguration();
        cacheManager = new CacheManager();
        privacyManager = new UserPrivacyManager();
        campaignManager = new CampaignManager();
    });

    describe('should handle onLoad', () => {
        let placement: Placement;
        let placementID: string;


        beforeEach(() => {
            placementID = 'premium';
            placement = adsConfig.getPlacement(placementID);
            placement.setState(PlacementState.NOT_AVAILABLE);
            //sandbox = sinon.createSandbox();
           // sendReadyEventStub = sandbox.stub(ads.Listener, 'sendReadyEvent');
            //sendPlacementStateChangedEventStub = sandbox.stub(ads.Listener, 'sendPlacementStateChangedEvent');

            perPlacementLoadAdapter = new PerPlacementLoadAdapter(platform, core, coreConfig, ads.Api, wakeUpManager, campaignManager, adsConfig, focusManager, sessionManager, clientInfo, request, cacheManager);
        });

        afterEach(() => {
           //
        });

        describe('Ready state', () => {
            before(() => {
                placement.setState(PlacementState.READY);
                const loadDict: {[key: string]: number} = {};
                loadDict[placementID] = 1;
                ads.LoadApi.onLoad.trigger(loadDict);
            });
            
            it('should have send PlacementStateChanged from not_available to waiting', () => {
                expect(ads.Listener.sendPlacementStateChangedEvent).toHaveBeenCalledWith(placementID, 'NOT_AVAILABLE', 'WAITING');
            });

            it('should have send PlacementStateChanged from waiting to ready', () => {
                expect(ads.Listener.sendPlacementStateChangedEvent).toHaveBeenCalledWith(placementID, 'WAITING', 'READY');
            });

            it('should have sent Ready', () => {
                expect(ads.Listener.sendReadyEvent).toHaveBeenCalled();
            });
        });

        describe('No fill state', () => {
            before(() => {
                placement.setState(PlacementState.NO_FILL);
                const loadDict: {[key: string]: number} = {};
                loadDict[placementID] = 1;
                ads.LoadApi.onLoad.trigger(loadDict);
            });
            
            it('should have send PlacementStateChanged from not_available to waiting', () => {
                expect(ads.Listener.sendPlacementStateChangedEvent).toHaveBeenCalledWith(placementID, 'NOT_AVAILABLE', 'WAITING');
            });

            it('should have send PlacementStateChanged from waiting to no_fill', () => {
                expect(ads.Listener.sendPlacementStateChangedEvent).toHaveBeenCalledWith(placementID, 'WAITING', 'NO_FILL');
            });

            it('should not sent Ready', () => {
                expect(ads.Listener.sendReadyEvent).not.toHaveBeenCalled();
            });
        });

        describe('Waiting state', () => {
            before(() => {
                placement.setState(PlacementState.WAITING);
                const loadDict: {[key: string]: number} = {};
                loadDict[placementID] = 1;
                ads.LoadApi.onLoad.trigger(loadDict);
            });
            
            it('should have send PlacementStateChanged from not_available to waiting', () => {
                expect(ads.Listener.sendPlacementStateChangedEvent).toHaveBeenCalledWith(placementID, 'NOT_AVAILABLE', 'WAITING');
            });

            describe('Waiting change to Ready', () => {
                before(() => {
                    perPlacementLoadAdapter.setPlacementStates(PlacementState.READY, [placementID]);
                });

                it('should have send PlacementStateChanged from wating to ready', () => {
                    expect(ads.Listener.sendPlacementStateChangedEvent).toHaveBeenCalledWith(placementID, 'WAITING', 'READY');
                });

                it('should have sent Ready', () => {
                    expect(ads.Listener.sendReadyEvent).toHaveBeenCalled();
                });

            });
        });

        // describe('setCurrentAdUnit', () => {
        //     let adUnitParams: IAdUnitParameters<Campaign>;
        //     let store: IStoreApi;
        //     let container: AdUnitContainer;
        //     let thirdPartyEventManager: ThirdPartyEventManager;
        //     let operativeEventManager: OperativeEventManager;
        //     let privacy: AbstractPrivacy;

        //     beforeEach(() => {
        //         privacy = sinon.createStubInstance(AbstractPrivacy);
        //         container = new TestContainer();
        //         thirdPartyEventManager = new ThirdPartyEventManager(core, request);
        //         const campaign = TestFixtures.getCampaign();
        //         store = TestFixtures.getStoreApi(nativeBridge);

        //         operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager({
        //             platform,
        //             core,
        //             ads,
        //             request: request,
        //             metaDataManager: metaDataManager,
        //             sessionManager: sessionManager,
        //             clientInfo: clientInfo,
        //             deviceInfo: deviceInfo,
        //             coreConfig: coreConfig,
        //             adsConfig: adsConfig,
        //             storageBridge: storageBridge,
        //             campaign: campaign,
        //             playerMetadataServerId: 'test-gamerSid',
        //             privacySDK: privacySDK,
        //             userPrivacyManager: privacyManager
        //         });

        //         adUnitParams = {
        //             platform,
        //             core,
        //             ads,
        //             store,
        //             forceOrientation: Orientation.NONE,
        //             focusManager: focusManager,
        //             container: container,
        //             deviceInfo: deviceInfo,
        //             clientInfo: clientInfo,
        //             thirdPartyEventManager: thirdPartyEventManager,
        //             operativeEventManager: operativeEventManager,
        //             placement: TestFixtures.getPlacement(),
        //             campaign: campaign,
        //             coreConfig: coreConfig,
        //             adsConfig: adsConfig,
        //             request: request,
        //             options: {},
        //             privacyManager: privacyManager,
        //             programmaticTrackingService: programmaticTrackingService,
        //             privacy: privacy,
        //             privacySDK: privacySDK
        //         };
        //     });

        //     it('should handle setting the current ad unit correctly', () => {
        //         const campaign: Campaign = TestFixtures.getCampaign();
        //         adUnitParams.placement = placement;
        //         adUnitParams.campaign = campaign;

        //         placement.setState(PlacementState.READY);
        //         const currentAdUnit = new TestAdUnit(adUnitParams);

        //         perPlacementLoadAdapter.setCurrentAdUnit(currentAdUnit, placement);
        //         currentAdUnit.onStart.trigger();

        //         assert.isUndefined(placement.getCurrentCampaign());
        //         sinon.assert.calledWith(sendPlacementStateChangedEventStub, placementID, 'READY', 'NOT_AVAILABLE');
        //     });
        // });
    });
});