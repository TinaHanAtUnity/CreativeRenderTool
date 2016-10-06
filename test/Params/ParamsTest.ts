import 'mocha';
import * as sinon from 'sinon';
// import { assert } from 'chai';

import { NativeBridge } from 'Native/NativeBridge';
import { Request } from 'Utilities/Request';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { CampaignManager } from 'Managers/CampaignManager';
import { Platform } from 'Constants/Platform';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { StorageType, StorageApi } from 'Native/Api/Storage';
import { RequestApi } from 'Native/Api/Request';

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

    it('Ad request', () => {
        nativeBridge = TestFixtures.getNativeBridge();
        nativeBridge.Storage = new TestStorageApi(nativeBridge);
        nativeBridge.Request = new TestRequestApi(nativeBridge);
        request = new Request(nativeBridge, new WakeUpManager(nativeBridge));
        let requestSpy = sinon.spy(request, 'post');
        let campaignManager: CampaignManager = new CampaignManager(nativeBridge, request, TestFixtures.getClientInfo(), TestFixtures.getDeviceInfo(Platform.ANDROID), TestFixtures.getVastParser());
        return campaignManager.request().then(() => {
            // todo: assert arguments
            console.log('args ' + requestSpy.getCall(0).args[0]);
        });
    });
});