import { AdMobOptionalSignal } from 'AdMob/Models/AdMobOptionalSignal';
import { AdMobSignalFactory } from 'AdMob/Utilities/AdMobSignalFactory';
import { AssetManager } from 'Ads/Managers/AssetManager';
import { CampaignManager } from 'Ads/Managers/CampaignManager';
import { IOperativeEventParams, OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { Placement } from 'Ads/Models/Placement';
import { Session } from 'Ads/Models/Session';
import { AndroidAdUnitApi } from 'Ads/Native/Android/AdUnit';
import { IosAdUnitApi } from 'Ads/Native/iOS/AdUnit';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { JaegerManager } from 'Core/Managers/JaegerManager';
import { JaegerSpan } from 'Core/Jaeger/JaegerSpan';
import { ConfigManager } from 'Core/Managers/ConfigManager';
import { FocusManager } from 'Core/Managers/FocusManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CacheMode, CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { AndroidDeviceInfoApi, IPackageInfo } from 'Core/Native/Android/DeviceInfo';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { DeviceInfoApi } from 'Core/Native/DeviceInfo';
import { RequestApi } from 'Core/Native/Request';
import { StorageApi, StorageType } from 'Core/Native/Storage';
import { CacheManager } from 'Core/Managers/CacheManager';
import { CacheBookkeepingManager } from 'Core/Managers/CacheBookkeepingManager';
import { RequestManager } from 'Core/Managers/RequestManager';

import 'mocha';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { IEventSpec, ParamsTestData } from './ParamsTestData';
import { BackupCampaignManager } from 'Ads/Managers/BackupCampaignManager';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import { CampaignParserManager } from '../../../src/ts/Ads/Managers/CampaignParserManager';

import ConfigurationAuctionPlc from 'json/ConfigurationAuctionPlc.json';

class SpecVerifier {
    private _platform: Platform;
    private _spec: IEventSpec;
    private _queryParams: string[];
    private _bodyParams: any;

    constructor(platform: Platform, spec: IEventSpec, url: string, body?: string) {
        this._platform = platform;
        this._spec = spec;
        const parsedUrl: string[] = url.split('?');
        if(parsedUrl.length > 1) {
            this._queryParams = parsedUrl[1].split('&');
        }
        if(body) {
            this._bodyParams = JSON.parse(body);
        }
    }

    public assert(): void {
        this.assertUnspecifiedParams();
        this.assertRequiredParams();
    }

    private assertUnspecifiedParams(): void {
        if(this._queryParams) {
            for(const queryParam of this._queryParams) {
                const paramName: string = queryParam.split('=')[0];
                const paramValue: any = queryParam.split('=')[1];

                assert.isDefined(this._spec[paramName], 'Unspecified query parameter: ' + paramName);
                assert.isTrue(this._spec[paramName].queryString, 'Parameter should not be in query string: ' + paramName);

                this.assertQueryParamType(paramName, paramValue);
            }
        }

        if(this._bodyParams) {
            for(const key in this._bodyParams) {
                if(this._bodyParams.hasOwnProperty(key)) {
                    assert.isDefined(this._spec[key], 'Unspecified body parameter: ' + key);
                    assert.isTrue(this._spec[key].body, 'Parameter should not be in request body: ' + key);
                    this.assertBodyParamType(key, this._bodyParams[key]);
                }
            }
        }
    }

    private assertRequiredParams(): void {
        for(const param in this._spec) {
            if(this._spec.hasOwnProperty(param)) {
                if(this.isRequired(this._spec[param].required)) {
                    if(this._spec[param].queryString) {
                        let found: boolean = false;

                        for(const queryParam of this._queryParams) {
                            const paramName: string = queryParam.split('=')[0];
                            if(paramName === param) {
                                found = true;
                            }
                        }

                        assert.isTrue(found, 'Required parameter not found in query string: ' + param);
                    }

                    if(this._spec[param].body) {
                        assert.isTrue(this._bodyParams.hasOwnProperty(param), 'Required parameter not found in body: ' + param);
                    }
                }
            }
        }
    }

    private assertQueryParamType(name: string, value: string): void {
        if(this._spec[name].type === 'boolean') {
            assert.match(value, /(true|false)/i, 'Query parameter type mismatch: ' + name);
        } else if(this._spec[name].type === 'number') {
            assert.match(value, /[0-9]+/, 'Query parameter type mismatch: ' + name);
        } else if(this._spec[name].type === 'string') {
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
            const span = sinon.createStubInstance(JaegerSpan);
            const configManager = new ConfigManager(platform, core, metaDataManager, TestFixtures.getClientInfo(platform), TestFixtures.getAndroidDeviceInfo(core), request);
            return configManager.getConfig(span).then(() => {
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
            const span = sinon.createStubInstance(JaegerSpan);
            const configManager = new ConfigManager(platform, core, metaDataManager, TestFixtures.getClientInfo(platform), TestFixtures.getIosDeviceInfo(core), request);
            return configManager.getConfig(span).then(() => {
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
            const cacheBookkeeping = new CacheBookkeepingManager(core);
            const programmaticTrackingService: ProgrammaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);
            const backupCampaignManager: BackupCampaignManager = new BackupCampaignManager(core, storageBridge, coreConfig);
            const wakeUpManager = new WakeUpManager(core);
            const assetManager = new AssetManager(platform, core, new CacheManager(core, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping, programmaticTrackingService, backupCampaignManager);
            const sessionManager = new SessionManager(core.Storage, request, storageBridge);
            const focusManager = new FocusManager(platform, core);
            const adMobSignalFactory = new AdMobSignalFactory(platform, core, ads, clientInfo, deviceInfo, focusManager);
            const campaignParserManager = new CampaignParserManager();
            const jaegerManager = sinon.createStubInstance(JaegerManager);
            jaegerManager.startSpan = sinon.stub().returns(new JaegerSpan('test'));
            sinon.stub(adMobSignalFactory, 'getOptionalSignal').returns(Promise.resolve(new AdMobOptionalSignal()));
            sinon.stub(core.DeviceInfo, 'getUniqueEventId').returns(Promise.resolve('abdce-12345'));
            sinon.stub(sessionManager, 'startNewSession').returns(Promise.resolve(new Session('abdce-12345')));
            sessionManager.setGameSessionId(1234);
            const campaignManager: CampaignManager = new CampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, campaignParserManager, jaegerManager, backupCampaignManager);
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
            const core = TestFixtures.getCoreApi(nativeBridge);
            const ads = TestFixtures.getAdsApi(nativeBridge);
            const storageBridge = new StorageBridge(core);
            const metaDataManager = new MetaDataManager(core);
            const request = new RequestManager(platform, core, new WakeUpManager(core));
            const requestSpy: any = sinon.stub(request, 'post').returns(Promise.resolve(TestFixtures.getOkNativeResponse()));
            const clientInfo = TestFixtures.getClientInfo(platform);
            const deviceInfo = TestFixtures.getIosDeviceInfo(core);
            const cacheBookkeeping = new CacheBookkeepingManager(core);
            const programmaticTrackingService: ProgrammaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);
            const backupCampaignManager: BackupCampaignManager = new BackupCampaignManager(core, storageBridge, coreConfig);
            const wakeUpManager = new WakeUpManager(core);
            const assetManager = new AssetManager(platform, core, new CacheManager(core, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping, programmaticTrackingService, backupCampaignManager);
            const sessionManager = new SessionManager(core.Storage, request, storageBridge);
            const focusManager = new FocusManager(platform, core);
            const adMobSignalFactory = new AdMobSignalFactory(platform, core, ads, clientInfo, deviceInfo, focusManager);
            const campaignParserManager = new CampaignParserManager();
            const jaegerManager = sinon.createStubInstance(JaegerManager);
            jaegerManager.startSpan = sinon.stub().returns(new JaegerSpan('test'));
            sinon.stub(adMobSignalFactory, 'getOptionalSignal').returns(Promise.resolve(new AdMobOptionalSignal()));
            sinon.stub(core.DeviceInfo, 'getUniqueEventId').returns(Promise.resolve('abdce-12345'));
            sinon.stub(sessionManager, 'startNewSession').returns(Promise.resolve(new Session('abdce-12345')));
            sessionManager.setGameSessionId(1234);
            const campaignManager: CampaignManager = new CampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, campaignParserManager, jaegerManager, backupCampaignManager);
            return campaignManager.request().then(() => {
                const url: string = requestSpy.getCall(0).args[0];
                const body: string = requestSpy.getCall(0).args[1];

                const verifier: SpecVerifier = new SpecVerifier(Platform.IOS, ParamsTestData.getAdRequestParams(), url, body);
                verifier.assert();
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
            const sessionManager = new SessionManager(core.Storage, request, storageBridge);
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
                campaign: campaign
            });
            OperativeEventManager.setPreviousPlacementId(undefined);

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
            const sessionManager = new SessionManager(core.Storage, request, storageBridge);
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
                campaign: campaign
            });
            OperativeEventManager.setPreviousPlacementId(undefined);
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
                const sessionManager = new SessionManager(core.Storage, request, storageBridge);
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
                    campaign: campaign
                });
                OperativeEventManager.setPreviousPlacementId(undefined);
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
                const sessionManager = new SessionManager(core.Storage, request, storageBridge);
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
                    campaign: campaign
                });
                OperativeEventManager.setPreviousPlacementId(undefined);
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

    describe('with realtime ad request', () => {
        let coreConfig: CoreConfiguration;
        let adsConfig: AdsConfiguration;
        let realtimePlacement: Placement;

        beforeEach(() => {
            coreConfig = TestFixtures.getCoreConfiguration();
            adsConfig = TestFixtures.getAdsConfiguration();
            realtimePlacement = new Placement({
                id: 'placementStrictlyforScooters',
                name: 'test',
                default: true,
                allowSkip: true,
                skipInSeconds: 5,
                disableBackButton: true,
                useDeviceOrientationForVideo: false,
                muteVideo: false
            });
            realtimePlacement.setRealtimeData('XXXscootVids');
        });

        it('on Android', () => {
            const platform = Platform.ANDROID;
            const backend = TestFixtures.getBackend(platform);
            const nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            const core = TestFixtures.getCoreApi(nativeBridge);
            const ads = TestFixtures.getAdsApi(nativeBridge);
            const storageBridge = new StorageBridge(core);
            const metaDataManager = new MetaDataManager(core);
            const request = new RequestManager(platform, core, new WakeUpManager(core));
            const clientInfo = TestFixtures.getClientInfo(platform);
            const deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
            const cacheBookkeeping = new CacheBookkeepingManager(core);
            const programmaticTrackingService: ProgrammaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);
            const backupCampaignManager: BackupCampaignManager = new BackupCampaignManager(core, storageBridge, coreConfig);
            const wakeUpManager = new WakeUpManager(core);
            const assetManager = new AssetManager(platform, core, new CacheManager(core, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping, programmaticTrackingService, backupCampaignManager);
            const sessionManager = new SessionManager(core.Storage, request, storageBridge);
            const focusManager = new FocusManager(platform, core);
            const adMobSignalFactory = new AdMobSignalFactory(platform, core, ads, clientInfo, deviceInfo, focusManager);
            const campaignParserManager = new CampaignParserManager();
            const jaegerManager = sinon.createStubInstance(JaegerManager);
            jaegerManager.startSpan = sinon.stub().returns(new JaegerSpan('test'));
            sinon.stub(core.DeviceInfo, 'getUniqueEventId').returns(Promise.resolve('abdce-12345'));
            const session = new Session('abcde-12345');
            sinon.stub(sessionManager, 'startNewSession').returns(Promise.resolve(session));
            sessionManager.setGameSessionId(1234);
            const campaignManager: CampaignManager = new CampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, campaignParserManager, jaegerManager, backupCampaignManager);
            campaignManager.request().then(() => {
                const requestSpy: any = sinon.spy(request, 'post');
                return campaignManager.requestRealtime(realtimePlacement, session).then(() => {
                    const url: string = requestSpy.getCall(0).args[0];
                    const body: string = requestSpy.getCall(0).args[1];
                    const verifier: SpecVerifier = new SpecVerifier(Platform.ANDROID, ParamsTestData.getRealtimeAdRequestParams(), url, body);
                    verifier.assert();
                });
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
            const clientInfo = TestFixtures.getClientInfo(platform);
            const deviceInfo = TestFixtures.getIosDeviceInfo(core);
            const cacheBookkeeping = new CacheBookkeepingManager(core);
            const programmaticTrackingService: ProgrammaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);
            const backupCampaignManager: BackupCampaignManager = new BackupCampaignManager(core, storageBridge, coreConfig);
            const wakeUpManager = new WakeUpManager(core);
            const assetManager = new AssetManager(platform, core, new CacheManager(core, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping, programmaticTrackingService, backupCampaignManager);
            const sessionManager = new SessionManager(core.Storage, request, storageBridge);
            const focusManager = new FocusManager(platform, core);
            const adMobSignalFactory = new AdMobSignalFactory(platform, core, ads, clientInfo, deviceInfo, focusManager);
            const campaignParserManager = new CampaignParserManager();
            const jaegerManager = sinon.createStubInstance(JaegerManager);
            jaegerManager.startSpan = sinon.stub().returns(new JaegerSpan('test'));
            sinon.stub(core.DeviceInfo, 'getUniqueEventId').returns(Promise.resolve('abdce-12345'));
            const session = new Session('abcde-12345');
            sinon.stub(sessionManager, 'startNewSession').returns(Promise.resolve(session));
            sessionManager.setGameSessionId(1234);
            const campaignManager: CampaignManager = new CampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, campaignParserManager, jaegerManager, backupCampaignManager);
            campaignManager.request().then(() => {
                const requestSpy: any = sinon.spy(request, 'post');
                return campaignManager.requestRealtime(realtimePlacement, session).then(() => {
                    const url: string = requestSpy.getCall(0).args[0];
                    const body: string = requestSpy.getCall(0).args[1];
                    const verifier: SpecVerifier = new SpecVerifier(Platform.IOS, ParamsTestData.getRealtimeAdRequestParams(), url, body);
                    verifier.assert();
                });
            });
        });
    });
});
