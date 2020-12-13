import { AdMobOptionalSignal } from 'AdMob/Models/AdMobOptionalSignal';
import { AdMobSignalFactory } from 'AdMob/Utilities/AdMobSignalFactory';
import { AssetManager } from 'Ads/Managers/AssetManager';
import { LegacyCampaignManager } from 'Ads/Managers/LegacyCampaignManager';
import { ContentTypeHandlerManager } from 'Ads/Managers/ContentTypeHandlerManager';
import { OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { Session } from 'Ads/Models/Session';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { CacheBookkeepingManager } from 'Core/Managers/CacheBookkeepingManager';
import { CacheManager } from 'Core/Managers/CacheManager';
import { ConfigManager } from 'Core/Managers/ConfigManager';
import { FocusManager } from 'Core/Managers/FocusManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { RequestManager } from 'Core/Managers/RequestManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { CacheMode } from 'Core/Models/CoreConfiguration';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import { ParamsTestData } from 'Functional/Params/ParamsTestData';
import ConfigurationAuctionPlc from 'json/ConfigurationAuctionPlc.json';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { AuctionRequest } from 'Ads/Networking/AuctionRequest';
import { RequestPrivacyFactory } from 'Ads/Models/RequestPrivacy';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { SDKMetrics } from 'Ads/Utilities/SDKMetrics';
export class SpecVerifier {
    constructor(platform, spec, url, body) {
        this._platform = platform;
        this._spec = spec;
        const parsedUrl = url.split('?');
        if (parsedUrl.length > 1) {
            this._queryParams = parsedUrl[1].split('&');
        }
        if (body) {
            this._bodyParams = JSON.parse(body);
        }
    }
    assert() {
        this.assertUnspecifiedParams();
        this.assertRequiredParams();
    }
    assertUnspecifiedParams() {
        if (this._queryParams) {
            for (const queryParam of this._queryParams) {
                const paramName = queryParam.split('=')[0];
                const paramValue = queryParam.split('=')[1];
                assert.isDefined(this._spec[paramName], 'Unspecified query parameter: ' + paramName);
                assert.isTrue(this._spec[paramName].queryString, 'Parameter should not be in query string: ' + paramName);
                this.assertQueryParamType(paramName, paramValue);
            }
        }
        if (this._bodyParams) {
            for (const key in this._bodyParams) {
                if (this._bodyParams.hasOwnProperty(key)) {
                    assert.isDefined(this._spec[key], 'Unspecified body parameter: ' + key);
                    assert.isTrue(this._spec[key].body, 'Parameter should not be in request body: ' + key);
                    this.assertBodyParamType(key, this._bodyParams[key]);
                }
            }
        }
    }
    assertRequiredParams() {
        for (const param in this._spec) {
            if (this._spec.hasOwnProperty(param)) {
                if (this.isRequired(this._spec[param].required)) {
                    if (this._spec[param].queryString) {
                        let found = false;
                        for (const queryParam of this._queryParams) {
                            const paramName = queryParam.split('=')[0];
                            if (paramName === param) {
                                found = true;
                            }
                        }
                        assert.isTrue(found, 'Required parameter not found in query string: ' + param);
                    }
                    if (this._spec[param].body) {
                        assert.isTrue(this._bodyParams.hasOwnProperty(param), 'Required parameter not found in body: ' + param);
                    }
                }
            }
        }
    }
    assertQueryParamType(name, value) {
        if (this._spec[name].type === 'boolean') {
            assert.match(value, /(true|false)/i, 'Query parameter type mismatch: ' + name);
        }
        else if (this._spec[name].type === 'number') {
            assert.match(value, /[0-9]+/, 'Query parameter type mismatch: ' + name);
        }
        else if (this._spec[name].type === 'string') {
            // due to lack of better alternatives check that string has legal URL characters
            assert.match(value, /^([\!\#\$\&-\;\=\?-\[\]_a-z\~]|%[0-9a-fA-F]{2})+$/i, 'Query parameter type mismatch: ' + name);
        }
        else {
            assert.fail('Query parameter ' + name + ' with unknown type: ' + this._spec[name].type);
        }
    }
    assertBodyParamType(name, value) {
        assert.equal(this._spec[name].type, typeof value, 'Body parameter type mismatch: ' + name);
    }
    isRequired(required) {
        return required === 'all' || (required === 'android' && this._platform === Platform.ANDROID) || (required === 'ios' && this._platform === Platform.IOS);
    }
}
describe('Event parameters should match specifications', () => {
    describe('with config request', () => {
        it('on Android', () => {
            const platform = Platform.ANDROID;
            const backend = TestFixtures.getBackend(platform);
            const nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            const core = TestFixtures.getCoreApi(nativeBridge);
            const privacySDK = TestFixtures.getPrivacySDK(core);
            const metaDataManager = new MetaDataManager(core);
            const request = new RequestManager(platform, core, new WakeUpManager(core));
            const response = TestFixtures.getOkNativeResponse();
            response.response = JSON.stringify(ConfigurationAuctionPlc);
            const requestSpy = sinon.stub(request, 'get').returns(Promise.resolve(response));
            const configManager = new ConfigManager(platform, core, metaDataManager, TestFixtures.getClientInfo(platform), TestFixtures.getAndroidDeviceInfo(core), TestFixtures.getUnityInfo(platform, core), request);
            return configManager.getConfig().then(() => {
                const url = requestSpy.getCall(0).args[0];
                const verifier = new SpecVerifier(Platform.ANDROID, ParamsTestData.getConfigRequestParams(), url);
                verifier.assert();
            });
        });
        it('on iOS', () => {
            const platform = Platform.IOS;
            const backend = TestFixtures.getBackend(platform);
            const nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            const core = TestFixtures.getCoreApi(nativeBridge);
            const metaDataManager = new MetaDataManager(core);
            const request = new RequestManager(platform, core, new WakeUpManager(core));
            const response = TestFixtures.getOkNativeResponse();
            response.response = JSON.stringify(ConfigurationAuctionPlc);
            const requestSpy = sinon.stub(request, 'get').returns(Promise.resolve(response));
            const configManager = new ConfigManager(platform, core, metaDataManager, TestFixtures.getClientInfo(platform), TestFixtures.getIosDeviceInfo(core), TestFixtures.getUnityInfo(platform, core), request);
            return configManager.getConfig().then(() => {
                const url = requestSpy.getCall(0).args[0];
                const verifier = new SpecVerifier(Platform.IOS, ParamsTestData.getConfigRequestParams(), url);
                verifier.assert();
            });
        });
    });
    describe('with ad request', () => {
        let coreConfig;
        let adsConfig;
        let sandbox;
        beforeEach(() => {
            sandbox = sinon.createSandbox();
            coreConfig = TestFixtures.getCoreConfiguration();
            adsConfig = TestFixtures.getAdsConfiguration();
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
            const core = coreModule.Api;
            const privacySDK = TestFixtures.getPrivacySDK(core);
            const ads = TestFixtures.getAdsApi(nativeBridge);
            const storageBridge = new StorageBridge(core);
            const metaDataManager = new MetaDataManager(core);
            const request = new RequestManager(platform, core, new WakeUpManager(core));
            const requestSpy = sandbox.stub(request, 'post').returns(Promise.resolve(TestFixtures.getOkNativeResponse()));
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
            sandbox.stub(RequestPrivacyFactory, 'create').returns({});
            sessionManager.setGameSessionId(1234);
            const campaignManager = new LegacyCampaignManager(platform, coreModule, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, campaignParserManager, privacySDK, privacyManager);
            return campaignManager.request().then(() => {
                const url = requestSpy.getCall(0).args[0];
                const body = requestSpy.getCall(0).args[1];
                const verifier = new SpecVerifier(Platform.ANDROID, ParamsTestData.getAdRequestParams(), url, body);
                verifier.assert();
            });
        });
        it('on iOS', () => {
            const platform = Platform.IOS;
            const backend = TestFixtures.getBackend(platform);
            const nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            const coreModule = TestFixtures.getCoreModule(nativeBridge);
            const core = coreModule.Api;
            const privacySDK = TestFixtures.getPrivacySDK(core);
            const ads = TestFixtures.getAdsApi(nativeBridge);
            const storageBridge = new StorageBridge(core);
            const metaDataManager = new MetaDataManager(core);
            const request = new RequestManager(platform, core, new WakeUpManager(core));
            const requestSpy = sandbox.stub(request, 'post').returns(Promise.resolve(TestFixtures.getOkNativeResponse()));
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
            const campaignManager = new LegacyCampaignManager(platform, coreModule, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, campaignParserManager, privacySDK, privacyManager);
            return campaignManager.request().then(() => {
                const url = requestSpy.getCall(0).args[0];
                const body = requestSpy.getCall(0).args[1];
                const verifier = new SpecVerifier(Platform.IOS, ParamsTestData.getAdRequestParams(), url, body);
                verifier.assert();
            });
        });
    });
    describe('with ad request using load v5 support', () => {
        let coreConfig;
        let adsConfig;
        let sandbox;
        beforeEach(() => {
            sandbox = sinon.createSandbox();
            coreConfig = TestFixtures.getCoreConfiguration();
            adsConfig = TestFixtures.getAdsConfiguration();
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
            const core = coreModule.Api;
            const privacySDK = TestFixtures.getPrivacySDK(core);
            const ads = TestFixtures.getAdsApi(nativeBridge);
            const storageBridge = new StorageBridge(core);
            const metaDataManager = new MetaDataManager(core);
            const request = new RequestManager(platform, core, new WakeUpManager(core));
            const requestSpy = sandbox.stub(request, 'post').returns(Promise.resolve(TestFixtures.getOkNativeResponse()));
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
            sandbox.stub(RequestPrivacyFactory, 'create').returns({});
            sessionManager.setGameSessionId(1234);
            const campaignManager = new LegacyCampaignManager(platform, coreModule, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, campaignParserManager, privacySDK, privacyManager, undefined, true);
            return campaignManager.request().then(() => {
                const url = requestSpy.getCall(0).args[0];
                const body = requestSpy.getCall(0).args[1];
                const verifier = new SpecVerifier(Platform.ANDROID, ParamsTestData.getAdRequestParams(), url, body);
                verifier.assert();
            });
        });
        it('on iOS', () => {
            const platform = Platform.IOS;
            const backend = TestFixtures.getBackend(platform);
            const nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            const coreModule = TestFixtures.getCoreModule(nativeBridge);
            const core = coreModule.Api;
            const privacySDK = TestFixtures.getPrivacySDK(core);
            const ads = TestFixtures.getAdsApi(nativeBridge);
            const storageBridge = new StorageBridge(core);
            const metaDataManager = new MetaDataManager(core);
            const request = new RequestManager(platform, core, new WakeUpManager(core));
            const requestSpy = sandbox.stub(request, 'post').returns(Promise.resolve(TestFixtures.getOkNativeResponse()));
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
            const campaignManager = new LegacyCampaignManager(platform, coreModule, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, campaignParserManager, privacySDK, privacyManager, undefined, true);
            return campaignManager.request().then(() => {
                const url = requestSpy.getCall(0).args[0];
                const body = requestSpy.getCall(0).args[1];
                const verifier = new SpecVerifier(Platform.IOS, ParamsTestData.getAdRequestParams(), url, body);
                verifier.assert();
            });
        });
    });
    [Platform.ANDROID, Platform.IOS].forEach(platform => {
        describe(`with ad request using AuctionRequest on ${Platform[platform]}`, () => {
            let coreConfig;
            let adsConfig;
            let backend;
            let nativeBridge;
            let core;
            let ads;
            let storageBridge;
            let metaDataManager;
            let requestManager;
            let clientInfo;
            let deviceInfo;
            let sessionManager;
            let focusManager;
            let adMobSignalFactory;
            let auctionRequestParams;
            let auctionRequest;
            let privacySDK;
            let userPrivacyManager;
            let coreApi;
            let requestStub;
            let sandbox;
            beforeEach(() => {
                sandbox = sinon.createSandbox();
                coreConfig = TestFixtures.getCoreConfiguration();
                adsConfig = TestFixtures.getAdsConfiguration();
                backend = TestFixtures.getBackend(platform);
                nativeBridge = TestFixtures.getNativeBridge(platform, backend);
                core = TestFixtures.getCoreModule(nativeBridge);
                coreApi = core.Api;
                privacySDK = TestFixtures.getPrivacySDK(coreApi);
                ads = TestFixtures.getAdsApi(nativeBridge);
                storageBridge = new StorageBridge(core.Api);
                metaDataManager = new MetaDataManager(core.Api);
                requestManager = new RequestManager(platform, core.Api, new WakeUpManager(core.Api));
                requestStub = sandbox.stub(requestManager, 'post').returns(Promise.resolve(TestFixtures.getOkNativeResponse()));
                clientInfo = TestFixtures.getClientInfo(platform);
                sessionManager = new SessionManager(core.Api, requestManager, storageBridge);
                focusManager = new FocusManager(platform, core.Api);
                userPrivacyManager = new UserPrivacyManager(platform, coreApi, coreConfig, adsConfig, clientInfo, deviceInfo, requestManager, privacySDK);
                if (platform === Platform.ANDROID) {
                    deviceInfo = TestFixtures.getAndroidDeviceInfo(core.Api);
                }
                else {
                    deviceInfo = TestFixtures.getIosDeviceInfo(core.Api);
                }
                adMobSignalFactory = new AdMobSignalFactory(platform, core.Api, ads, clientInfo, deviceInfo, focusManager);
                sandbox.stub(adMobSignalFactory, 'getOptionalSignal').returns(Promise.resolve(new AdMobOptionalSignal()));
                sandbox.stub(core.Api.DeviceInfo, 'getUniqueEventId').returns(Promise.resolve('abdce-12345'));
                sandbox.stub(sessionManager, 'startNewSession').returns(Promise.resolve(new Session('abdce-12345')));
                sessionManager.setGameSessionId(1234);
                auctionRequestParams = {
                    platform: platform,
                    core: core.Api,
                    coreConfig: coreConfig,
                    adsConfig: adsConfig,
                    adMobSignalFactory: adMobSignalFactory,
                    metaDataManager: metaDataManager,
                    request: requestManager,
                    clientInfo: clientInfo,
                    deviceInfo: deviceInfo,
                    sessionManager: sessionManager,
                    privacySDK: privacySDK,
                    userPrivacyManager: userPrivacyManager
                };
                auctionRequest = new AuctionRequest(auctionRequestParams);
            });
            afterEach(() => {
                sandbox.restore();
            });
            it('should have the correct parameters', () => {
                return auctionRequest.request().then(() => {
                    const url = requestStub.getCall(0).args[0];
                    const body = requestStub.getCall(0).args[1];
                    const verifier = new SpecVerifier(platform, ParamsTestData.getAdRequestParams(), url, body);
                    verifier.assert();
                });
            });
        });
    });
    describe('with click event', () => {
        it('on Android', () => {
            const platform = Platform.ANDROID;
            const coreConfig = TestFixtures.getCoreConfiguration();
            const adsConfig = TestFixtures.getAdsConfiguration();
            const backend = TestFixtures.getBackend(platform);
            const nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            const core = TestFixtures.getCoreApi(nativeBridge);
            const coreModule = TestFixtures.getCoreModule(nativeBridge);
            const privacySDK = TestFixtures.getPrivacySDK(core);
            const ads = TestFixtures.getAdsApi(nativeBridge);
            const storageBridge = new StorageBridge(core);
            const metaDataManager = new MetaDataManager(core);
            const request = new RequestManager(platform, core, new WakeUpManager(core));
            const requestSpy = sinon.stub(request, 'post').returns(Promise.resolve(TestFixtures.getOkNativeResponse()));
            const clientInfo = TestFixtures.getClientInfo(platform);
            const deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
            const sessionManager = new SessionManager(core, request, storageBridge);
            const campaign = TestFixtures.getCampaign();
            const userPrivacyManager = new UserPrivacyManager(platform, core, coreConfig, adsConfig, clientInfo, deviceInfo, request, privacySDK);
            sessionManager.setGameSessionId(1234);
            const operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager({
                platform: platform,
                core: core,
                ads: ads,
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
                userPrivacyManager: userPrivacyManager
            });
            OperativeEventManager.setPreviousPlacementId(undefined);
            campaign.getSession().setGameSessionCounters(TestFixtures.getGameSessionCounters());
            const operativeEventParams = {
                placement: TestFixtures.getPlacement(),
                videoOrientation: 'landscape',
                adUnitStyle: campaign.getAdUnitStyle(),
                asset: campaign.getVideo()
            };
            return operativeEventManager.sendClick(operativeEventParams).then(() => {
                const url = requestSpy.getCall(0).args[0];
                const body = requestSpy.getCall(0).args[1];
                const verifier = new SpecVerifier(Platform.ANDROID, ParamsTestData.getClickEventParams(), url, body);
                verifier.assert();
            });
        });
        it('on iOS', () => {
            const platform = Platform.IOS;
            const coreConfig = TestFixtures.getCoreConfiguration();
            const adsConfig = TestFixtures.getAdsConfiguration();
            const backend = TestFixtures.getBackend(platform);
            const nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            const core = TestFixtures.getCoreApi(nativeBridge);
            const coreModule = TestFixtures.getCoreModule(nativeBridge);
            const privacySDK = TestFixtures.getPrivacySDK(core);
            const ads = TestFixtures.getAdsApi(nativeBridge);
            const storageBridge = new StorageBridge(core);
            const metaDataManager = new MetaDataManager(core);
            const request = new RequestManager(platform, core, new WakeUpManager(core));
            const requestSpy = sinon.stub(request, 'post').returns(Promise.resolve(TestFixtures.getOkNativeResponse()));
            const clientInfo = TestFixtures.getClientInfo(platform);
            const deviceInfo = TestFixtures.getIosDeviceInfo(core);
            const sessionManager = new SessionManager(core, request, storageBridge);
            const userPrivacyManager = new UserPrivacyManager(platform, core, coreConfig, adsConfig, clientInfo, deviceInfo, request, privacySDK);
            sessionManager.setGameSessionId(1234);
            const campaign = TestFixtures.getCampaign();
            const operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager({
                platform: platform,
                core: core,
                ads: ads,
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
                userPrivacyManager: userPrivacyManager
            });
            OperativeEventManager.setPreviousPlacementId(undefined);
            campaign.getSession().setGameSessionCounters(TestFixtures.getGameSessionCounters());
            const operativeEventParams = {
                placement: TestFixtures.getPlacement(),
                videoOrientation: 'landscape',
                adUnitStyle: campaign.getAdUnitStyle(),
                asset: campaign.getVideo()
            };
            return operativeEventManager.sendClick(operativeEventParams).then(() => {
                const url = requestSpy.getCall(0).args[0];
                const body = requestSpy.getCall(0).args[1];
                const verifier = new SpecVerifier(Platform.IOS, ParamsTestData.getClickEventParams(), url, body);
                verifier.assert();
            });
        });
    });
    describe('with video events', () => {
        let operativeEventManager;
        let operativeEventParams;
        let requestSpy;
        describe('on Android', () => {
            beforeEach(() => {
                const platform = Platform.ANDROID;
                const coreConfig = TestFixtures.getCoreConfiguration();
                const adsConfig = TestFixtures.getAdsConfiguration();
                const backend = TestFixtures.getBackend(platform);
                const nativeBridge = TestFixtures.getNativeBridge(platform, backend);
                const core = TestFixtures.getCoreApi(nativeBridge);
                const coreModule = TestFixtures.getCoreModule(nativeBridge);
                const privacySDK = TestFixtures.getPrivacySDK(core);
                const ads = TestFixtures.getAdsApi(nativeBridge);
                const storageBridge = new StorageBridge(core);
                const metaDataManager = new MetaDataManager(core);
                const request = new RequestManager(platform, core, new WakeUpManager(core));
                requestSpy = sinon.stub(request, 'post').returns(Promise.resolve(TestFixtures.getOkNativeResponse()));
                const clientInfo = TestFixtures.getClientInfo(platform);
                const deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
                const userPrivacyManager = new UserPrivacyManager(platform, core, coreConfig, adsConfig, clientInfo, deviceInfo, request, privacySDK);
                const sessionManager = new SessionManager(core, request, storageBridge);
                sessionManager.setGameSessionId(1234);
                const campaign = TestFixtures.getCampaign();
                operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager({
                    platform: platform,
                    core: core,
                    ads: ads,
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
                    userPrivacyManager: userPrivacyManager
                });
                OperativeEventManager.setPreviousPlacementId(undefined);
                campaign.getSession().setGameSessionCounters(TestFixtures.getGameSessionCounters());
                operativeEventParams = {
                    placement: TestFixtures.getPlacement(),
                    adUnitStyle: campaign.getAdUnitStyle(),
                    videoOrientation: 'landscape',
                    asset: campaign.getVideo()
                };
            });
            it('with start event', () => {
                return operativeEventManager.sendStart(operativeEventParams).then(() => {
                    const url = requestSpy.getCall(0).args[0];
                    const body = requestSpy.getCall(0).args[1];
                    const verifier = new SpecVerifier(Platform.ANDROID, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });
            it('with first quartile event', () => {
                return operativeEventManager.sendFirstQuartile(operativeEventParams).then(() => {
                    const url = requestSpy.getCall(0).args[0];
                    const body = requestSpy.getCall(0).args[1];
                    const verifier = new SpecVerifier(Platform.ANDROID, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });
            it('with midpoint event', () => {
                return operativeEventManager.sendMidpoint(operativeEventParams).then(() => {
                    const url = requestSpy.getCall(0).args[0];
                    const body = requestSpy.getCall(0).args[1];
                    const verifier = new SpecVerifier(Platform.ANDROID, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });
            it('with third quartile event', () => {
                return operativeEventManager.sendThirdQuartile(operativeEventParams).then(() => {
                    const url = requestSpy.getCall(0).args[0];
                    const body = requestSpy.getCall(0).args[1];
                    const verifier = new SpecVerifier(Platform.ANDROID, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });
            it('with end event', () => {
                return operativeEventManager.sendView(operativeEventParams).then(() => {
                    const url = requestSpy.getCall(0).args[0];
                    const body = requestSpy.getCall(0).args[1];
                    const verifier = new SpecVerifier(Platform.ANDROID, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });
        });
        describe('on iOS', () => {
            beforeEach(() => {
                const platform = Platform.IOS;
                const coreConfig = TestFixtures.getCoreConfiguration();
                const adsConfig = TestFixtures.getAdsConfiguration();
                const backend = TestFixtures.getBackend(platform);
                const nativeBridge = TestFixtures.getNativeBridge(platform, backend);
                const core = TestFixtures.getCoreApi(nativeBridge);
                const coreModule = TestFixtures.getCoreModule(nativeBridge);
                const privacySDK = TestFixtures.getPrivacySDK(core);
                const ads = TestFixtures.getAdsApi(nativeBridge);
                const storageBridge = new StorageBridge(core);
                const metaDataManager = new MetaDataManager(core);
                const request = new RequestManager(platform, core, new WakeUpManager(core));
                requestSpy = sinon.stub(request, 'post').returns(Promise.resolve(TestFixtures.getOkNativeResponse()));
                const clientInfo = TestFixtures.getClientInfo(platform);
                const deviceInfo = TestFixtures.getIosDeviceInfo(core);
                const userPrivacyManager = new UserPrivacyManager(platform, core, coreConfig, adsConfig, clientInfo, deviceInfo, request, privacySDK);
                const sessionManager = new SessionManager(core, request, storageBridge);
                sessionManager.setGameSessionId(1234);
                const campaign = TestFixtures.getCampaign();
                operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager({
                    platform: platform,
                    core: core,
                    ads: ads,
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
                    userPrivacyManager: userPrivacyManager
                });
                OperativeEventManager.setPreviousPlacementId(undefined);
                campaign.getSession().setGameSessionCounters(TestFixtures.getGameSessionCounters());
            });
            it('with start event', () => {
                return operativeEventManager.sendStart(operativeEventParams).then(() => {
                    const url = requestSpy.getCall(0).args[0];
                    const body = requestSpy.getCall(0).args[1];
                    const verifier = new SpecVerifier(Platform.IOS, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });
            it('with first quartile event', () => {
                return operativeEventManager.sendFirstQuartile(operativeEventParams).then(() => {
                    const url = requestSpy.getCall(0).args[0];
                    const body = requestSpy.getCall(0).args[1];
                    const verifier = new SpecVerifier(Platform.IOS, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });
            it('with midpoint event', () => {
                return operativeEventManager.sendMidpoint(operativeEventParams).then(() => {
                    const url = requestSpy.getCall(0).args[0];
                    const body = requestSpy.getCall(0).args[1];
                    const verifier = new SpecVerifier(Platform.IOS, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });
            it('with third quartile event', () => {
                return operativeEventManager.sendThirdQuartile(operativeEventParams).then(() => {
                    const url = requestSpy.getCall(0).args[0];
                    const body = requestSpy.getCall(0).args[1];
                    const verifier = new SpecVerifier(Platform.IOS, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });
            it('with end event', () => {
                return operativeEventManager.sendView(operativeEventParams).then(() => {
                    const url = requestSpy.getCall(0).args[0];
                    const body = requestSpy.getCall(0).args[1];
                    const verifier = new SpecVerifier(Platform.IOS, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGFyYW1zVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Rlc3QvRnVuY3Rpb25hbC9QYXJhbXMvUGFyYW1zVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUN2RSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUN4RSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDekQsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFDM0UsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFDbkYsT0FBTyxFQUF5QixxQkFBcUIsRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBQ2xHLE9BQU8sRUFBRSw0QkFBNEIsRUFBRSxNQUFNLDJDQUEyQyxDQUFDO0FBQ3pGLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUU3RCxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDN0MsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUM5QixPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDbkQsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFDaEYsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQzFELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUM1RCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDMUQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQ2hFLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUM5RCxPQUFPLEVBQUUsYUFB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