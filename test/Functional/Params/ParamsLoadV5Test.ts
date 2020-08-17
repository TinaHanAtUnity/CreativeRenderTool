import { AdMobOptionalSignal } from 'AdMob/Models/AdMobOptionalSignal';
import { AdMobSignalFactory } from 'AdMob/Utilities/AdMobSignalFactory';
import { AssetManager } from 'Ads/Managers/AssetManager';
import { ContentTypeHandlerManager } from 'Ads/Managers/ContentTypeHandlerManager';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { Session } from 'Ads/Models/Session';
import { Platform } from 'Core/Constants/Platform';
import { CacheBookkeepingManager } from 'Core/Managers/CacheBookkeepingManager';
import { CacheManager } from 'Core/Managers/CacheManager';
import { FocusManager } from 'Core/Managers/FocusManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { RequestManager } from 'Core/Managers/RequestManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { CacheMode, CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import { ParamsTestData } from 'Functional/Params/ParamsTestData';

import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { RequestPrivacyFactory, IRequestPrivacy } from 'Ads/Models/RequestPrivacy';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { AdRequestManager, LoadV5ExperimentType } from 'Ads/Managers/AdRequestManager';
import { SDKMetrics } from 'Ads/Utilities/SDKMetrics';
import { SpecVerifier } from 'Functional/Params/ParamsTest';
import { LoadAndFillEventManager } from 'Ads/Managers/__mocks__/LoadAndFillEventManager';

describe('Event parameters should match specifications (Load V5)', () => {

    describe('with ad request', () => {
        let coreConfig: CoreConfiguration;
        let adsConfig: AdsConfiguration;
        let sandbox: sinon.SinonSandbox;

        beforeEach(() => {
            sandbox = sinon.createSandbox();
            coreConfig = TestFixtures.getCoreConfiguration();
            adsConfig = TestFixtures.getAdsConfiguration();

            sandbox.stub(SDKMetrics, 'reportMetricEvent');
            sandbox.stub(SDKMetrics, 'reportMetricEventWithTags');
        });

        afterEach(() => {
            sandbox.restore();
        });

        it('on Android', () => {
            const platform = Platform.ANDROID;
            const backend = TestFixtures.getBackend(platform);
            const nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            const coreModule = TestFixtures.getCoreModule(nativeBridge);
            coreModule.Ads.LoadAndFillEventManager = LoadAndFillEventManager();
            const core = coreModule.Api;
            const privacySDK = TestFixtures.getPrivacySDK(core);
            const ads = TestFixtures.getAdsApi(nativeBridge);
            const storageBridge = new StorageBridge(core);
            const metaDataManager = new MetaDataManager(core);
            const request = new RequestManager(platform, core, new WakeUpManager(core));
            const requestSpy: any = sandbox.stub(request, 'post').returns(Promise.resolve(TestFixtures.getOkNativeResponse()));
            const clientInfo = TestFixtures.getClientInfo(platform);
            const deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
            const cacheBookkeeping = new CacheBookkeepingManager(core);
            const wakeUpManager = new WakeUpManager(core);
            const assetManager = new AssetManager(platform, core, new CacheManager(core, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping);
            const sessionManager = new SessionManager(core, request, storageBridge);
            const focusManager = new FocusManager(platform, core);
            const adMobSignalFactory = new AdMobSignalFactory(platform, core, ads, clientInfo, deviceInfo, focusManager);
            const campaignParserManager = new ContentTypeHandlerManager();
            const privacyManager = new UserPrivacyManager(platform, core, coreConfig, adsConfig, clientInfo, deviceInfo, request, privacySDK);
            sandbox.stub(adMobSignalFactory, 'getOptionalSignal').returns(Promise.resolve(new AdMobOptionalSignal()));
            sandbox.stub(core.DeviceInfo, 'getUniqueEventId').returns(Promise.resolve('abdce-12345'));
            sandbox.stub(sessionManager, 'startNewSession').returns(Promise.resolve(new Session('abdce-12345')));
            sandbox.stub(RequestPrivacyFactory, 'create').returns(<IRequestPrivacy>{});
            sessionManager.setGameSessionId(1234);
            const campaignManager: AdRequestManager = new AdRequestManager(platform, coreModule, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, campaignParserManager, privacySDK, privacyManager, LoadV5ExperimentType.None);
            return campaignManager.request().then(() => {
                const url: string = requestSpy.getCall(0).args[0];
                const body: string = requestSpy.getCall(0).args[1];

                const verifier: SpecVerifier = new SpecVerifier(Platform.ANDROID, ParamsTestData.getAdRequestParams(), url, body);
                verifier.assert();
            });
        });

        it('on iOS', () => {
            const platform = Platform.IOS;
            const backend = TestFixtures.getBackend(platform);
            const nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            const coreModule = TestFixtures.getCoreModule(nativeBridge);
            coreModule.Ads.LoadAndFillEventManager = LoadAndFillEventManager();
            const core = coreModule.Api;
            const privacySDK = TestFixtures.getPrivacySDK(core);
            const ads = TestFixtures.getAdsApi(nativeBridge);
            const storageBridge = new StorageBridge(core);
            const metaDataManager = new MetaDataManager(core);
            const request = new RequestManager(platform, core, new WakeUpManager(core));
            const requestSpy: any = sandbox.stub(request, 'post').returns(Promise.resolve(TestFixtures.getOkNativeResponse()));
            const clientInfo = TestFixtures.getClientInfo(platform);
            const deviceInfo = TestFixtures.getIosDeviceInfo(core);
            const cacheBookkeeping = new CacheBookkeepingManager(core);
            const wakeUpManager = new WakeUpManager(core);
            const assetManager = new AssetManager(platform, core, new CacheManager(core, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping);
            const sessionManager = new SessionManager(core, request, storageBridge);
            const focusManager = new FocusManager(platform, core);
            const adMobSignalFactory = new AdMobSignalFactory(platform, core, ads, clientInfo, deviceInfo, focusManager);
            const campaignParserManager = new ContentTypeHandlerManager();
            const privacyManager = new UserPrivacyManager(platform, core, coreConfig, adsConfig, clientInfo, deviceInfo, request, privacySDK);
            sandbox.stub(adMobSignalFactory, 'getOptionalSignal').returns(Promise.resolve(new AdMobOptionalSignal()));
            sandbox.stub(core.DeviceInfo, 'getUniqueEventId').returns(Promise.resolve('abdce-12345'));
            sandbox.stub(sessionManager, 'startNewSession').returns(Promise.resolve(new Session('abdce-12345')));
            sessionManager.setGameSessionId(1234);
            const campaignManager: AdRequestManager = new AdRequestManager(platform, coreModule, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, campaignParserManager, privacySDK, privacyManager, LoadV5ExperimentType.None);
            return campaignManager.request().then(() => {
                const url: string = requestSpy.getCall(0).args[0];
                const body: string = requestSpy.getCall(0).args[1];

                const verifier: SpecVerifier = new SpecVerifier(Platform.IOS, ParamsTestData.getAdRequestParams(), url, body);
                verifier.assert();
            });
        });
    });
});
