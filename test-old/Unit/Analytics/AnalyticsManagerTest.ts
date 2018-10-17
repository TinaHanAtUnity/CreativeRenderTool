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
import { JaegerUtilities } from 'Core/Jaeger/JaegerUtilities';
import { Platform } from 'Core/Constants/Platform';

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
        nativeBridge = TestFixtures.getNativeBridge(Platform.TEST);
        focusManager = new FocusManager(nativeBridge);
        wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
<<<<<<< HEAD:test-old/Unit/Analytics/AnalyticsManagerTest.ts
        request = new RequestManager(nativeBridge, wakeUpManager);
=======
        request = sinon.createStubInstance(Request);
>>>>>>> master:test/Unit/Analytics/AnalyticsManagerTest.ts
        clientInfo = TestFixtures.getClientInfo();
        deviceInfo = TestFixtures.getAndroidDeviceInfo();
        configuration = TestFixtures.getCoreConfiguration();

        sinon.stub(nativeBridge.DeviceInfo, 'getUniqueEventId').returns(Promise.resolve('6c7fa2c0-4333-47be-8de2-2f24e33e710c'));
        (<sinon.SinonStub>request.post).callsFake(() => {
            return Promise.resolve();
        });
        storage = new FakeStorageApi(nativeBridge);
        nativeBridge.Storage = storage;

        analyticsManager = new AnalyticsManager(nativeBridge, request, clientInfo, deviceInfo, configuration, focusManager);
    });

    it('should send session start event', () => {
        const requestSpy = <sinon.SinonStub>request.post;

        return analyticsManager.init().then(() => {
            sinon.assert.called(requestSpy);
            assert.equal(TestHelper.getEventType(requestSpy.getCall(0).args[1]), 'analytics.appStart.v1');
        });
    });

    it('should send session running event', () => {
        return analyticsManager.init().then(() => {
            const requestSpy = <sinon.SinonStub>request.post;
            requestSpy.resetHistory();

            focusManager.onActivityPaused.trigger('com.test.activity');

            sinon.assert.called(requestSpy);
            assert.equal(TestHelper.getEventType(requestSpy.getCall(0).args[1]), 'analytics.appRunning.v1');
        });
    });

    it('should clear queue after event is sent', () => {
        // tslint:disable:no-string-literal
        return analyticsManager.init().then(() => {
            const eventQueue: any = analyticsManager['_analyticsEventQueue'];
            const promise = analyticsManager.onIapTransaction('fakeProductId', 'fakeReceipt', 'USD', 1.99).then(() => {
                assert.equal(Object.keys(eventQueue).length, 0);
            });
            assert.equal(Object.keys(eventQueue).length, 1);
            return promise;
        });
        // tslint:enable:no-string-literal
    });

    it('should clear queue after multiple events are sent', () => {
        // tslint:disable:no-string-literal
        return analyticsManager.init().then(() => {
            const eventQueue: any = analyticsManager['_analyticsEventQueue'];
            const postStub = <sinon.SinonStub>request.post;
            postStub.resetHistory();
            const first = analyticsManager.onIapTransaction('fakeProductId', 'fakeReceipt', 'USD', 1.99).catch((error) => {
                assert.fail(error);
            });
            const second = analyticsManager.onIapTransaction('fakeProductId2', 'fakeReceipt', 'USD', 1.99).catch((error) => {
                assert.fail(error);
            });
            assert.equal(Object.keys(eventQueue).length, 2);
            return Promise.all([first, second]).then(() => {
                let cdpPostCalls: number = 0;
                postStub.getCalls().map((call) => {
                    const url = call.args[0];
                    if (url === 'https://cdp.cloud.unity3d.com/v1/events') {
                        cdpPostCalls++;
                    }
                });
                assert.equal(JSON.stringify(eventQueue), '{}');
                assert.equal(cdpPostCalls, 2);
                assert.equal(Object.keys(eventQueue).length, 0);
            });
        });
        // tslint:enable:no-string-literal
    });

    it('should clear queue when first send fails and second succeeds', () => {
        // tslint:disable:no-string-literal
        return analyticsManager.init().then(() => {
            const eventQueue: any = analyticsManager['_analyticsEventQueue'];
            const postStub = <sinon.SinonStub>request.post;
            postStub.resetHistory();
            postStub.rejects();
            return analyticsManager.onIapTransaction('fakeProductId', 'fakeReceipt', 'USD', 1.99).then(() => {
                assert.fail('should throw');
            }).catch(() => {
                assert.equal(Object.keys(eventQueue).length, 1);
                postStub.resolves();
                return analyticsManager.onIapTransaction('fakeProductId2', 'fakeReceipt', 'USD', 1.99)
                .then(() => {
                    let cdpPostCalls: number = 0;
                    postStub.getCalls().map((call) => {
                        const url = call.args[0];
                        if (url === 'https://cdp.cloud.unity3d.com/v1/events') {
                            cdpPostCalls++;
                        }
                    });
                    assert.equal(JSON.stringify(eventQueue), '{}');
                    assert.equal(cdpPostCalls, 2);
                    assert.equal(Object.keys(eventQueue).length, 0);
                })
                .catch(() => {
                    assert.fail('should not throw');
                });
            });
        });
        // tslint:enable:no-string-literal
    });

});
