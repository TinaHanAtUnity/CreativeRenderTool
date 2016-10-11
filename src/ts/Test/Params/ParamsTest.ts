import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { NativeBridge } from '../../Native/NativeBridge';
import { Request } from '../../Utilities/Request';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { CampaignManager } from '../../Managers/CampaignManager';
import { Platform } from '../../Constants/Platform';
import { WakeUpManager } from '../../Managers/WakeUpManager';
import { StorageType, StorageApi } from '../../Native/Api/Storage';
import { RequestApi } from '../../Native/Api/Request';
import { ParamsTestData, IEventSpec } from './ParamsTestData';

class TestStorageApi extends StorageApi {
    public get<T>(storageType: StorageType, key: string): Promise<T> {
        return Promise.reject(['COULDNT_GET_VALUE', key]);
    }

    public getKeys(type: StorageType, key: string, recursive: boolean): Promise<string[]> {
        return Promise.resolve([]);
    }
}

class TestRequestApi extends RequestApi {
    public post(id: string, url: string, requestBody: string, headers: [string, string][], connectTimeout: number, readTimeout: number): Promise<string> {
        setTimeout(() => {
            this.onComplete.trigger(id, url, '{}', 200, []);
        }, 1);
        return Promise.resolve(id);
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
        this._queryParams = url.split('?')[1].split('&');
        if(body) {
            this._bodyParams = JSON.parse(body);
        }
    }

    public assert(): void {
        this.assertUnspecifiedParams();
        this.assertRequiredParams();
    }

    private assertUnspecifiedParams(): void {
        for (let i: number = 0; i < this._queryParams.length; i++) {
            let paramName: string = this._queryParams[i].split('=')[0];

            assert.isDefined(this._spec[paramName], 'Unspecified query parameter: ' + paramName);
            assert.isTrue(this._spec[paramName].queryString, 'Parameter should not be in query string: ' + paramName);
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

describe('Event parameters should match specifications', () => {
    describe('with ad request', () => {
        let nativeBridge: NativeBridge;
        let request: Request;
        let requestSpy: any;

        let spec: IEventSpec;

        beforeEach(() => {
            nativeBridge = TestFixtures.getNativeBridge();
            nativeBridge.Storage = new TestStorageApi(nativeBridge);
            nativeBridge.Request = new TestRequestApi(nativeBridge);
            request = new Request(nativeBridge, new WakeUpManager(nativeBridge));
            requestSpy = sinon.spy(request, 'post');

            spec = ParamsTestData.getAdRequestParams();
        });

        it('on Android', () => {
            let campaignManager: CampaignManager = new CampaignManager(nativeBridge, request, TestFixtures.getClientInfo(Platform.ANDROID), TestFixtures.getDeviceInfo(Platform.ANDROID), TestFixtures.getVastParser());
            return campaignManager.request().then(() => {
                let url: string = requestSpy.getCall(0).args[0];
                let body: string = requestSpy.getCall(0).args[1];

                let verifier: SpecVerifier = new SpecVerifier(Platform.ANDROID, spec, url, body);
                verifier.assert();
            });
       });

        it('on iOS', () => {
            let campaignManager: CampaignManager = new CampaignManager(nativeBridge, request, TestFixtures.getClientInfo(Platform.IOS), TestFixtures.getDeviceInfo(Platform.IOS), TestFixtures.getVastParser());
            return campaignManager.request().then(() => {
                let url: string = requestSpy.getCall(0).args[0];
                let body: string = requestSpy.getCall(0).args[1];

                let verifier: SpecVerifier = new SpecVerifier(Platform.IOS, spec, url, body);
                verifier.assert();
            });
        });
    });
});