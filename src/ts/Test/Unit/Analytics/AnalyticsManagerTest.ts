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
import { StorageApi, StorageType, StorageError } from 'Native/Api/Storage';
import { IAnalyticsObject } from 'Analytics/AnalyticsProtocol';

class FakeStorageApi extends StorageApi {
    public get<T>(type: StorageType, key: string): Promise<T> {
        return Promise.reject([StorageError[StorageError.COULDNT_GET_VALUE], key]);
    }

    public set<T>(type: StorageType, key: string, value: T): Promise<void> {
        return Promise.resolve();
    }

    public delete(type: StorageType, key: string): Promise<void> {
        return Promise.resolve();
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
    let request: Request;
    let clientInfo: ClientInfo;
    let deviceInfo: DeviceInfo;
    let storage: FakeStorageApi;
    let analyticsManager: AnalyticsManager;

    beforeEach(() => {
        nativeBridge = TestFixtures.getNativeBridge();
        wakeUpManager = new WakeUpManager(nativeBridge);
        request = new Request(nativeBridge, wakeUpManager);
        clientInfo = TestFixtures.getClientInfo();
        deviceInfo = TestFixtures.getDeviceInfo();

        sinon.stub(nativeBridge.DeviceInfo, 'getUniqueEventId').returns(Promise.resolve('6c7fa2c0-4333-47be-8de2-2f24e33e710c'));
        storage = new FakeStorageApi(nativeBridge);
        nativeBridge.Storage = storage;

        analyticsManager = new AnalyticsManager(nativeBridge, wakeUpManager, request, clientInfo, deviceInfo);
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

            wakeUpManager.onActivityPaused.trigger('com.test.activity');

            sinon.assert.called(requestSpy);
            assert.equal(TestHelper.getEventType(requestSpy.getCall(0).args[1]), 'analytics.appRunning.v1');
        });
    });
});
