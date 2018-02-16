import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { NativeBridge } from 'Native/NativeBridge';
import { AnalyticsManager } from 'Analytics/AnalyticsManager';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { Request } from 'Utilities/Request';
import { ClientInfo } from 'Models/ClientInfo';
import { DeviceInfo } from 'Models/DeviceInfo';
import { StorageApi, StorageType, StorageError, StorageEvent } from 'Native/Api/Storage';
import { IAnalyticsObject } from 'Analytics/AnalyticsProtocol';
import { RequestApi } from 'Native/Api/Request';
import { IIAPInstrumentation } from 'Analytics/AnalyticsStorage';
import { FocusManager } from 'Managers/FocusManager';
import { Configuration } from 'Models/Configuration';

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

    public static getEventJson(data: string): IAnalyticsObject {
        const rawJson: string = data.split('\n')[1];
        const analyticsObject: IAnalyticsObject = JSON.parse(rawJson);
        return analyticsObject;
    }
}

describe('AnalyticsManagerTest', () => {
    let nativeBridge: NativeBridge;
    let wakeUpManager: WakeUpManager;
    let request: Request;
    let clientInfo: ClientInfo;
    let deviceInfo: DeviceInfo;
    let configuration: Configuration;
    let storage: FakeStorageApi;
    let analyticsManager: AnalyticsManager;
    let focusManager: FocusManager;

    beforeEach(() => {
        nativeBridge = TestFixtures.getNativeBridge();
        focusManager = new FocusManager(nativeBridge);
        wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
        request = new Request(nativeBridge, wakeUpManager);
        clientInfo = TestFixtures.getClientInfo();
        deviceInfo = TestFixtures.getDeviceInfo();
        configuration = TestFixtures.getConfiguration();

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

    // todo: refactor this test when actual functionality in AnalyticsManager is fixed
    xit('should send transaction event', function(this: Mocha.ITestCallbackContext, done: MochaDone) {
        const transaction: IIAPInstrumentation = {
            receiptPurchaseData: 'test_purchase_data',
            'price': 1,
            'currency': 'USD',
            'signature': 'test_signature',
            'productId': 'test_id',
            'ts': 1493905891004
        };
        storage.setValue('iap.purchases', [transaction]);

        analyticsManager.init().then(() => {
            let count = 0;
            nativeBridge.Request = new FakeRequestApi(nativeBridge, (url: string, body: string) => {
                if(count === 0) {
                    assert.equal(TestHelper.getEventType(body), 'analytics.deviceInfo.v1');
                } else if(count === 1) {
                    assert.equal(TestHelper.getEventType(body), 'analytics.transaction.v1');
                    done();
                }
                ++count;
            });

            nativeBridge.Storage.onSet.trigger(StorageEvent[StorageEvent.SET], [{price: 1, currency: 'USD'}]);
        });
    });

    it('storage event', (done) => {
        analyticsManager.init().then(() => {
            let eventNumber = 0;
            nativeBridge.Request = new FakeRequestApi(nativeBridge, (url: string, body: string) => {
                eventNumber++;
                if (eventNumber === 2) {
                    try {
                        assert.equal(TestHelper.getEventType(body), 'analytics.transaction.v1');
                        const eventJson = TestHelper.getEventJson(body);
                        const msgJson: any = eventJson.msg;
                        assert.equal(msgJson.amount, 1);
                        assert.equal(msgJson.currency, 'USD');
                        done();
                    } catch (e) {
                        done(e);
                    }
                }
            });

            nativeBridge.Storage.onSet.trigger(StorageEvent[StorageEvent.SET], [{price: 1, currency: 'USD'}]);
        });
    });
});
