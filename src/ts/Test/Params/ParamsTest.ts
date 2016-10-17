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
import { Configuration } from 'Models/Configuration';
import { AdUnitFactory } from 'AdUnits/AdUnitFactory';
import { IosAdUnitApi } from 'Native/Api/IosAdUnit';
import { Session } from 'Models/Session';
import { DeviceInfoApi } from 'Native/Api/DeviceInfo';
import { AndroidAdUnitApi } from 'Native/Api/AndroidAdUnit';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { DeviceInfo } from 'Models/DeviceInfo';

class TestStorageApi extends StorageApi {
    public get<T>(storageType: StorageType, key: string): Promise<T> {
        if(storageType === StorageType.PUBLIC) {
            if(key === 'framework.name.value') {
                return Promise.resolve(['Unity']);
            } else if(key === 'framework.version.value') {
                return Promise.resolve(['1.2.3']);
            } else if(key === 'adapter.name.value') {
                return Promise.resolve(['AssetStore']);
            } else if(key === 'adapter.version.value') {
                return Promise.resolve(['2.0.0']);
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
    public get(id: string, url: string, headers: [string, string][], connectTimeout: number, readTimeout: number): Promise<string> {
        setTimeout(() => {
            // get is used only for config request
            this.onComplete.trigger(id, url, '{"assetCaching": "forced", "placements": []}', 200, []);
        }, 1);
        return Promise.resolve(id);
    }

    public post(id: string, url: string, requestBody: string, headers: [string, string][], connectTimeout: number, readTimeout: number): Promise<string> {
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
        let parsedUrl: string[] = url.split('?');
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
                let paramName: string = this._queryParams[i].split('=')[0];

                assert.isDefined(this._spec[paramName], 'Unspecified query parameter: ' + paramName);
                assert.isTrue(this._spec[paramName].queryString, 'Parameter should not be in query string: ' + paramName);
            }
        }

        if(this._bodyParams) {
            let key: string;
            for(key in this._bodyParams) {
                if(this._bodyParams.hasOwnProperty(key)) {
                    assert.isDefined(this._spec[key], 'Unspecified body parameter: ' + key);
                    assert.isTrue(this._spec[key].body, 'Parameter should not be in request body: ' + key);
                }
            }
        }
    }

    private assertRequiredParams(): void {
        let param: string;
        for(param in this._spec) {
            if(this._spec.hasOwnProperty(param)) {
                if(this.isRequired(this._spec[param].required)) {
                    if(this._spec[param].queryString) {
                        let found: boolean = false;

                        for(let i: number = 0; i < this._queryParams.length; i++) {
                            let paramName: string = this._queryParams[i].split('=')[0];
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
        let nativeBridge: NativeBridge = TestFixtures.getNativeBridge(platform);
        nativeBridge.Storage = new TestStorageApi(nativeBridge);
        nativeBridge.Request = new TestRequestApi(nativeBridge);
        nativeBridge.DeviceInfo = new TestDeviceInfoApi(nativeBridge);
        nativeBridge.IosAdUnit = new IosAdUnitApi(nativeBridge);
        nativeBridge.AndroidAdUnit = new AndroidAdUnitApi(nativeBridge);
        return nativeBridge;
    }

    public static getSessionManager(nativeBridge: NativeBridge, request: Request): SessionManager {
        let eventManager: EventManager = new EventManager(nativeBridge, request);
        let sessionManager: SessionManager = new SessionManager(nativeBridge, TestFixtures.getClientInfo(nativeBridge.getPlatform()), TestFixtures.getDeviceInfo(nativeBridge.getPlatform()), eventManager);
        sessionManager.setSession(new Session('1234'));
        return sessionManager;
    }

    public static getAdUnit(nativeBridge: NativeBridge, sessionManager: SessionManager): AbstractAdUnit {
        let config: Configuration = new Configuration({'assetCaching': 'forced', 'placements': []});
        let deviceInfo = <DeviceInfo>{getLanguage: () => 'en'};
        return AdUnitFactory.createAdUnit(nativeBridge, deviceInfo, sessionManager, TestFixtures.getPlacement(), TestFixtures.getCampaign(), config, {});
    }
}

describe('Event parameters should match specifications', () => {
    beforeEach(() => {
        MetaDataManager.clearCaches();
    });

    describe('with config request', () => {
        it('on Android', () => {
            let nativeBridge: NativeBridge = TestHelper.getNativeBridge(Platform.ANDROID);
            let request: Request = new Request(nativeBridge, new WakeUpManager(nativeBridge));
            let requestSpy: any = sinon.spy(request, 'get');
            return ConfigManager.fetch(nativeBridge, request, TestFixtures.getClientInfo(Platform.ANDROID), TestFixtures.getDeviceInfo(Platform.ANDROID)).then(() => {
                let url: string = requestSpy.getCall(0).args[0];

                let verifier: SpecVerifier = new SpecVerifier(Platform.ANDROID, ParamsTestData.getConfigRequestParams(), url);
                verifier.assert();
            });
        });

        it('on iOS', () => {
            let nativeBridge: NativeBridge = TestHelper.getNativeBridge(Platform.IOS);
            let request: Request = new Request(nativeBridge, new WakeUpManager(nativeBridge));
            let requestSpy: any = sinon.spy(request, 'get');
            return ConfigManager.fetch(nativeBridge, request, TestFixtures.getClientInfo(Platform.IOS), TestFixtures.getDeviceInfo(Platform.IOS)).then(() => {
                let url: string = requestSpy.getCall(0).args[0];

                let verifier: SpecVerifier = new SpecVerifier(Platform.IOS, ParamsTestData.getConfigRequestParams(), url);
                verifier.assert();
            });
        });
    });

    describe('with ad request', () => {
        it('on Android', () => {
            let nativeBridge: NativeBridge = TestHelper.getNativeBridge(Platform.ANDROID);
            let request: Request = new Request(nativeBridge, new WakeUpManager(nativeBridge));
            let requestSpy: any = sinon.spy(request, 'post');
            let campaignManager: CampaignManager = new CampaignManager(nativeBridge, request, TestFixtures.getClientInfo(Platform.ANDROID), TestFixtures.getDeviceInfo(Platform.ANDROID), TestFixtures.getVastParser());
            return campaignManager.request().then(() => {
                let url: string = requestSpy.getCall(0).args[0];
                let body: string = requestSpy.getCall(0).args[1];

                let verifier: SpecVerifier = new SpecVerifier(Platform.ANDROID, ParamsTestData.getAdRequestParams(), url, body);
                verifier.assert();
            });
       });

        it('on iOS', () => {
            let nativeBridge: NativeBridge = TestHelper.getNativeBridge(Platform.IOS);
            let request: Request = new Request(nativeBridge, new WakeUpManager(nativeBridge));
            let requestSpy: any = sinon.spy(request, 'post');
            let campaignManager: CampaignManager = new CampaignManager(nativeBridge, request, TestFixtures.getClientInfo(Platform.IOS), TestFixtures.getDeviceInfo(Platform.IOS), TestFixtures.getVastParser());
            return campaignManager.request().then(() => {
                let url: string = requestSpy.getCall(0).args[0];
                let body: string = requestSpy.getCall(0).args[1];

                let verifier: SpecVerifier = new SpecVerifier(Platform.IOS, ParamsTestData.getAdRequestParams(), url, body);
                verifier.assert();
            });
        });
    });

    describe('with click event', () => {
        it('on Android', () => {
            let nativeBridge: NativeBridge = TestHelper.getNativeBridge(Platform.ANDROID);
            let request: Request = new Request(nativeBridge, new WakeUpManager(nativeBridge));
            let requestSpy: any = sinon.spy(request, 'post');
            let sessionManager: SessionManager = TestHelper.getSessionManager(nativeBridge, request);
            let adUnit: AbstractAdUnit = TestHelper.getAdUnit(nativeBridge, sessionManager);
            return sessionManager.sendClick(adUnit).then(() => {
                let url: string = requestSpy.getCall(0).args[0];
                let body: string = requestSpy.getCall(0).args[1];

                let verifier: SpecVerifier = new SpecVerifier(Platform.ANDROID, ParamsTestData.getClickEventParams(), url, body);
                verifier.assert();
            });
        });

        it('on iOS', () => {
            let nativeBridge: NativeBridge = TestHelper.getNativeBridge(Platform.IOS);
            let request: Request = new Request(nativeBridge, new WakeUpManager(nativeBridge));
            let requestSpy: any = sinon.spy(request, 'post');
            let sessionManager: SessionManager = TestHelper.getSessionManager(nativeBridge, request);
            let adUnit: AbstractAdUnit = TestHelper.getAdUnit(nativeBridge, sessionManager);
            return sessionManager.sendClick(adUnit).then(() => {
                let url: string = requestSpy.getCall(0).args[0];
                let body: string = requestSpy.getCall(0).args[1];

                let verifier: SpecVerifier = new SpecVerifier(Platform.IOS, ParamsTestData.getClickEventParams(), url, body);
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

            it('with show event', () => {
                return sessionManager.sendShow(adUnit).then(() => {
                    let url: string = requestSpy.getCall(0).args[0];
                    let body: string = requestSpy.getCall(0).args[1];

                    let verifier: SpecVerifier = new SpecVerifier(Platform.ANDROID, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });

            it('with start event', () => {
                return sessionManager.sendStart(adUnit).then(() => {
                    let url: string = requestSpy.getCall(0).args[0];
                    let body: string = requestSpy.getCall(0).args[1];

                    let verifier: SpecVerifier = new SpecVerifier(Platform.ANDROID, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });

            it('with first quartile event', () => {
                return sessionManager.sendFirstQuartile(adUnit).then(() => {
                    let url: string = requestSpy.getCall(0).args[0];
                    let body: string = requestSpy.getCall(0).args[1];

                    let verifier: SpecVerifier = new SpecVerifier(Platform.ANDROID, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });

            it('with midpoint event', () => {
                return sessionManager.sendMidpoint(adUnit).then(() => {
                    let url: string = requestSpy.getCall(0).args[0];
                    let body: string = requestSpy.getCall(0).args[1];

                    let verifier: SpecVerifier = new SpecVerifier(Platform.ANDROID, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });

            it('with third quartile event', () => {
                return sessionManager.sendThirdQuartile(adUnit).then(() => {
                    let url: string = requestSpy.getCall(0).args[0];
                    let body: string = requestSpy.getCall(0).args[1];

                    let verifier: SpecVerifier = new SpecVerifier(Platform.ANDROID, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });

            it('with skip event', () => {
                return sessionManager.sendSkip(adUnit, 12345).then(() => {
                    let url: string = requestSpy.getCall(0).args[0];
                    let body: string = requestSpy.getCall(0).args[1];

                    let verifier: SpecVerifier = new SpecVerifier(Platform.ANDROID, ParamsTestData.getSkipEventParams(), url, body);
                    verifier.assert();
                });
            });

            it('with end event', () => {
                return sessionManager.sendView(adUnit).then(() => {
                    let url: string = requestSpy.getCall(0).args[0];
                    let body: string = requestSpy.getCall(0).args[1];

                    let verifier: SpecVerifier = new SpecVerifier(Platform.ANDROID, ParamsTestData.getVideoEventParams(), url, body);
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

            it('with show event', () => {
                return sessionManager.sendShow(adUnit).then(() => {
                    let url: string = requestSpy.getCall(0).args[0];
                    let body: string = requestSpy.getCall(0).args[1];

                    let verifier: SpecVerifier = new SpecVerifier(Platform.IOS, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });

            it('with start event', () => {
                return sessionManager.sendStart(adUnit).then(() => {
                    let url: string = requestSpy.getCall(0).args[0];
                    let body: string = requestSpy.getCall(0).args[1];

                    let verifier: SpecVerifier = new SpecVerifier(Platform.IOS, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });

            it('with first quartile event', () => {
                return sessionManager.sendFirstQuartile(adUnit).then(() => {
                    let url: string = requestSpy.getCall(0).args[0];
                    let body: string = requestSpy.getCall(0).args[1];

                    let verifier: SpecVerifier = new SpecVerifier(Platform.IOS, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });

            it('with midpoint event', () => {
                return sessionManager.sendMidpoint(adUnit).then(() => {
                    let url: string = requestSpy.getCall(0).args[0];
                    let body: string = requestSpy.getCall(0).args[1];

                    let verifier: SpecVerifier = new SpecVerifier(Platform.IOS, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });

            it('with third quartile event', () => {
                return sessionManager.sendThirdQuartile(adUnit).then(() => {
                    let url: string = requestSpy.getCall(0).args[0];
                    let body: string = requestSpy.getCall(0).args[1];

                    let verifier: SpecVerifier = new SpecVerifier(Platform.IOS, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });

            it('with skip event', () => {
                return sessionManager.sendSkip(adUnit, 12345).then(() => {
                    let url: string = requestSpy.getCall(0).args[0];
                    let body: string = requestSpy.getCall(0).args[1];

                    let verifier: SpecVerifier = new SpecVerifier(Platform.IOS, ParamsTestData.getSkipEventParams(), url, body);
                    verifier.assert();
                });
            });

            it('with end event', () => {
                return sessionManager.sendView(adUnit).then(() => {
                    let url: string = requestSpy.getCall(0).args[0];
                    let body: string = requestSpy.getCall(0).args[1];

                    let verifier: SpecVerifier = new SpecVerifier(Platform.IOS, ParamsTestData.getVideoEventParams(), url, body);
                    verifier.assert();
                });
            });
        });
    });
});
