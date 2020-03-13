import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { Backend } from 'Backend/Backend';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import VastEndScreenFixture from 'html/fixtures/VastEndScreenFixture.html';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { VastEndScreen } from 'VAST/Views/VastEndScreen';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { PrivacySDK } from 'Privacy/PrivacySDK';
import { AdUnitContainer, Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { FocusManager } from 'Core/Managers/FocusManager';
import { Activity } from 'Ads/AdUnits/Containers/Activity';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { ViewController } from 'Ads/AdUnits/Containers/ViewController';
import { IosDeviceInfo } from 'Core/Models/IosDeviceInfo';
import { IAdsApi } from 'Ads/IAds';
import { IStoreApi } from 'Store/IStore';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import { RequestManager } from 'Core/Managers/RequestManager';
import { IVastAdUnitParameters } from 'VAST/AdUnits/VastAdUnit';
import { IVideoOverlayParameters, VideoOverlay } from 'Ads/Views/VideoOverlay';
import { Campaign } from 'Ads/Models/Campaign';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { SDKMetrics } from 'Ads/Utilities/SDKMetrics';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { Privacy } from 'Ads/Views/Privacy';
import { Video } from 'Ads/Models/Assets/Video';
import { VastStaticEndScreen } from 'VAST/Views/VastStaticEndScreen';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('VastEndScreen', () => {

        let backend: Backend;
        let nativeBridge: NativeBridge;
        let core: ICoreApi;
        let ads: IAdsApi;
        let store: IStoreApi;
        let deviceInfo: DeviceInfo;
        let storageBridge: StorageBridge;
        let container: AdUnitContainer;
        let request: RequestManager;
        let vastAdUnitParameters: IVastAdUnitParameters;
        let videoOverlayParameters: IVideoOverlayParameters<Campaign>;

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
                container = new Activity(core, ads, <AndroidDeviceInfo>deviceInfo);
            } else if (platform === Platform.IOS) {
                deviceInfo = TestFixtures.getIosDeviceInfo(core);
                container = new ViewController(core, ads, <IosDeviceInfo>deviceInfo, focusManager, clientInfo);
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
