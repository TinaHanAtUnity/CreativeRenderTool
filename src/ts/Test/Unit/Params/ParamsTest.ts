import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { NativeBridge } from 'Native/NativeBridge';
import { Request } from 'Utilities/Request';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { CampaignManager } from 'Managers/CampaignManager';
import { Platform } from 'Constants/Platform';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { StorageType, StorageApi } from 'Native/Api/Storage';
import { RequestApi } from 'Native/Api/Request';
import { ParamsTestData, IEventSpec } from './ParamsTestData';
import { ConfigManager } from 'Managers/ConfigManager';
import { SessionManager } from 'Managers/SessionManager';
import { Configuration, CacheMode } from 'Models/Configuration';
import { IosAdUnitApi } from 'Native/Api/IosAdUnit';
import { DeviceInfoApi } from 'Native/Api/DeviceInfo';
import { AndroidAdUnitApi } from 'Native/Api/AndroidAdUnit';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { DeviceInfo } from 'Models/DeviceInfo';
import { Cache } from 'Utilities/Cache';
import { AssetManager } from 'Managers/AssetManager';
import { ClientInfo } from 'Models/ClientInfo';
import { FocusManager } from 'Managers/FocusManager';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { Session } from 'Models/Session';
import { PerformanceCampaign } from 'Models/Campaigns/PerformanceCampaign';
import { AndroidDeviceInfoApi, IPackageInfo } from 'Native/Api/AndroidDeviceInfo';

import ConfigurationAuctionPlc from 'json/ConfigurationAuctionPlc.json';
import { AdMobSignalFactory } from 'AdMob/AdMobSignalFactory';
import { CacheBookkeeping } from 'Utilities/CacheBookkeeping';
import { OperativeEventManagerFactory } from 'Managers/OperativeEventManagerFactory';

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
        const sessionManager: SessionManager = new SessionManager(nativeBridge, request);
        return sessionManager;
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
            return ConfigManager.fetch(nativeBridge, request, TestFixtures.getClientInfo(Platform.ANDROID), TestFixtures.getAndroidDeviceInfo(), metaDataManager).then(() => {
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
            return ConfigManager.fetch(nativeBridge, request, TestFixtures.getClientInfo(Platform.IOS), TestFixtures.getIosDeviceInfo(), metaDataManager).then(() => {
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
            const assetManager = new AssetManager(new Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping);
            const sessionManager = new SessionManager(nativeBridge, request);
            const adMobSignalFactory = new AdMobSignalFactory(nativeBridge, clientInfo, deviceInfo, focusManager);
            sinon.stub(nativeBridge.DeviceInfo, 'getUniqueEventId').returns(Promise.resolve('abdce-12345'));
            sinon.stub(sessionManager, 'startNewSession').returns(Promise.resolve(new Session('abdce-12345')));
            sessionManager.setGameSessionId(1234);
            const campaignManager: CampaignManager = new CampaignManager(nativeBridge, configuration, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager);
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
            const assetManager = new AssetManager(new Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping);
            const sessionManager = new SessionManager(nativeBridge, request);
            const adMobSignalFactory = new AdMobSignalFactory(nativeBridge, clientInfo, deviceInfo, focusManager);
            sinon.stub(nativeBridge.DeviceInfo, 'getUniqueEventId').returns(Promise.resolve('abdce-12345'));
            sinon.stub(sessionManager, 'startNewSession').returns(Promise.resolve(new Session('abdce-12345')));
            sessionManager.setGameSessionId(1234);
            const campaignManager: CampaignManager = new CampaignManager(nativeBridge, configuration, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager);
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
                campaign: campaign
            });
            OperativeEventManager.setPreviousPlacementId(undefined);
            return operativeEventManager.sendClick(campaign.getSession(), TestFixtures.getPlacement()).then(() => {
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
                campaign: campaign
            });
            OperativeEventManager.setPreviousPlacementId(undefined);
            return operativeEventManager.sendClick(campaign.getSession(), TestFixtures.getPlacement()).then(() => {
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
                    campaign: campaign
                });
                OperativeEventManager.setPreviousPlacementId(undefined);
            });

            it('with start event', () => {
                return operativeEventManager.sendStart(campaign.getSession(), TestFixtures.getPlacement()).then(() => {
                    const url: string = requestSpy.getCall(0).args[0];
                    const body: string = requestSpy.getCall(0).args[1];

                    const verifier: SpecVerifier = new SpecVerifier(Platform.ANDROID, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });

            it('with first quartile event', () => {
                return operativeEventManager.sendFirstQuartile(campaign.getSession(), TestFixtures.getPlacement()).then(() => {
                    const url: string = requestSpy.getCall(0).args[0];
                    const body: string = requestSpy.getCall(0).args[1];

                    const verifier: SpecVerifier = new SpecVerifier(Platform.ANDROID, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });

            it('with midpoint event', () => {
                return operativeEventManager.sendMidpoint(campaign.getSession(), TestFixtures.getPlacement()).then(() => {
                    const url: string = requestSpy.getCall(0).args[0];
                    const body: string = requestSpy.getCall(0).args[1];

                    const verifier: SpecVerifier = new SpecVerifier(Platform.ANDROID, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });

            it('with third quartile event', () => {
                return operativeEventManager.sendThirdQuartile(campaign.getSession(), TestFixtures.getPlacement()).then(() => {
                    const url: string = requestSpy.getCall(0).args[0];
                    const body: string = requestSpy.getCall(0).args[1];

                    const verifier: SpecVerifier = new SpecVerifier(Platform.ANDROID, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });

            it('with end event', () => {
                return operativeEventManager.sendView(campaign.getSession(), TestFixtures.getPlacement()).then(() => {
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
                    campaign: campaign
                });
                OperativeEventManager.setPreviousPlacementId(undefined);
            });

            it('with start event', () => {
                return operativeEventManager.sendStart(campaign.getSession(), TestFixtures.getPlacement()).then(() => {
                    const url: string = requestSpy.getCall(0).args[0];
                    const body: string = requestSpy.getCall(0).args[1];

                    const verifier: SpecVerifier = new SpecVerifier(Platform.IOS, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });

            it('with first quartile event', () => {
                return operativeEventManager.sendFirstQuartile(campaign.getSession(), TestFixtures.getPlacement()).then(() => {
                    const url: string = requestSpy.getCall(0).args[0];
                    const body: string = requestSpy.getCall(0).args[1];

                    const verifier: SpecVerifier = new SpecVerifier(Platform.IOS, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });

            it('with midpoint event', () => {
                return operativeEventManager.sendMidpoint(campaign.getSession(), TestFixtures.getPlacement()).then(() => {
                    const url: string = requestSpy.getCall(0).args[0];
                    const body: string = requestSpy.getCall(0).args[1];

                    const verifier: SpecVerifier = new SpecVerifier(Platform.IOS, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });

            it('with third quartile event', () => {
                return operativeEventManager.sendThirdQuartile(campaign.getSession(), TestFixtures.getPlacement()).then(() => {
                    const url: string = requestSpy.getCall(0).args[0];
                    const body: string = requestSpy.getCall(0).args[1];

                    const verifier: SpecVerifier = new SpecVerifier(Platform.IOS, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });

            it('with end event', () => {
                return operativeEventManager.sendView(campaign.getSession(), TestFixtures.getPlacement()).then(() => {
                    const url: string = requestSpy.getCall(0).args[0];
                    const body: string = requestSpy.getCall(0).args[1];

                    const verifier: SpecVerifier = new SpecVerifier(Platform.IOS, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });
        });
    });
});
