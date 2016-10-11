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

describe('Parameter specification test', () => {
    let nativeBridge: NativeBridge;
    let request: Request;

    it('Ad request (Android)', () => {
        let spec: IEventSpec = ParamsTestData.getAdRequestParams();

        nativeBridge = TestFixtures.getNativeBridge();
        nativeBridge.Storage = new TestStorageApi(nativeBridge);
        nativeBridge.Request = new TestRequestApi(nativeBridge);
        request = new Request(nativeBridge, new WakeUpManager(nativeBridge));
        let requestSpy = sinon.spy(request, 'post');
        let campaignManager: CampaignManager = new CampaignManager(nativeBridge, request, TestFixtures.getClientInfo(), TestFixtures.getDeviceInfo(Platform.ANDROID), TestFixtures.getVastParser());
        return campaignManager.request().then(() => {
            let url: string = requestSpy.getCall(0).args[0];
            let query = url.split('?')[1];
            let queryParams = query.split('&');

            for(let i: number = 0; i < queryParams.length; i++) {
                let paramName: string = queryParams[i].split('=')[0];

                assert.isDefined(spec[paramName], 'Unspecified query parameter: ' + paramName);
                assert.isTrue(spec[paramName].queryString, 'Parameter should not be in query string: ' + paramName);
            }

            let body: string = requestSpy.getCall(0).args[1];
            let bodyParams = JSON.parse(body);

            let key: string;
            for(key in bodyParams) {
                if(bodyParams.hasOwnProperty(key)) {
                    assert.isDefined(spec[key], 'Unspecified body parameter: ' + key);
                    assert.isTrue(spec[key].body, 'Parameter should not be in request body: ' + key);
                }
            }

            let param: string;
            for(param in spec) {
                if(spec.hasOwnProperty(param)) {
                    if(spec[param].required === 'all' || spec[param].required === 'android') {
                        if(spec[param].queryString) {
                            let found: boolean = false;

                            for(let i: number = 0; i < queryParams.length; i++) {
                                let paramName: string = queryParams[i].split('=')[0];
                                if(paramName === param) {
                                    found = true;
                                }
                            }

                            assert.isTrue(found, 'Required parameter not found in query string: ' + param);
                        }

                        if(spec[param].body) {
                            let found: boolean = false;

                            if(bodyParams.hasOwnProperty(param)) {
                                found = true;
                            }

                            assert.isTrue(found, 'Required parameter not found in body: ' + param);
                        }
                    }
                }
            }
       });
    });
});