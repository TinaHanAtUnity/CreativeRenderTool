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
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { AbstractAdUnit, IAdUnitParameters } from 'AdUnits/AbstractAdUnit';
import { Configuration, CacheMode } from 'Models/Configuration';
import { AdUnitFactory } from 'AdUnits/AdUnitFactory';
import { IosAdUnitApi } from 'Native/Api/IosAdUnit';
import { DeviceInfoApi } from 'Native/Api/DeviceInfo';
import { AndroidAdUnitApi } from 'Native/Api/AndroidAdUnit';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { DeviceInfo } from 'Models/DeviceInfo';
import { Cache } from 'Utilities/Cache';
import { AssetManager } from 'Managers/AssetManager';
import { AdUnitContainer, ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';
import { ViewController } from 'AdUnits/Containers/ViewController';
import { Activity } from 'AdUnits/Containers/Activity';
import { ClientInfo } from 'Models/ClientInfo';
import { FocusManager } from 'Managers/FocusManager';

import ConfigurationAuctionPlc from 'json/ConfigurationAuctionPlc.json';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { Session } from 'Models/Session';
import { PerformanceCampaign } from 'Models/Campaigns/PerformanceCampaign';
import { Campaign } from 'Models/Campaign';

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
        nativeBridge.IosAdUnit = new IosAdUnitApi(nativeBridge);
        nativeBridge.AndroidAdUnit = new AndroidAdUnitApi(nativeBridge);
        return nativeBridge;
    }

    public static getSessionManager(nativeBridge: NativeBridge, request: Request): SessionManager {
        const sessionManager: SessionManager = new SessionManager(nativeBridge);
        return sessionManager;
    }

    public static getAdUnit(nativeBridge: NativeBridge, operativeEventManager: OperativeEventManager, thirdPartyEventManager: ThirdPartyEventManager, request: Request): AbstractAdUnit<Campaign> {
        const config: Configuration = TestFixtures.getConfiguration();
        let deviceInfo = TestFixtures.getDeviceInfo(Platform.ANDROID);
        let clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);

        let container: AdUnitContainer;
        const focusManager = new FocusManager(nativeBridge);
        if(nativeBridge.getPlatform() === Platform.IOS) {
            deviceInfo = TestFixtures.getDeviceInfo(Platform.ANDROID);
            clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
            container = new ViewController(nativeBridge, TestFixtures.getDeviceInfo(Platform.IOS), focusManager);
        } else {
            container = new Activity(nativeBridge, TestFixtures.getDeviceInfo(Platform.ANDROID));
        }

        const parameters: IAdUnitParameters<PerformanceCampaign> = {
            forceOrientation: ForceOrientation.LANDSCAPE,
            focusManager: focusManager,
            container: container,
            deviceInfo: deviceInfo,
            clientInfo: clientInfo,
            thirdPartyEventManager: thirdPartyEventManager,
            operativeEventManager: operativeEventManager,
            placement: TestFixtures.getPlacement(),
            campaign: TestFixtures.getCampaign(),
            configuration: config,
            request: request,
            options: {},
        };

        return AdUnitFactory.createAdUnit(nativeBridge, parameters);
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
            return ConfigManager.fetch(nativeBridge, request, TestFixtures.getClientInfo(Platform.ANDROID), TestFixtures.getDeviceInfo(Platform.ANDROID), metaDataManager).then(() => {
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
            return ConfigManager.fetch(nativeBridge, request, TestFixtures.getClientInfo(Platform.IOS), TestFixtures.getDeviceInfo(Platform.IOS), metaDataManager).then(() => {
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
            const deviceInfo: DeviceInfo = TestFixtures.getDeviceInfo(Platform.ANDROID);
            const assetManager = new AssetManager(new Cache(nativeBridge, wakeUpManager, request), CacheMode.DISABLED, deviceInfo);
            const sessionManager = new SessionManager(nativeBridge);
            sinon.stub(nativeBridge.DeviceInfo, 'getUniqueEventId').returns(Promise.resolve('abdce-12345'));
            sinon.stub(sessionManager, 'startNewSession').returns(Promise.resolve(new Session('abdce-12345')));
            sessionManager.setGameSessionId(1234);
            const campaignManager: CampaignManager = new CampaignManager(nativeBridge, configuration, assetManager, sessionManager, request, clientInfo, deviceInfo, metaDataManager);
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
            const deviceInfo: DeviceInfo = TestFixtures.getDeviceInfo(Platform.IOS);
            const assetManager = new AssetManager(new Cache(nativeBridge, wakeUpManager, request), CacheMode.DISABLED, deviceInfo);
            const sessionManager = new SessionManager(nativeBridge);
            sinon.stub(nativeBridge.DeviceInfo, 'getUniqueEventId').returns(Promise.resolve('abdce-12345'));
            sinon.stub(sessionManager, 'startNewSession').returns(Promise.resolve(new Session('abdce-12345')));
            sessionManager.setGameSessionId(1234);
            const campaignManager: CampaignManager = new CampaignManager(nativeBridge, configuration, assetManager, sessionManager, request, clientInfo, deviceInfo, metaDataManager);
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
            const deviceInfo = TestFixtures.getDeviceInfo(Platform.ANDROID);
            sessionManager.setGameSessionId(1234);
            const operativeEventManager = new OperativeEventManager(nativeBridge, request, metaDataManager, sessionManager, clientInfo, deviceInfo);
            const thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
            const adUnit: AbstractAdUnit<Campaign> = TestHelper.getAdUnit(nativeBridge, operativeEventManager, thirdPartyEventManager, request);
            return operativeEventManager.sendClick(adUnit).then(() => {
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
            const deviceInfo = TestFixtures.getDeviceInfo(Platform.IOS);
            sessionManager.setGameSessionId(1234);
            const operativeEventManager = new OperativeEventManager(nativeBridge, request, metaDataManager, sessionManager, clientInfo, deviceInfo);
            const thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
            const adUnit: AbstractAdUnit<Campaign> = TestHelper.getAdUnit(nativeBridge, operativeEventManager, thirdPartyEventManager, request);
            return operativeEventManager.sendClick(adUnit).then(() => {
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
        let adUnit: AbstractAdUnit<Campaign>;
        let operativeEventManager: OperativeEventManager;

        describe('on Android', () => {
            beforeEach(() => {
                nativeBridge = TestHelper.getNativeBridge(Platform.ANDROID);
                const focusManager = new FocusManager(nativeBridge);
                request = new Request(nativeBridge, new WakeUpManager(nativeBridge, focusManager));
                requestSpy = sinon.spy(request, 'post');
                const metaDataManager = new MetaDataManager(nativeBridge);
                sessionManager = TestHelper.getSessionManager(nativeBridge, request);
                const clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
                const deviceInfo = TestFixtures.getDeviceInfo(Platform.ANDROID);
                sessionManager.setGameSessionId(1234);
                operativeEventManager = new OperativeEventManager(nativeBridge, request, metaDataManager, sessionManager, clientInfo, deviceInfo);
                const thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
                adUnit = TestHelper.getAdUnit(nativeBridge, operativeEventManager, thirdPartyEventManager, request);
            });

            it('with start event', () => {
                return operativeEventManager.sendStart(adUnit).then(() => {
                    const url: string = requestSpy.getCall(0).args[0];
                    const body: string = requestSpy.getCall(0).args[1];

                    const verifier: SpecVerifier = new SpecVerifier(Platform.ANDROID, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });

            it('with first quartile event', () => {
                return operativeEventManager.sendFirstQuartile(adUnit).then(() => {
                    const url: string = requestSpy.getCall(0).args[0];
                    const body: string = requestSpy.getCall(0).args[1];

                    const verifier: SpecVerifier = new SpecVerifier(Platform.ANDROID, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });

            it('with midpoint event', () => {
                return operativeEventManager.sendMidpoint(adUnit).then(() => {
                    const url: string = requestSpy.getCall(0).args[0];
                    const body: string = requestSpy.getCall(0).args[1];

                    const verifier: SpecVerifier = new SpecVerifier(Platform.ANDROID, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });

            it('with third quartile event', () => {
                return operativeEventManager.sendThirdQuartile(adUnit).then(() => {
                    const url: string = requestSpy.getCall(0).args[0];
                    const body: string = requestSpy.getCall(0).args[1];

                    const verifier: SpecVerifier = new SpecVerifier(Platform.ANDROID, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });

            it('with end event', () => {
                return operativeEventManager.sendView(adUnit).then(() => {
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
                const deviceInfo = TestFixtures.getDeviceInfo(Platform.IOS);
                sessionManager.setGameSessionId(1234);
                operativeEventManager = new OperativeEventManager(nativeBridge, request, metaDataManager, sessionManager, clientInfo, deviceInfo);
                const thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
                adUnit = TestHelper.getAdUnit(nativeBridge, operativeEventManager, thirdPartyEventManager, request);
            });

            it('with start event', () => {
                return operativeEventManager.sendStart(adUnit).then(() => {
                    const url: string = requestSpy.getCall(0).args[0];
                    const body: string = requestSpy.getCall(0).args[1];

                    const verifier: SpecVerifier = new SpecVerifier(Platform.IOS, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });

            it('with first quartile event', () => {
                return operativeEventManager.sendFirstQuartile(adUnit).then(() => {
                    const url: string = requestSpy.getCall(0).args[0];
                    const body: string = requestSpy.getCall(0).args[1];

                    const verifier: SpecVerifier = new SpecVerifier(Platform.IOS, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });

            it('with midpoint event', () => {
                return operativeEventManager.sendMidpoint(adUnit).then(() => {
                    const url: string = requestSpy.getCall(0).args[0];
                    const body: string = requestSpy.getCall(0).args[1];

                    const verifier: SpecVerifier = new SpecVerifier(Platform.IOS, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });

            it('with third quartile event', () => {
                return operativeEventManager.sendThirdQuartile(adUnit).then(() => {
                    const url: string = requestSpy.getCall(0).args[0];
                    const body: string = requestSpy.getCall(0).args[1];

                    const verifier: SpecVerifier = new SpecVerifier(Platform.IOS, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });

            it('with end event', () => {
                return operativeEventManager.sendView(adUnit).then(() => {
                    const url: string = requestSpy.getCall(0).args[0];
                    const body: string = requestSpy.getCall(0).args[1];

                    const verifier: SpecVerifier = new SpecVerifier(Platform.IOS, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });
        });
    });
});
