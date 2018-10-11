import { AnalyticsManager } from 'Analytics/AnalyticsManager';
import { IAnalyticsObject } from 'Analytics/AnalyticsProtocol';
import { assert } from 'chai';
import { FocusManager } from 'Core/Managers/FocusManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { RequestApi } from 'Core/Native/Request';
import { StorageApi, StorageError, StorageType } from 'Core/Native/Storage';
import { RequestManager } from 'Core/Managers/RequestManager';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';

class FakeStorageApi extends StorageApi {
    private _values: { [key: string]: any } = {};

    public get<T>(type: StorageType, key: string): Promise<T> {
        if(this._values[key]) {
            return Promise.resolve(this._values[key]);
        }

        return Promise.reject([StorageError[StorageError.COULDNT_GET_VALUE], key]);
    }

    public set<T>(type: StorageType, key: string, value: T): Promise<void> {
        return Promise.resolve();
    }

    public delete(type: StorageType, key: string): Promise<void> {
        return Promise.resolve();
    }

    public setValue(key: string, value: any) {
        this._values[key] = value;
    }
}

class FakeRequestApi extends RequestApi {
    private _postCallback: (url: string, body: string) => void;

    constructor(nativeBridge: NativeBridge, postCallback: (url: string, body: string) => void) {
        super(nativeBridge);

        this._postCallback = postCallback;
    }

    public post(id: string, url: string, requestBody: string, headers: Array<[string, string]>, connectTimeout: number, readTimeout: number): Promise<string> {
        this._postCallback(url, requestBody);
        return Promise.resolve(id);
    }
}

class TestHelper {
    public static getEventType(data: string) {
        const rawJson: string = data.split('\n')[1];
        const analyticsObject: IAnalyticsObject = JSON.parse(rawJson);
        return analyticsObject.type;
    }
}

describe('AnalyticsManagerTest', () => {
    let nativeBridge: NativeBridge;
    let wakeUpManager: WakeUpManager;
    let request: RequestManager;
    let clientInfo: ClientInfo;
    let deviceInfo: DeviceInfo;
    let configuration: CoreConfiguration;
    let storage: FakeStorageApi;
    let analyticsManager: AnalyticsManager;
    let focusManager: FocusManager;

    beforeEach(() => {
        nativeBridge = TestFixtures.getNativeBridge();
        focusManager = new FocusManager(nativeBridge);
        wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
        request = new RequestManager(nativeBridge, wakeUpManager);
        clientInfo = TestFixtures.getClientInfo();
        deviceInfo = TestFixtures.getAndroidDeviceInfo();
        configuration = TestFixtures.getCoreConfiguration();

        sinon.stub(nativeBridge.DeviceInfo, 'getUniqueEventId').returns(Promise.resolve('6c7fa2c0-4333-47be-8de2-2f24e33e710c'));
        storage = new FakeStorageApi(nativeBridge);
        nativeBridge.Storage = storage;

        analyticsManager = new AnalyticsManager(nativeBridge, wakeUpManager, request, clientInfo, deviceInfo, configuration, focusManager);
    });

    it('should send session start event', () => {
        const requestSpy = sinon.spy(request, 'post');

        return analyticsManager.init().then(() => {
            sinon.assert.called(requestSpy);
            assert.equal(TestHelper.getEventType(requestSpy.getCall(0).args[1]), 'analytics.appStart.v1');
        });
    });

    it('should send session running event', () => {
        return analyticsManager.init().then(() => {
            const requestSpy = sinon.spy(request, 'post');

            focusManager.onActivityPaused.trigger('com.test.activity');

            sinon.assert.called(requestSpy);
            assert.equal(TestHelper.getEventType(requestSpy.getCall(0).args[1]), 'analytics.appRunning.v1');
        });
    });
});
