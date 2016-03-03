import { NativeBridge } from '../../src/ts/NativeBridge';
import { Request } from '../../src/ts/Utilities/Request';
import { StorageManager, StorageType } from '../../src/ts/Managers/StorageManager';
import { EventManager } from '../../src/ts/Managers/EventManager';

import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

class MockStorageManager extends StorageManager {
    private _storage = {};

    public read(type: StorageType): Promise<any[]> {
        return new Promise<any[]>((resolve, reject) => {
            resolve();
        });
    }

    public write(type: StorageType): Promise<any[]> {
        return new Promise<any[]>((resolve, reject) => {
            resolve();
        });
    }

    public get<T>(type: StorageType, key: string): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            resolve(this._storage[key]);
        });
    }

    public set<T>(type: StorageType, key: string, value: T): Promise<any[]> {
        this._storage[key] = value;
        return new Promise<any[]>((resolve, reject) => {
            resolve();
        });
    }

    public delete(type: StorageType, key: string): Promise<any[]> {
        delete this._storage[key];
        return new Promise<any[]>((resolve, reject) => {
            resolve();
        });
    }

    public directGet(key: string): any {
        return this._storage[key];
    }
}

class MockRequest extends Request {
    public get(url: string, headers?: [string, string][]): Promise<any[]> {
        return new Promise<any[]>((resolve, reject) => {
            if(url.indexOf('/fail') !== -1) {
                reject();
            } else {
                resolve();
            }
        });
    }

    public post(url: string, data?: string, headers?: [string, string][]): Promise<any[]> {
        return new Promise<any[]>((resolve, reject) => {
            if(url.indexOf('/fail') !== -1) {
                reject();
            } else {
                resolve();
            }
        });
    }
}

class MockBridge implements IWebViewBridge {
    public handleInvocation(invocations: string): void {
        // ignore all other invocations like logging
    }

    public handleCallback(id: string, status: string, parameters?: string): void {
        // ignore all callbacks like logging
    }
}

describe('EventManagerTest', () => {
    it('Send successful operative event', function(done: MochaDone) {
        let nativeBridge: NativeBridge = new NativeBridge(new MockBridge());
        let request: MockRequest = new MockRequest(nativeBridge);
        let storageManager: MockStorageManager = new MockStorageManager(nativeBridge);
        let eventManager: EventManager = new EventManager(nativeBridge, request, storageManager);

        let eventId: string = '1234';
        let sessionId: string = '5678';
        let url: string = 'https://www.example.net/operative_event';
        let data: string = 'Test data';

        let requestSpy = sinon.spy(request, 'post');

        eventManager.operativeEvent('test', eventId, sessionId, url, data).then(() => {
            assert(requestSpy.calledOnce);
            assert.equal(url, requestSpy.getCall(0).args[0], 'Operative event url does not match');
            assert.equal(data, requestSpy.getCall(0).args[1], 'Operative event data does not match');

            let urlKey: string = 'session.' + sessionId + '.operative.' + eventId + '.url';
            let dataKey: string = 'session.' + sessionId + '.operative.' + eventId + '.data';
            assert.equal(null, storageManager.directGet(urlKey), 'Successful operative event url should be deleted');
            assert.equal(null, storageManager.directGet(dataKey), 'Successful operative event data should be deleted');
            done();
        }).catch((error) => {
            done(new Error('Send succesful operative event failed: ' + error));
        });
    });

    it('Send failed operative event', function(done: MochaDone) {
        let nativeBridge: NativeBridge = new NativeBridge(new MockBridge());
        let request: MockRequest = new MockRequest(nativeBridge);
        let storageManager: MockStorageManager = new MockStorageManager(nativeBridge);
        let eventManager: EventManager = new EventManager(nativeBridge, request, storageManager);

        let eventId: string = '1234';
        let sessionId: string = '5678';
        let url: string = 'https://www.example.net/fail';
        let data: string = 'Test data';

        let requestSpy = sinon.spy(request, 'post');

        eventManager.operativeEvent('test', eventId, sessionId, url, data).then(() => {
            done(new Error('Send failed operative failed to fail'));
        }, () => {
            assert(requestSpy.calledOnce);
            assert.equal(url, requestSpy.getCall(0).args[0], 'Operative event url does not match');
            assert.equal(data, requestSpy.getCall(0).args[1], 'Operative event data does not match');

            let urlKey: string = 'session.' + sessionId + '.operative.' + eventId + '.url';
            let dataKey: string = 'session.' + sessionId + '.operative.' + eventId + '.data';
            assert.equal(url, storageManager.directGet(urlKey), 'Failed operative event url was not correctly stored');
            assert.equal(data, storageManager.directGet(dataKey), 'Failed operative event data was not correctly stored');
            done();
        }).catch((error) => {
            done(new Error('Send failed operative event failed: ' + error));
        });
    });

    it('Send third party event', function(done: MochaDone) {
        let nativeBridge: NativeBridge = new NativeBridge(new MockBridge());
        let request: MockRequest = new MockRequest(nativeBridge);
        let storageManager: MockStorageManager = new MockStorageManager(nativeBridge);
        let eventManager: EventManager = new EventManager(nativeBridge, request, storageManager);

        let sessionId: string = '1234';
        let url: string = 'https://www.example.net/third_party_event';

        let requestSpy = sinon.spy(request, 'get');

        eventManager.thirdPartyEvent('Test event', sessionId, url).then(() => {
            assert(requestSpy.calledOnce);
            assert.equal(url, requestSpy.getCall(0).args[0], 'Third party event url does not match');
            done();
        }).catch((error) => {
            done(new Error('Send failed operative event failed: ' + error));
        });
    });

    it('Send diagnostic event', function(done: MochaDone) {
        let nativeBridge: NativeBridge = new NativeBridge(new MockBridge());
        let request: MockRequest = new MockRequest(nativeBridge);
        let storageManager: MockStorageManager = new MockStorageManager(nativeBridge);
        let eventManager: EventManager = new EventManager(nativeBridge, request, storageManager);

        let url: string = 'https://www.example.net/diagnostic_event';
        let data: string = 'Test Data';

        let requestSpy = sinon.spy(request, 'post');

        eventManager.diagnosticEvent(url, data).then(() => {
            assert(requestSpy.calledOnce);
            assert.equal(url, requestSpy.getCall(0).args[0], 'Diagnostic event url does not match');
            assert.equal(data, requestSpy.getCall(0).args[1], 'Diagnostic event data does not match');
            done();
        }).catch((error) => {
            done(new Error('Send failed operative event failed: ' + error));
      });
    });
});