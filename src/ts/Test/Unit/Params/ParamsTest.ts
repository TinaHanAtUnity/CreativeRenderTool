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
import { EventManager } from 'Managers/EventManager';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { Configuration, CacheMode } from 'Models/Configuration';
import { AdUnitFactory } from 'AdUnits/AdUnitFactory';
import { IosAdUnitApi } from 'Native/Api/IosAdUnit';
import { Session } from 'Models/Session';
import { DeviceInfoApi } from 'Native/Api/DeviceInfo';
import { AndroidAdUnitApi } from 'Native/Api/AndroidAdUnit';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { DeviceInfo } from 'Models/DeviceInfo';
import { Cache } from 'Utilities/Cache';
import { AssetManager } from 'Managers/AssetManager';
import { AdUnitContainer } from 'AdUnits/Containers/AdUnitContainer';
import { ViewController } from 'AdUnits/Containers/ViewController';
import { Activity } from 'AdUnits/Containers/Activity';

class TestStorageApi extends StorageApi {
    public get<T>(storageType: StorageType, key: string): Promise<T> {
        if(storageType === StorageType.PUBLIC) {
            if(key === 'framework.name.value') {
                return Promise.resolve(<any>['Unity']);
            } else if(key === 'framework.version.value') {
                return Promise.resolve(<any>['1.2.3']);
            } else if(key === 'adapter.name.value') {
                return Promise.resolve(<any>['AssetStore']);
            } else if(key === 'adapter.version.value') {
                return Promise.resolve(<any>['2.0.0']);
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
            this.onComplete.trigger(id, url, '{"assetCaching": "forced", "placements": []}', 200, []);
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
            for(let i: number = 0; i < this._queryParams.length; i++) {
                const paramName: string = this._queryParams[i].split('=')[0];

                assert.isDefined(this._spec[paramName], 'Unspecified query parameter: ' + paramName);
                assert.isTrue(this._spec[paramName].queryString, 'Parameter should not be in query string: ' + paramName);
            }
        }

        if(this._bodyParams) {
            for(const key in this._bodyParams) {
                if(this._bodyParams.hasOwnProperty(key)) {
                    assert.isDefined(this._spec[key], 'Unspecified body parameter: ' + key);
                    assert.isTrue(this._spec[key].body, 'Parameter should not be in request body: ' + key);
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

                        for(let i: number = 0; i < this._queryParams.length; i++) {
                            const paramName: string = this._queryParams[i].split('=')[0];
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
        const eventManager: EventManager = new EventManager(nativeBridge, request);
        const sessionManager: SessionManager = new SessionManager(nativeBridge, TestFixtures.getClientInfo(nativeBridge.getPlatform()), TestFixtures.getDeviceInfo(nativeBridge.getPlatform()), eventManager);
        sessionManager.setSession(new Session('1234'));
        return sessionManager;
    }

    public static getAdUnit(nativeBridge: NativeBridge, sessionManager: SessionManager): AbstractAdUnit {
        const config: Configuration = new Configuration({'assetCaching': 'forced', 'placements': []});
        const deviceInfo = <DeviceInfo>{getLanguage: () => 'en'};

        let container: AdUnitContainer;
        if(nativeBridge.getPlatform() === Platform.IOS) {
            container = new ViewController(nativeBridge, TestFixtures.getDeviceInfo(Platform.IOS));
        } else {
            container = new Activity(nativeBridge, TestFixtures.getDeviceInfo(Platform.ANDROID));
        }

        return AdUnitFactory.createAdUnit(nativeBridge, container, deviceInfo, sessionManager, TestFixtures.getPlacement(), TestFixtures.getCampaign(), config, {});
    }
}

describe('Event parameters should match specifications', () => {
    beforeEach(() => {
        MetaDataManager.clearCaches();
    });

    describe('with config request', () => {
        it('on Android', () => {
            const nativeBridge: NativeBridge = TestHelper.getNativeBridge(Platform.ANDROID);
            const request: Request = new Request(nativeBridge, new WakeUpManager(nativeBridge));
            const requestSpy: any = sinon.spy(request, 'get');
            return ConfigManager.fetch(nativeBridge, request, TestFixtures.getClientInfo(Platform.ANDROID), TestFixtures.getDeviceInfo(Platform.ANDROID)).then(() => {
                const url: string = requestSpy.getCall(0).args[0];

                const verifier: SpecVerifier = new SpecVerifier(Platform.ANDROID, ParamsTestData.getConfigRequestParams(), url);
                verifier.assert();
            });
        });

        it('on iOS', () => {
            const nativeBridge: NativeBridge = TestHelper.getNativeBridge(Platform.IOS);
            const request: Request = new Request(nativeBridge, new WakeUpManager(nativeBridge));
            const requestSpy: any = sinon.spy(request, 'get');
            return ConfigManager.fetch(nativeBridge, request, TestFixtures.getClientInfo(Platform.IOS), TestFixtures.getDeviceInfo(Platform.IOS)).then(() => {
                const url: string = requestSpy.getCall(0).args[0];

                const verifier: SpecVerifier = new SpecVerifier(Platform.IOS, ParamsTestData.getConfigRequestParams(), url);
                verifier.assert();
            });
        });
    });

    describe('with ad request', () => {
        it('on Android', () => {
            const nativeBridge: NativeBridge = TestHelper.getNativeBridge(Platform.ANDROID);
            const request: Request = new Request(nativeBridge, new WakeUpManager(nativeBridge));
            const requestSpy: any = sinon.spy(request, 'post');
            const assetManager = new AssetManager(new Cache(nativeBridge, new WakeUpManager(nativeBridge)), CacheMode.DISABLED);
            const campaignManager: CampaignManager = new CampaignManager(nativeBridge, assetManager, request, TestFixtures.getClientInfo(Platform.ANDROID), TestFixtures.getDeviceInfo(Platform.ANDROID), TestFixtures.getVastParser());
            return campaignManager.request().then(() => {
                const url: string = requestSpy.getCall(0).args[0];
                const body: string = requestSpy.getCall(0).args[1];

                const verifier: SpecVerifier = new SpecVerifier(Platform.ANDROID, ParamsTestData.getAdRequestParams(), url, body);
                verifier.assert();
            });
       });

        it('on iOS', () => {
            const nativeBridge: NativeBridge = TestHelper.getNativeBridge(Platform.IOS);
            const request: Request = new Request(nativeBridge, new WakeUpManager(nativeBridge));
            const requestSpy: any = sinon.spy(request, 'post');
            const assetManager = new AssetManager(new Cache(nativeBridge, new WakeUpManager(nativeBridge)), CacheMode.DISABLED);
            const campaignManager: CampaignManager = new CampaignManager(nativeBridge, assetManager, request, TestFixtures.getClientInfo(Platform.IOS), TestFixtures.getDeviceInfo(Platform.IOS), TestFixtures.getVastParser());
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
            const request: Request = new Request(nativeBridge, new WakeUpManager(nativeBridge));
            const requestSpy: any = sinon.spy(request, 'post');
            const sessionManager: SessionManager = TestHelper.getSessionManager(nativeBridge, request);
            const adUnit: AbstractAdUnit = TestHelper.getAdUnit(nativeBridge, sessionManager);
            return sessionManager.sendClick(adUnit).then(() => {
                const url: string = requestSpy.getCall(0).args[0];
                const body: string = requestSpy.getCall(0).args[1];

                const verifier: SpecVerifier = new SpecVerifier(Platform.ANDROID, ParamsTestData.getClickEventParams(), url, body);
                verifier.assert();
            });
        });

        it('on iOS', () => {
            const nativeBridge: NativeBridge = TestHelper.getNativeBridge(Platform.IOS);
            const request: Request = new Request(nativeBridge, new WakeUpManager(nativeBridge));
            const requestSpy: any = sinon.spy(request, 'post');
            const sessionManager: SessionManager = TestHelper.getSessionManager(nativeBridge, request);
            const adUnit: AbstractAdUnit = TestHelper.getAdUnit(nativeBridge, sessionManager);
            return sessionManager.sendClick(adUnit).then(() => {
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
        let adUnit: AbstractAdUnit;

        describe('on Android', () => {
            beforeEach(() => {
                nativeBridge = TestHelper.getNativeBridge(Platform.ANDROID);
                request = new Request(nativeBridge, new WakeUpManager(nativeBridge));
                requestSpy = sinon.spy(request, 'post');
                sessionManager = TestHelper.getSessionManager(nativeBridge, request);
                adUnit = TestHelper.getAdUnit(nativeBridge, sessionManager);
            });

            it('with start event', () => {
                return sessionManager.sendStart(adUnit).then(() => {
                    const url: string = requestSpy.getCall(0).args[0];
                    const body: string = requestSpy.getCall(0).args[1];

                    const verifier: SpecVerifier = new SpecVerifier(Platform.ANDROID, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });

            it('with first quartile event', () => {
                return sessionManager.sendFirstQuartile(adUnit).then(() => {
                    const url: string = requestSpy.getCall(0).args[0];
                    const body: string = requestSpy.getCall(0).args[1];

                    const verifier: SpecVerifier = new SpecVerifier(Platform.ANDROID, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });

            it('with midpoint event', () => {
                return sessionManager.sendMidpoint(adUnit).then(() => {
                    const url: string = requestSpy.getCall(0).args[0];
                    const body: string = requestSpy.getCall(0).args[1];

                    const verifier: SpecVerifier = new SpecVerifier(Platform.ANDROID, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });

            it('with third quartile event', () => {
                return sessionManager.sendThirdQuartile(adUnit).then(() => {
                    const url: string = requestSpy.getCall(0).args[0];
                    const body: string = requestSpy.getCall(0).args[1];

                    const verifier: SpecVerifier = new SpecVerifier(Platform.ANDROID, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });

            it('with end event', () => {
                return sessionManager.sendView(adUnit).then(() => {
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
                request = new Request(nativeBridge, new WakeUpManager(nativeBridge));
                requestSpy = sinon.spy(request, 'post');
                sessionManager = TestHelper.getSessionManager(nativeBridge, request);
                adUnit = TestHelper.getAdUnit(nativeBridge, sessionManager);
            });

            it('with start event', () => {
                return sessionManager.sendStart(adUnit).then(() => {
                    const url: string = requestSpy.getCall(0).args[0];
                    const body: string = requestSpy.getCall(0).args[1];

                    const verifier: SpecVerifier = new SpecVerifier(Platform.IOS, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });

            it('with first quartile event', () => {
                return sessionManager.sendFirstQuartile(adUnit).then(() => {
                    const url: string = requestSpy.getCall(0).args[0];
                    const body: string = requestSpy.getCall(0).args[1];

                    const verifier: SpecVerifier = new SpecVerifier(Platform.IOS, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });

            it('with midpoint event', () => {
                return sessionManager.sendMidpoint(adUnit).then(() => {
                    const url: string = requestSpy.getCall(0).args[0];
                    const body: string = requestSpy.getCall(0).args[1];

                    const verifier: SpecVerifier = new SpecVerifier(Platform.IOS, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });

            it('with third quartile event', () => {
                return sessionManager.sendThirdQuartile(adUnit).then(() => {
                    const url: string = requestSpy.getCall(0).args[0];
                    const body: string = requestSpy.getCall(0).args[1];

                    const verifier: SpecVerifier = new SpecVerifier(Platform.IOS, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });

            it('with end event', () => {
                return sessionManager.sendView(adUnit).then(() => {
                    const url: string = requestSpy.getCall(0).args[0];
                    const body: string = requestSpy.getCall(0).args[1];

                    const verifier: SpecVerifier = new SpecVerifier(Platform.IOS, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });
        });
    });
});
