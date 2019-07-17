import { AdMobOptionalSignal } from 'AdMob/Models/AdMobOptionalSignal';
import { AdMobSignalFactory } from 'AdMob/Utilities/AdMobSignalFactory';
import { AssetManager } from 'Ads/Managers/AssetManager';
import { CampaignManager } from 'Ads/Managers/CampaignManager';
import { ContentTypeHandlerManager } from 'Ads/Managers/ContentTypeHandlerManager';
import { IOperativeEventParams, OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { Session } from 'Ads/Models/Session';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { CacheBookkeepingManager } from 'Core/Managers/CacheBookkeepingManager';
import { CacheManager } from 'Core/Managers/CacheManager';
import { ConfigManager } from 'Core/Managers/ConfigManager';
import { FocusManager } from 'Core/Managers/FocusManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { RequestManager } from 'Core/Managers/RequestManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { CacheMode, CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import { IEventSpec, ParamsTestData } from 'Functional/Params/ParamsTestData';

import ConfigurationAuctionPlc from 'json/ConfigurationAuctionPlc.json';

import 'mocha';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { AuctionRequest, IAuctionRequestParams } from 'Ads/Networking/AuctionRequest';
import { RequestPrivacyFactory, IRequestPrivacy } from 'Ads/Models/RequestPrivacy';
import { Backend } from 'Backend/Backend';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { ICore } from 'Core/ICore';
import { IAdsApi } from 'Ads/IAds';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { ClientInfo } from 'Core/Models/ClientInfo';

class SpecVerifier {
    private _platform: Platform;
    private _spec: IEventSpec;
    private _queryParams: string[];
    private _bodyParams: any;

    constructor(platform: Platform, spec: IEventSpec, url: string, body?: string) {
        this._platform = platform;
        this._spec = spec;
        const parsedUrl: string[] = url.split('?');
        if (parsedUrl.length > 1) {
            this._queryParams = parsedUrl[1].split('&');
        }
        if (body) {
            this._bodyParams = JSON.parse(body);
        }
    }

    public assert(): void {
        this.assertUnspecifiedParams();
        this.assertRequiredParams();
    }

    private assertUnspecifiedParams(): void {
        if (this._queryParams) {
            for (const queryParam of this._queryParams) {
                const paramName: string = queryParam.split('=')[0];
                const paramValue: any = queryParam.split('=')[1];

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

    private assertRequiredParams(): void {
        for (const param in this._spec) {
            if (this._spec.hasOwnProperty(param)) {
                if (this.isRequired(this._spec[param].required)) {
                    if (this._spec[param].queryString) {
                        let found: boolean = false;

                        for (const queryParam of this._queryParams) {
                            const paramName: string = queryParam.split('=')[0];
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

    private assertQueryParamType(name: string, value: string): void {
        if (this._spec[name].type === 'boolean') {
            assert.match(value, /(true|false)/i, 'Query parameter type mismatch: ' + name);
        } else if (this._spec[name].type === 'number') {
            assert.match(value, /[0-9]+/, 'Query parameter type mismatch: ' + name);
        } else if (this._spec[name].type === 'string') {
            // due to lack of better alternatives check that string has legal URL characters
            assert.match(value, /^([\!\#\$\&-\;\=\?-\[\]_a-z\~]|%[0-9a-fA-F]{2})+$/i, 'Query parameter type mismatch: ' + name);
        } else {
            assert.fail('Query parameter ' + name + ' with unknown type: ' + this._spec[name].type);
        }
    }

    private assertBodyParamType(name: string, value: any): void {
        assert.equal(this._spec[name].type, typeof value, 'Body parameter type mismatch: ' + name);
    }

    private isRequired(required: string): boolean {
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
            const metaDataManager = new MetaDataManager(core);
            const request = new RequestManager(platform, core, new WakeUpManager(core));
            const response = TestFixtures.getOkNativeResponse();
            response.response = ConfigurationAuctionPlc;
            const requestSpy = sinon.stub(request, 'get').returns(Promise.resolve(response));
            const configManager = new ConfigManager(platform, core, metaDataManager, TestFixtures.getClientInfo(platform), TestFixtures.getAndroidDeviceInfo(core), TestFixtures.getUnityInfo(platform, core), request);
            return configManager.getConfig().then(() => {
                const url: string = requestSpy.getCall(0).args[0];
                const verifier: SpecVerifier = new SpecVerifier(Platform.ANDROID, ParamsTestData.getConfigRequestParams(), url);
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
            response.response = ConfigurationAuctionPlc;
            const requestSpy = sinon.stub(request, 'get').returns(Promise.resolve(response));
            const configManager = new ConfigManager(platform, core, metaDataManager, TestFixtures.getClientInfo(platform), TestFixtures.getIosDeviceInfo(core), TestFixtures.getUnityInfo(platform, core), request);
            return configManager.getConfig().then(() => {
                const url: string = requestSpy.getCall(0).args[0];

                const verifier: SpecVerifier = new SpecVerifier(Platform.IOS, ParamsTestData.getConfigRequestParams(), url);
                verifier.assert();
            });
        });
    });

    describe('with ad request', () => {
        let coreConfig: CoreConfiguration;
        let adsConfig: AdsConfiguration;

        beforeEach(() => {
            coreConfig = TestFixtures.getCoreConfiguration();
            adsConfig = TestFixtures.getAdsConfiguration();
        });

        it('on Android', () => {
            const sandbox = sinon.createSandbox();
            const platform = Platform.ANDROID;
            const backend = TestFixtures.getBackend(platform);
            const nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            const coreModule = TestFixtures.getCoreModule(nativeBridge);
            const core = coreModule.Api;
            const ads = TestFixtures.getAdsApi(nativeBridge);
            const storageBridge = new StorageBridge(core);
            const metaDataManager = new MetaDataManager(core);
            const request = new RequestManager(platform, core, new WakeUpManager(core));
            const requestSpy: any = sandbox.stub(request, 'post').returns(Promise.resolve(TestFixtures.getOkNativeResponse()));
            const clientInfo = TestFixtures.getClientInfo(platform);
            const deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
            const cacheBookkeeping = new CacheBookkeepingManager(core);
            const programmaticTrackingService: ProgrammaticTrackingService = sandbox.createStubInstance(ProgrammaticTrackingService);
            const wakeUpManager = new WakeUpManager(core);
            const assetManager = new AssetManager(platform, core, new CacheManager(core, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping, programmaticTrackingService);
            const sessionManager = new SessionManager(core, request, storageBridge);
            const focusManager = new FocusManager(platform, core);
            const adMobSignalFactory = new AdMobSignalFactory(platform, core, ads, clientInfo, deviceInfo, focusManager);
            const campaignParserManager = new ContentTypeHandlerManager();
            sandbox.stub(adMobSignalFactory, 'getOptionalSignal').returns(Promise.resolve(new AdMobOptionalSignal()));
            sandbox.stub(core.DeviceInfo, 'getUniqueEventId').returns(Promise.resolve('abdce-12345'));
            sandbox.stub(sessionManager, 'startNewSession').returns(Promise.resolve(new Session('abdce-12345')));
            sandbox.stub(RequestPrivacyFactory, 'create').returns(<IRequestPrivacy>{});
            sessionManager.setGameSessionId(1234);
            const campaignManager: CampaignManager = new CampaignManager(platform, coreModule, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, campaignParserManager);
            return campaignManager.request().then(() => {
                const url: string = requestSpy.getCall(0).args[0];
                const body: string = requestSpy.getCall(0).args[1];

                const verifier: SpecVerifier = new SpecVerifier(Platform.ANDROID, ParamsTestData.getAdRequestParams(), url, body);
                verifier.assert();
            });
       });

        it('on iOS', () => {
            const sandbox = sinon.createSandbox();
            const platform = Platform.IOS;
            const backend = TestFixtures.getBackend(platform);
            const nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            const coreModule = TestFixtures.getCoreModule(nativeBridge);
            const core = coreModule.Api;
            const ads = TestFixtures.getAdsApi(nativeBridge);
            const storageBridge = new StorageBridge(core);
            const metaDataManager = new MetaDataManager(core);
            const request = new RequestManager(platform, core, new WakeUpManager(core));
            const requestSpy: any = sandbox.stub(request, 'post').returns(Promise.resolve(TestFixtures.getOkNativeResponse()));
            const clientInfo = TestFixtures.getClientInfo(platform);
            const deviceInfo = TestFixtures.getIosDeviceInfo(core);
            const cacheBookkeeping = new CacheBookkeepingManager(core);
            const programmaticTrackingService: ProgrammaticTrackingService = sandbox.createStubInstance(ProgrammaticTrackingService);
            const wakeUpManager = new WakeUpManager(core);
            const assetManager = new AssetManager(platform, core, new CacheManager(core, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping, programmaticTrackingService);
            const sessionManager = new SessionManager(core, request, storageBridge);
            const focusManager = new FocusManager(platform, core);
            const adMobSignalFactory = new AdMobSignalFactory(platform, core, ads, clientInfo, deviceInfo, focusManager);
            const campaignParserManager = new ContentTypeHandlerManager();
            sandbox.stub(adMobSignalFactory, 'getOptionalSignal').returns(Promise.resolve(new AdMobOptionalSignal()));
            sandbox.stub(core.DeviceInfo, 'getUniqueEventId').returns(Promise.resolve('abdce-12345'));
            sandbox.stub(sessionManager, 'startNewSession').returns(Promise.resolve(new Session('abdce-12345')));
            sessionManager.setGameSessionId(1234);
            const campaignManager: CampaignManager = new CampaignManager(platform, coreModule, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, campaignParserManager);
            return campaignManager.request().then(() => {
                const url: string = requestSpy.getCall(0).args[0];
                const body: string = requestSpy.getCall(0).args[1];

                const verifier: SpecVerifier = new SpecVerifier(Platform.IOS, ParamsTestData.getAdRequestParams(), url, body);
                verifier.assert();
            });
        });
    });

    describe('with ad request using AuctionRequest', () => {
        let coreConfig: CoreConfiguration;
        let adsConfig: AdsConfiguration;
        let backend: Backend;
        let nativeBridge: NativeBridge;
        let core: ICore;
        let ads: IAdsApi;
        let storageBridge: StorageBridge;
        let metaDataManager: MetaDataManager;
        let requestManager: RequestManager;
        let clientInfo: ClientInfo;
        let deviceInfo: DeviceInfo;
        let sessionManager: SessionManager;
        let focusManager: FocusManager;
        let adMobSignalFactory: AdMobSignalFactory;
        let auctionRequestParams: IAuctionRequestParams;
        let auctionRequest: AuctionRequest;

        let requestStub: sinon.SinonStub;
        const sandbox = sinon.createSandbox();

        afterEach(() => {
            sandbox.restore();
        });

        [Platform.ANDROID, Platform.IOS].forEach(platform => {
            it(`on ${Platform[platform]}`, () => {
                coreConfig = TestFixtures.getCoreConfiguration();
                adsConfig = TestFixtures.getAdsConfiguration();
                backend = TestFixtures.getBackend(platform);
                nativeBridge = TestFixtures.getNativeBridge(platform, backend);
                core = TestFixtures.getCoreModule(nativeBridge);
                ads = TestFixtures.getAdsApi(nativeBridge);
                storageBridge = new StorageBridge(core.Api);
                metaDataManager = new MetaDataManager(core.Api);
                requestManager = new RequestManager(platform, core.Api, new WakeUpManager(core.Api));
                requestStub = sandbox.stub(requestManager, 'post').returns(Promise.resolve(TestFixtures.getOkNativeResponse()));
                clientInfo = TestFixtures.getClientInfo(platform);
                sessionManager = new SessionManager(core.Api, requestManager, storageBridge);
                focusManager = new FocusManager(platform, core.Api);

                if (platform === Platform.ANDROID) {
                    deviceInfo = TestFixtures.getAndroidDeviceInfo(core.Api);
                } else {
                    deviceInfo = TestFixtures.getIosDeviceInfo(core.Api);
                }

                adMobSignalFactory = new AdMobSignalFactory(platform, core.Api, ads, clientInfo, deviceInfo, focusManager);
                sessionManager.setGameSessionId(1234);

                sandbox.stub(adMobSignalFactory, 'getOptionalSignal').returns(Promise.resolve(new AdMobOptionalSignal()));
                sandbox.stub(core.Api.DeviceInfo, 'getUniqueEventId').returns(Promise.resolve('abdce-12345'));
                sandbox.stub(sessionManager, 'startNewSession').returns(Promise.resolve(new Session('abdce-12345')));

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
                    programmaticTrackingService: core.ProgrammaticTrackingService
                };
                auctionRequest = new AuctionRequest(auctionRequestParams);
                return auctionRequest.request().then(() => {
                    const url: string = requestStub.getCall(0).args[0];
                    const body: string = requestStub.getCall(0).args[1];
                    const verifier: SpecVerifier = new SpecVerifier(platform, ParamsTestData.getAdRequestParams(), url, body);
                    verifier.assert();
                });
            });
        });
    });

    describe('with click event', () => {
        it('on Android', () => {
            const platform = Platform.ANDROID;
            const backend = TestFixtures.getBackend(platform);
            const nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            const core = TestFixtures.getCoreApi(nativeBridge);
            const ads = TestFixtures.getAdsApi(nativeBridge);
            const storageBridge = new StorageBridge(core);
            const metaDataManager = new MetaDataManager(core);
            const request = new RequestManager(platform, core, new WakeUpManager(core));
            const requestSpy: any = sinon.stub(request, 'post').returns(Promise.resolve(TestFixtures.getOkNativeResponse()));
            const clientInfo = TestFixtures.getClientInfo(platform);
            const deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
            const sessionManager = new SessionManager(core, request, storageBridge);
            const campaign: PerformanceCampaign = TestFixtures.getCampaign();
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
                coreConfig: TestFixtures.getCoreConfiguration(),
                adsConfig: TestFixtures.getAdsConfiguration(),
                storageBridge: storageBridge,
                campaign: campaign,
                playerMetadataServerId: 'test-gamerSid'
            });
            OperativeEventManager.setPreviousPlacementId(undefined);
            campaign.getSession().setGameSessionCounters(TestFixtures.getGameSessionCounters());

            const operativeEventParams: IOperativeEventParams = {
                placement: TestFixtures.getPlacement(),
                videoOrientation: 'landscape',
                adUnitStyle: campaign.getAdUnitStyle(),
                asset: campaign.getVideo()
            };
            return operativeEventManager.sendClick(operativeEventParams).then(() => {
                const url: string = requestSpy.getCall(0).args[0];
                const body: string = requestSpy.getCall(0).args[1];

                const verifier: SpecVerifier = new SpecVerifier(Platform.ANDROID, ParamsTestData.getClickEventParams(), url, body);
                verifier.assert();
            });
        });

        it('on iOS', () => {
            const platform = Platform.IOS;
            const backend = TestFixtures.getBackend(platform);
            const nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            const core = TestFixtures.getCoreApi(nativeBridge);
            const ads = TestFixtures.getAdsApi(nativeBridge);
            const storageBridge = new StorageBridge(core);
            const metaDataManager = new MetaDataManager(core);
            const request = new RequestManager(platform, core, new WakeUpManager(core));
            const requestSpy: any = sinon.stub(request, 'post').returns(Promise.resolve(TestFixtures.getOkNativeResponse()));
            const clientInfo = TestFixtures.getClientInfo(platform);
            const deviceInfo = TestFixtures.getIosDeviceInfo(core);
            const sessionManager = new SessionManager(core, request, storageBridge);
            sessionManager.setGameSessionId(1234);
            const campaign: PerformanceCampaign = TestFixtures.getCampaign();
            const operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager({
                platform: platform,
                core: core,
                ads: ads,
                request: request,
                metaDataManager: metaDataManager,
                sessionManager: sessionManager,
                clientInfo: clientInfo,
                deviceInfo: deviceInfo,
                coreConfig: TestFixtures.getCoreConfiguration(),
                adsConfig: TestFixtures.getAdsConfiguration(),
                storageBridge: storageBridge,
                campaign: campaign,
                playerMetadataServerId: 'test-gamerSid'
            });
            OperativeEventManager.setPreviousPlacementId(undefined);
            campaign.getSession().setGameSessionCounters(TestFixtures.getGameSessionCounters());

            const operativeEventParams: IOperativeEventParams = {
                placement: TestFixtures.getPlacement(),
                videoOrientation: 'landscape',
                adUnitStyle: campaign.getAdUnitStyle(),
                asset: campaign.getVideo()
            };
            return operativeEventManager.sendClick(operativeEventParams).then(() => {
                const url: string = requestSpy.getCall(0).args[0];
                const body: string = requestSpy.getCall(0).args[1];

                const verifier: SpecVerifier = new SpecVerifier(Platform.IOS, ParamsTestData.getClickEventParams(), url, body);
                verifier.assert();
            });
        });
    });

    describe('with video events', () => {
        let operativeEventManager: OperativeEventManager;
        let operativeEventParams: IOperativeEventParams;
        let requestSpy: any;

        describe('on Android', () => {
            beforeEach(() => {
                const platform = Platform.ANDROID;
                const backend = TestFixtures.getBackend(platform);
                const nativeBridge = TestFixtures.getNativeBridge(platform, backend);
                const core = TestFixtures.getCoreApi(nativeBridge);
                const ads = TestFixtures.getAdsApi(nativeBridge);
                const storageBridge = new StorageBridge(core);
                const metaDataManager = new MetaDataManager(core);
                const request = new RequestManager(platform, core, new WakeUpManager(core));
                requestSpy = sinon.stub(request, 'post').returns(Promise.resolve(TestFixtures.getOkNativeResponse()));
                const clientInfo = TestFixtures.getClientInfo(platform);
                const deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
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
                    coreConfig: TestFixtures.getCoreConfiguration(),
                    adsConfig: TestFixtures.getAdsConfiguration(),
                    storageBridge: storageBridge,
                    campaign: campaign,
                    playerMetadataServerId: 'test-gamerSid'
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
                    const url: string = requestSpy.getCall(0).args[0];
                    const body: string = requestSpy.getCall(0).args[1];

                    const verifier: SpecVerifier = new SpecVerifier(Platform.ANDROID, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });

            it('with first quartile event', () => {
                return operativeEventManager.sendFirstQuartile(operativeEventParams).then(() => {
                    const url: string = requestSpy.getCall(0).args[0];
                    const body: string = requestSpy.getCall(0).args[1];

                    const verifier: SpecVerifier = new SpecVerifier(Platform.ANDROID, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });

            it('with midpoint event', () => {
                return operativeEventManager.sendMidpoint(operativeEventParams).then(() => {
                    const url: string = requestSpy.getCall(0).args[0];
                    const body: string = requestSpy.getCall(0).args[1];

                    const verifier: SpecVerifier = new SpecVerifier(Platform.ANDROID, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });

            it('with third quartile event', () => {
                return operativeEventManager.sendThirdQuartile(operativeEventParams).then(() => {
                    const url: string = requestSpy.getCall(0).args[0];
                    const body: string = requestSpy.getCall(0).args[1];

                    const verifier: SpecVerifier = new SpecVerifier(Platform.ANDROID, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });

            it('with end event', () => {
                return operativeEventManager.sendView(operativeEventParams).then(() => {
                    const url: string = requestSpy.getCall(0).args[0];
                    const body: string = requestSpy.getCall(0).args[1];

                    const verifier: SpecVerifier = new SpecVerifier(Platform.ANDROID, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });
        });

        describe('on iOS', () => {
            beforeEach(() => {
                const platform = Platform.IOS;
                const backend = TestFixtures.getBackend(platform);
                const nativeBridge = TestFixtures.getNativeBridge(platform, backend);
                const core = TestFixtures.getCoreApi(nativeBridge);
                const ads = TestFixtures.getAdsApi(nativeBridge);
                const storageBridge = new StorageBridge(core);
                const metaDataManager = new MetaDataManager(core);
                const request = new RequestManager(platform, core, new WakeUpManager(core));
                requestSpy = sinon.stub(request, 'post').returns(Promise.resolve(TestFixtures.getOkNativeResponse()));
                const clientInfo = TestFixtures.getClientInfo(platform);
                const deviceInfo = TestFixtures.getIosDeviceInfo(core);
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
                    coreConfig: TestFixtures.getCoreConfiguration(),
                    adsConfig: TestFixtures.getAdsConfiguration(),
                    storageBridge: storageBridge,
                    campaign: campaign,
                    playerMetadataServerId: 'test-gamerSid'
                });
                OperativeEventManager.setPreviousPlacementId(undefined);
                campaign.getSession().setGameSessionCounters(TestFixtures.getGameSessionCounters());

            });

            it('with start event', () => {
                return operativeEventManager.sendStart(operativeEventParams).then(() => {
                    const url: string = requestSpy.getCall(0).args[0];
                    const body: string = requestSpy.getCall(0).args[1];

                    const verifier: SpecVerifier = new SpecVerifier(Platform.IOS, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });

            it('with first quartile event', () => {
                return operativeEventManager.sendFirstQuartile(operativeEventParams).then(() => {
                    const url: string = requestSpy.getCall(0).args[0];
                    const body: string = requestSpy.getCall(0).args[1];

                    const verifier: SpecVerifier = new SpecVerifier(Platform.IOS, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });

            it('with midpoint event', () => {
                return operativeEventManager.sendMidpoint(operativeEventParams).then(() => {
                    const url: string = requestSpy.getCall(0).args[0];
                    const body: string = requestSpy.getCall(0).args[1];

                    const verifier: SpecVerifier = new SpecVerifier(Platform.IOS, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });

            it('with third quartile event', () => {
                return operativeEventManager.sendThirdQuartile(operativeEventParams).then(() => {
                    const url: string = requestSpy.getCall(0).args[0];
                    const body: string = requestSpy.getCall(0).args[1];

                    const verifier: SpecVerifier = new SpecVerifier(Platform.IOS, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });

            it('with end event', () => {
                return operativeEventManager.sendView(operativeEventParams).then(() => {
                    const url: string = requestSpy.getCall(0).args[0];
                    const body: string = requestSpy.getCall(0).args[1];

                    const verifier: SpecVerifier = new SpecVerifier(Platform.IOS, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });
        });
    });
});
