import { AdMobOptionalSignal } from 'AdMob/Models/AdMobOptionalSignal';
import { AdMobSignalFactory } from 'AdMob/Utilities/AdMobSignalFactory';
import { AssetManager } from 'Ads/Managers/AssetManager';
import { CampaignManager } from 'Ads/Managers/CampaignManager';
import { IOperativeEventParams, OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { PerformanceCampaign } from 'Ads/Models/Campaigns/PerformanceCampaign';
import { Placement } from 'Ads/Models/Placement';
import { Session } from 'Ads/Models/Session';
import { AndroidAdUnitApi } from 'Ads/Native/Android/AndroidAdUnit';
import { IosAdUnitApi } from 'Ads/Native/iOS/IosAdUnit';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { assert } from 'chai';
import { Platform } from 'Common/Constants/Platform';

import { NativeBridge } from 'Common/Native/NativeBridge';
import { JaegerManager } from 'Core/Jaeger/JaegerManager';
import { JaegerSpan } from 'Core/Jaeger/JaegerSpan';
import { ConfigManager } from 'Core/Managers/ConfigManager';
import { FocusManager } from 'Core/Managers/FocusManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CacheMode, Configuration } from 'Core/Models/Configuration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { AndroidDeviceInfoApi, IPackageInfo } from 'Core/Native/Android/AndroidDeviceInfo';
import { DeviceInfoApi } from 'Core/Native/DeviceInfo';
import { RequestApi } from 'Core/Native/Request';
import { StorageApi, StorageType } from 'Core/Native/Storage';
import { Cache } from 'Core/Utilities/Cache';
import { CacheBookkeeping } from 'Core/Utilities/CacheBookkeeping';
import { Request } from 'Core/Utilities/Request';

import ConfigurationAuctionPlc from 'json/ConfigurationAuctionPlc.json';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { IEventSpec, ParamsTestData } from 'Unit/Params/ParamsTestData';

class TestStorageApi extends StorageApi {
    public get<T>(storageType: StorageType, key: string): Promise<T> {
        if(storageType === StorageType.PUBLIC) {
            if(key === 'framework.name.value') {
                return Promise.resolve(<any>'Unity');
            } else if(key === 'framework.version.value') {
                return Promise.resolve(<any>'1.2.3');
            } else if(key === 'adapter.name.value') {
                return Promise.resolve(<any>'AssetStore');
            } else if(key === 'adapter.version.value') {
                return Promise.resolve(<any>'2.0.0');
            }
        }
        return Promise.reject(['COULDNT_GET_VALUE', key]);
    }

    public getKeys(type: StorageType, key: string, recursive: boolean): Promise<string[]> {
        if(type === StorageType.PUBLIC) {
            if(key === 'framework' || key === 'adapter') {
                return Promise.resolve(['name', 'version']);
            }
        }
        return Promise.resolve([]);
    }

    public set<T>(type: StorageType, key: string, value: T): Promise<void> {
        return Promise.resolve();
    }

    public write(type: StorageType): Promise<void> {
        return Promise.resolve();
    }

    public delete(type: StorageType, key: string): Promise<void> {
        return Promise.resolve();
    }
}

class TestRequestApi extends RequestApi {
    public get(id: string, url: string, headers: Array<[string, string]>, connectTimeout: number, readTimeout: number): Promise<string> {
        setTimeout(() => {
            // get is used only for config request
            this.onComplete.trigger(id, url, ConfigurationAuctionPlc, 200, []);
        }, 1);
        return Promise.resolve(id);
    }

    public post(id: string, url: string, requestBody: string, headers: Array<[string, string]>, connectTimeout: number, readTimeout: number): Promise<string> {
        setTimeout(() => {
            this.onComplete.trigger(id, url, '{}', 200, []);
        }, 1);
        return Promise.resolve(id);
    }
}

class TestDeviceInfoApi extends DeviceInfoApi {
    public getUniqueEventId(): Promise<string> {
        return Promise.resolve('1234-ABCD');
    }

    public getCPUCount(): Promise<number> {
        return Promise.resolve(2);
    }
}

class TestAndroidDeviceInfoApi extends AndroidDeviceInfoApi {
    public getPackageInfo(packageName: string): Promise<IPackageInfo> {
        return Promise.resolve(TestFixtures.getPackageInfo());
    }

    public isUSBConnected(): Promise<boolean> {
        return Promise.resolve(false);
    }

    public getApkDigest(): Promise<string> {
        return Promise.resolve('abcd-1234');
    }

    public getCertificateFingerprint(): Promise<string> {
        return Promise.resolve('efgh-5678');
    }

    public getUptime(): Promise<number> {
        return Promise.resolve(123456);
    }

    public getElapsedRealtime(): Promise<number> {
        return Promise.resolve(12345);
    }

    public isAdbEnabled(): Promise<boolean> {
        return Promise.resolve(false);
    }

    public getFingerprint(): Promise<string> {
        return Promise.resolve('test/fingerprint');
    }
}

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

class TestHelper {
    public static getNativeBridge(platform: Platform) {
        const nativeBridge: NativeBridge = TestFixtures.getNativeBridge(platform);
        nativeBridge.Storage = new TestStorageApi(nativeBridge);
        nativeBridge.Request = new TestRequestApi(nativeBridge);
        nativeBridge.DeviceInfo = new TestDeviceInfoApi(nativeBridge);
        nativeBridge.DeviceInfo.Android = new TestAndroidDeviceInfoApi(nativeBridge);
        nativeBridge.IosAdUnit = new IosAdUnitApi(nativeBridge);
        nativeBridge.AndroidAdUnit = new AndroidAdUnitApi(nativeBridge);
        return nativeBridge;
    }

    public static getSessionManager(nativeBridge: NativeBridge, request: Request): SessionManager {
        return new SessionManager(nativeBridge, request);
    }
}

describe('Event parameters should match specifications', () => {

    describe('with config request', () => {
        it('on Android', () => {
            const nativeBridge: NativeBridge = TestHelper.getNativeBridge(Platform.ANDROID);
            const metaDataManager: MetaDataManager = new MetaDataManager(nativeBridge);
            const focusManager = new FocusManager(nativeBridge);
            const request: Request = new Request(nativeBridge, new WakeUpManager(nativeBridge, focusManager));
            const requestSpy: any = sinon.spy(request, 'get');
            const span = sinon.createStubInstance(JaegerSpan);
            return ConfigManager.fetch(nativeBridge, request, TestFixtures.getClientInfo(Platform.ANDROID), TestFixtures.getAndroidDeviceInfo(), metaDataManager, span).then(() => {
                const url: string = requestSpy.getCall(0).args[0];
                const verifier: SpecVerifier = new SpecVerifier(Platform.ANDROID, ParamsTestData.getConfigRequestParams(), url);
                verifier.assert();
            });
        });

        it('on iOS', () => {
            const nativeBridge: NativeBridge = TestHelper.getNativeBridge(Platform.IOS);
            const metaDataManager: MetaDataManager = new MetaDataManager(nativeBridge);
            const focusManager = new FocusManager(nativeBridge);
            const request: Request = new Request(nativeBridge, new WakeUpManager(nativeBridge, focusManager));
            const requestSpy: any = sinon.spy(request, 'get');
            const span = sinon.createStubInstance(JaegerSpan);
            return ConfigManager.fetch(nativeBridge, request, TestFixtures.getClientInfo(Platform.IOS), TestFixtures.getIosDeviceInfo(), metaDataManager, span).then(() => {
                const url: string = requestSpy.getCall(0).args[0];

                const verifier: SpecVerifier = new SpecVerifier(Platform.IOS, ParamsTestData.getConfigRequestParams(), url);
                verifier.assert();
            });
        });
    });

    describe('with ad request', () => {
        let configuration: Configuration;

        beforeEach(() => {
            configuration = TestFixtures.getConfiguration();
        });

        it('on Android', () => {
            const nativeBridge: NativeBridge = TestHelper.getNativeBridge(Platform.ANDROID);
            const metaDataManager: MetaDataManager = new MetaDataManager(nativeBridge);
            const focusManager = new FocusManager(nativeBridge);
            const wakeUpManager: WakeUpManager = new WakeUpManager(nativeBridge, focusManager);
            const request: Request = new Request(nativeBridge, wakeUpManager);
            const requestSpy: any = sinon.spy(request, 'post');
            const clientInfo: ClientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
            const deviceInfo: DeviceInfo = TestFixtures.getAndroidDeviceInfo();
            const cacheBookkeeping: CacheBookkeeping = new CacheBookkeeping(nativeBridge);
            const programmaticTrackingService: ProgrammaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);
            const assetManager = new AssetManager(new Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService), CacheMode.DISABLED, deviceInfo, cacheBookkeeping, nativeBridge);
            const sessionManager = new SessionManager(nativeBridge, request);
            const adMobSignalFactory = new AdMobSignalFactory(nativeBridge, clientInfo, deviceInfo, focusManager);
            const jaegerManager = sinon.createStubInstance(JaegerManager);
            jaegerManager.startSpan = sinon.stub().returns(new JaegerSpan('test'));
            sinon.stub(adMobSignalFactory, 'getOptionalSignal').returns(Promise.resolve(new AdMobOptionalSignal()));
            sinon.stub(nativeBridge.DeviceInfo, 'getUniqueEventId').returns(Promise.resolve('abdce-12345'));
            sinon.stub(sessionManager, 'startNewSession').returns(Promise.resolve(new Session('abdce-12345')));
            sessionManager.setGameSessionId(1234);
            const campaignManager: CampaignManager = new CampaignManager(nativeBridge, configuration, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, jaegerManager);
            return campaignManager.request().then(() => {
                const url: string = requestSpy.getCall(0).args[0];
                const body: string = requestSpy.getCall(0).args[1];

                const verifier: SpecVerifier = new SpecVerifier(Platform.ANDROID, ParamsTestData.getAdRequestParams(), url, body);
                verifier.assert();
            });
       });

        it('on iOS', () => {
            const nativeBridge: NativeBridge = TestHelper.getNativeBridge(Platform.IOS);
            const metaDataManager: MetaDataManager = new MetaDataManager(nativeBridge);
            const focusManager = new FocusManager(nativeBridge);
            const wakeUpManager: WakeUpManager = new WakeUpManager(nativeBridge, focusManager);
            const request: Request = new Request(nativeBridge, wakeUpManager);
            const requestSpy: any = sinon.spy(request, 'post');
            const clientInfo: ClientInfo = TestFixtures.getClientInfo(Platform.IOS);
            const deviceInfo: DeviceInfo = TestFixtures.getIosDeviceInfo();
            const cacheBookkeeping: CacheBookkeeping = new CacheBookkeeping(nativeBridge);
            const programmaticTrackingService: ProgrammaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);
            const assetManager = new AssetManager(new Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService), CacheMode.DISABLED, deviceInfo, cacheBookkeeping, nativeBridge);
            const sessionManager = new SessionManager(nativeBridge, request);
            const adMobSignalFactory = new AdMobSignalFactory(nativeBridge, clientInfo, deviceInfo, focusManager);
            const jaegerManager = sinon.createStubInstance(JaegerManager);
            jaegerManager.startSpan = sinon.stub().returns(new JaegerSpan('test'));
            sinon.stub(adMobSignalFactory, 'getOptionalSignal').returns(Promise.resolve(new AdMobOptionalSignal()));
            sinon.stub(nativeBridge.DeviceInfo, 'getUniqueEventId').returns(Promise.resolve('abdce-12345'));
            sinon.stub(sessionManager, 'startNewSession').returns(Promise.resolve(new Session('abdce-12345')));
            sessionManager.setGameSessionId(1234);
            const campaignManager: CampaignManager = new CampaignManager(nativeBridge, configuration, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, jaegerManager);
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
            const nativeBridge: NativeBridge = TestHelper.getNativeBridge(Platform.ANDROID);
            const focusManager = new FocusManager(nativeBridge);
            const request: Request = new Request(nativeBridge, new WakeUpManager(nativeBridge, focusManager));
            const requestSpy: any = sinon.spy(request, 'post');
            const metaDataManager = new MetaDataManager(nativeBridge);
            const sessionManager: SessionManager = TestHelper.getSessionManager(nativeBridge, request);
            const clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
            const deviceInfo = TestFixtures.getAndroidDeviceInfo();
            const campaign: PerformanceCampaign = TestFixtures.getCampaign();
            sessionManager.setGameSessionId(1234);
            const operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager({
                nativeBridge: nativeBridge,
                request: request,
                metaDataManager: metaDataManager,
                sessionManager: sessionManager,
                clientInfo: clientInfo,
                deviceInfo: deviceInfo,
                configuration: TestFixtures.getConfiguration(),
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
            const nativeBridge: NativeBridge = TestHelper.getNativeBridge(Platform.IOS);
            const focusManager = new FocusManager(nativeBridge);
            const request: Request = new Request(nativeBridge, new WakeUpManager(nativeBridge, focusManager));
            const requestSpy: any = sinon.spy(request, 'post');
            const metaDataManager = new MetaDataManager(nativeBridge);
            const sessionManager: SessionManager = TestHelper.getSessionManager(nativeBridge, request);
            const clientInfo = TestFixtures.getClientInfo(Platform.IOS);
            const deviceInfo = TestFixtures.getIosDeviceInfo();
            sessionManager.setGameSessionId(1234);
            const campaign: PerformanceCampaign = TestFixtures.getCampaign();
            const operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager({
                nativeBridge: nativeBridge,
                request: request,
                metaDataManager: metaDataManager,
                sessionManager: sessionManager,
                clientInfo: clientInfo,
                deviceInfo: deviceInfo,
                configuration: TestFixtures.getConfiguration(),
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
        let nativeBridge: NativeBridge;
        let request: Request;
        let requestSpy: any;
        let sessionManager: SessionManager;
        let operativeEventManager: OperativeEventManager;
        let campaign: PerformanceCampaign;
        let operativeEventParams: IOperativeEventParams;

        describe('on Android', () => {
            beforeEach(() => {
                nativeBridge = TestHelper.getNativeBridge(Platform.ANDROID);
                const focusManager = new FocusManager(nativeBridge);
                request = new Request(nativeBridge, new WakeUpManager(nativeBridge, focusManager));
                requestSpy = sinon.spy(request, 'post');
                const metaDataManager = new MetaDataManager(nativeBridge);
                sessionManager = TestHelper.getSessionManager(nativeBridge, request);
                const clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
                const deviceInfo = TestFixtures.getAndroidDeviceInfo();
                sessionManager.setGameSessionId(1234);
                campaign = TestFixtures.getCampaign();
                operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager({
                    nativeBridge: nativeBridge,
                    request: request,
                    metaDataManager: metaDataManager,
                    sessionManager: sessionManager,
                    clientInfo: clientInfo,
                    deviceInfo: deviceInfo,
                    configuration: TestFixtures.getConfiguration(),
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
                nativeBridge = TestHelper.getNativeBridge(Platform.IOS);
                const focusManager = new FocusManager(nativeBridge);
                request = new Request(nativeBridge, new WakeUpManager(nativeBridge, focusManager));
                requestSpy = sinon.spy(request, 'post');
                const metaDataManager = new MetaDataManager(nativeBridge);
                sessionManager = TestHelper.getSessionManager(nativeBridge, request);
                const clientInfo = TestFixtures.getClientInfo(Platform.IOS);
                const deviceInfo = TestFixtures.getIosDeviceInfo();
                sessionManager.setGameSessionId(1234);
                campaign = TestFixtures.getCampaign();
                operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager({
                    nativeBridge: nativeBridge,
                    request: request,
                    metaDataManager: metaDataManager,
                    sessionManager: sessionManager,
                    clientInfo: clientInfo,
                    deviceInfo: deviceInfo,
                    configuration: TestFixtures.getConfiguration(),
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
        let configuration: Configuration;
        let realtimePlacement: Placement;

        beforeEach(() => {
            configuration = TestFixtures.getConfiguration();
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
            const nativeBridge: NativeBridge = TestHelper.getNativeBridge(Platform.ANDROID);
            const metaDataManager: MetaDataManager = new MetaDataManager(nativeBridge);
            const focusManager = new FocusManager(nativeBridge);
            const wakeUpManager: WakeUpManager = new WakeUpManager(nativeBridge, focusManager);
            const request: Request = new Request(nativeBridge, wakeUpManager);
            const clientInfo: ClientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
            const deviceInfo: DeviceInfo = TestFixtures.getAndroidDeviceInfo();
            const cacheBookkeeping: CacheBookkeeping = new CacheBookkeeping(nativeBridge);
            const programmaticTrackingService: ProgrammaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);
            const assetManager = new AssetManager(new Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService), CacheMode.DISABLED, deviceInfo, cacheBookkeeping, nativeBridge);
            const sessionManager = new SessionManager(nativeBridge, request);
            const adMobSignalFactory = new AdMobSignalFactory(nativeBridge, clientInfo, deviceInfo, focusManager);
            const jaegerManager = sinon.createStubInstance(JaegerManager);
            jaegerManager.startSpan = sinon.stub().returns(new JaegerSpan('test'));
            sinon.stub(nativeBridge.DeviceInfo, 'getUniqueEventId').returns(Promise.resolve('abdce-12345'));
            const session = new Session('abcde-12345');
            sinon.stub(sessionManager, 'startNewSession').returns(Promise.resolve(session));
            sessionManager.setGameSessionId(1234);
            const campaignManager: CampaignManager = new CampaignManager(nativeBridge, configuration, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, jaegerManager);
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
            const nativeBridge: NativeBridge = TestHelper.getNativeBridge(Platform.IOS);
            const metaDataManager: MetaDataManager = new MetaDataManager(nativeBridge);
            const focusManager = new FocusManager(nativeBridge);
            const wakeUpManager: WakeUpManager = new WakeUpManager(nativeBridge, focusManager);
            const request: Request = new Request(nativeBridge, wakeUpManager);
            const clientInfo: ClientInfo = TestFixtures.getClientInfo(Platform.IOS);
            const deviceInfo: DeviceInfo = TestFixtures.getIosDeviceInfo();
            const cacheBookkeeping: CacheBookkeeping = new CacheBookkeeping(nativeBridge);
            const programmaticTrackingService: ProgrammaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);
            const assetManager = new AssetManager(new Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService), CacheMode.DISABLED, deviceInfo, cacheBookkeeping, nativeBridge);
            const sessionManager = new SessionManager(nativeBridge, request);
            const adMobSignalFactory = new AdMobSignalFactory(nativeBridge, clientInfo, deviceInfo, focusManager);
            const jaegerManager = sinon.createStubInstance(JaegerManager);
            jaegerManager.startSpan = sinon.stub().returns(new JaegerSpan('test'));
            sinon.stub(nativeBridge.DeviceInfo, 'getUniqueEventId').returns(Promise.resolve('abdce-12345'));
            const session = new Session('abcde-12345');
            sinon.stub(sessionManager, 'startNewSession').returns(Promise.resolve(session));
            sessionManager.setGameSessionId(1234);
            const campaignManager: CampaignManager = new CampaignManager(nativeBridge, configuration, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, jaegerManager);
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
