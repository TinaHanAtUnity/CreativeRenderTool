import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import VastEndScreenFixture from 'html/fixtures/VastEndScreenFixture.html';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { PrivacySDK } from 'Privacy/PrivacySDK';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { FocusManager } from 'Core/Managers/FocusManager';
import { Activity } from 'Ads/AdUnits/Containers/Activity';
import { ViewController } from 'Ads/AdUnits/Containers/ViewController';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import { RequestManager } from 'Core/Managers/RequestManager';
import { VideoOverlay } from 'Ads/Views/VideoOverlay';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { SDKMetrics } from 'Ads/Utilities/SDKMetrics';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { Privacy } from 'Ads/Views/Privacy';
import { Video } from 'Ads/Models/Assets/Video';
import { VastStaticEndScreen } from 'VAST/Views/VastStaticEndScreen';
[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('VastEndScreen', () => {
        let backend;
        let nativeBridge;
        let core;
        let ads;
        let store;
        let deviceInfo;
        let storageBridge;
        let container;
        let request;
        let vastAdUnitParameters;
        let videoOverlayParameters;
        beforeEach(() => {
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            ads = TestFixtures.getAdsApi(nativeBridge);
            store = TestFixtures.getStoreApi(nativeBridge);
            storageBridge = new StorageBridge(core);
            const focusManager = new FocusManager(platform, core);
            const metaDataManager = new MetaDataManager(core);
            const clientInfo = TestFixtures.getClientInfo(platform);
            if (platform === Platform.ANDROID) {
                deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
                container = new Activity(core, ads, deviceInfo);
            }
            else if (platform === Platform.IOS) {
                deviceInfo = TestFixtures.getIosDeviceInfo(core);
                container = new ViewController(core, ads, deviceInfo, focusManager, clientInfo);
            }
            request = new RequestManager(platform, core, new WakeUpManager(core));
            sinon.stub(request, 'followRedirectChain').callsFake((url) => {
                return Promise.resolve(url);
            });
            sinon.stub(SDKMetrics, 'reportMetricEvent').returns(Promise.resolve());
            const campaign = TestFixtures.getCompanionStaticVastCampaign();
            const thirdPartyEventManager = new ThirdPartyEventManager(core, request);
            const sessionManager = new SessionManager(core, request, storageBridge);
            const coreConfig = TestFixtures.getCoreConfiguration();
            const adsConfig = TestFixtures.getAdsConfiguration();
            const privacySDK = sinon.createStubInstance(PrivacySDK);
            const privacyManager = sinon.createStubInstance(UserPrivacyManager);
            const operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager({
                platform,
                core,
                ads,
                request: request,
                metaDataManager: metaDataManager,
                sessionManager: sessionManager,
                clientInfo: clientInfo,
                deviceInfo: deviceInfo,
                coreConfig: coreConfig,
                adsConfig: adsConfig,
                storageBridge: storageBridge,
                campaign: campaign,
                playerMetadataServerId: 'test-gamerSid',
                privacySDK: privacySDK,
                userPrivacyManager: privacyManager
            });
            const privacy = new Privacy(platform, campaign, privacyManager, false, false, 'en');
            const video = new Video('', TestFixtures.getSession());
            const placement = TestFixtures.getPlacement();
            videoOverlayParameters = {
                deviceInfo: deviceInfo,
                campaign: campaign,
                coreConfig: coreConfig,
                placement: placement,
                clientInfo: clientInfo,
                platform: platform,
                ads: ads
            };
            const overlay = new VideoOverlay(videoOverlayParameters, privacy, false, false);
            vastAdUnitParameters = {
                platform,
                core,
                ads,
                store,
                forceOrientation: Orientation.LANDSCAPE,
                focusManager: focusManager,
                container: container,
                deviceInfo: deviceInfo,
                clientInfo: clientInfo,
                thirdPartyEventManager: thirdPartyEventManager,
                operativeEventManager: operativeEventManager,
                placement: TestFixtures.getPlacement(),
                campaign: campaign,
                coreConfig: coreConfig,
                adsConfig: adsConfig,
                request: request,
                options: {},
                endScreen: undefined,
                overlay: overlay,
                video: video,
                privacyManager: privacyManager,
                privacySDK: privacySDK,
                privacy
            };
        });
        it('should render', () => {
            const endScreen = new VastStaticEndScreen(vastAdUnitParameters);
            endScreen.render();
            assert.equal(endScreen.container().innerHTML, VastEndScreenFixture);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdEVuZFNjcmVlblRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90ZXN0L1VuaXQvVkFTVC9WYXN0RW5kU2NyZWVuVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUVyRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzlCLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUduRCxPQUFPLG9CQUFvQixNQUFNLHlDQUF5QyxDQUFDO0FBQzNFLE9BQU8sT0FBTyxDQUFDO0FBQ2YsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUM7QUFDL0IsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBRXhELE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBQzdFLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUM3RCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDaEQsT0FBTyxFQUFtQixXQUFXLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUN0RixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDMUQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBRTNELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUt2RSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDN0QsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRTlELE9BQU8sRUFBMkIsWUFBWSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFFL0UsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQ2hFLE9BQU8sRUFBRSxh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