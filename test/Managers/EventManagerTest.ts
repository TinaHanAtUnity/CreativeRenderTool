import { Request } from '../../src/ts/Utilities/Request';
import { EventManager } from '../../src/ts/Managers/EventManager';
import { TestBridge, TestBridgeApi } from '../TestBridge';

import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';
import { StorageApi, StorageType } from '../../src/ts/Native/Api/Storage';

class Storage extends TestBridgeApi {
    private _storage = {};
    private _dirty: boolean = false;

    public set(storageType: string, key: string, value: any) {
        this._dirty = true;
        this._storage = this.setInMemoryValue(this._storage, key, value);
        return ['OK', key, value];
    }

    public get(storageType: string, key: string) {
        let retValue = this.getInMemoryValue(this._storage, key);
        if(!retValue) {
            return ['ERROR', 'COULDNT_GET_VALUE', key];
        }
        return ['OK', retValue];
    }

    public getKeys(storageType: string, key: string, recursive: boolean) {
        let retValue: string[] = this.getInMemoryKeys(this._storage, key);
        if(!retValue) {
            return ['OK', []];
        }
        return ['OK', retValue];
    }

    public write(storageType: string) {
        this._dirty = false;
        return ['OK', storageType];
    }

    public delete(storageType: string, key: string) {
        this._dirty = true;
        this._storage = this.deleteInMemoryValue(this._storage, key);
        return ['OK', storageType];
    }

    public isDirty(): boolean {
        return this._dirty;
    }

    private setInMemoryValue(storage: {}, key: string, value: any): {} {
        let keyArray: string[] = key.split('.');

        if(keyArray.length > 1) {
            if(!storage[keyArray[0]]) {
                storage[keyArray[0]] = {};
            }

            storage[keyArray[0]] = this.setInMemoryValue(storage[keyArray[0]], keyArray.slice(1).join('.'), value);
            return storage;
        } else {
            storage[keyArray[0]] = value;
            return storage;
        }
    }

    private getInMemoryValue(storage: {}, key: string): any {
        let keyArray: string[] = key.split('.');

        if(keyArray.length > 1) {
            if(!storage[keyArray[0]]) {
                return null;
            }

            return this.getInMemoryValue(storage[keyArray[0]], keyArray.slice(1).join('.'));
        } else {
            return storage[key];
        }
    }

    private getInMemoryKeys(storage: {}, key: string): string[] {
        let keyArray: string[] = key.split('.');

        if(keyArray.length > 1) {
            if(!storage[keyArray[0]]) {
                return [];
            }

            return this.getInMemoryKeys(storage[keyArray[0]], keyArray.slice(1).join('.'));
        } else {
            if(!storage[key]) {
                return [];
            }

            let retArray: string[] = [];
            for(let property in storage[key]) {
                if(storage.hasOwnProperty(key)) {
                    retArray.push(property);
                }
            }

            return retArray;
        }
    }

    private deleteInMemoryValue(storage: {}, key: string): {} {
        let keyArray: string[] = key.split('.');

        if(keyArray.length > 1) {
            if(!storage[keyArray[0]]) {
                storage[keyArray[0]] = {};
            }

            storage[keyArray[0]] = this.deleteInMemoryValue(storage[keyArray[0]], keyArray.slice(1).join('.'));
            return storage;
        } else {
            delete storage[keyArray[0]];
            return storage;
        }
    }
}

class Url extends TestBridgeApi {
    public get(id: string, url: string, headers?: [string, string][]): any[] {
        if(url.indexOf('/fail') !== -1) {
            setTimeout(() => {
                this.getNativeBridge().handleEvent(['URL', 'FAILED', id, url, 'Fail response']);
            }, 0);
        } else {
            setTimeout(() => {
                this.getNativeBridge().handleEvent(['URL', 'COMPLETE', id, url, 'Success response', 200, headers]);
            }, 0);
        }

        return ['OK'];
    }

    public post(id: string, url: string, body?: string, headers?: [string, string][]): any[] {
        if(url.indexOf('/fail') !== -1) {
            setTimeout(() => {
                this.getNativeBridge().handleEvent(['URL', 'FAILED', id, url, 'Fail response']);
            }, 0);
        } else {
            setTimeout(() => {
                this.getNativeBridge().handleEvent(['URL', 'COMPLETE', id, url, 'Success response', 200, headers]);
            }, 0);
        }

        return ['OK'];
    }
}

class DeviceInfo extends TestBridgeApi {
    private _testId: string;

    public getUniqueEventId(): any[] {
        return ['OK', this._testId];
    }

    public setTestId(testId: string) {
        this._testId = testId;
    }
}

class Sdk extends TestBridgeApi {
    public logInfo(message: string) {
        return ['OK'];
    }
}

describe('EventManagerTest', () => {
    let testBridge: TestBridge;
    let storageApi: Storage;
    let urlApi: Url;
    let request: Request;
    let eventManager: EventManager;

    beforeEach(() => {
        testBridge = new TestBridge();
        storageApi = new Storage();
        urlApi = new Url();
        testBridge.setApi('Url', urlApi);
        testBridge.setApi('Storage', storageApi);
        testBridge.setApi('Sdk', new Sdk());
        request = new Request();
        eventManager = new EventManager(request);
    });

    it('Send successful operative event', () => {
        let eventId: string = '1234';
        let sessionId: string = '5678';
        let url: string = 'https://www.example.net/operative_event';
        let data: string = 'Test data';

        let requestSpy = sinon.spy(request, 'post');

        return eventManager.operativeEvent('test', eventId, sessionId, url, data).then(() => {
            assert(requestSpy.calledOnce, 'Operative event did not send POST request');
            assert.equal(url, requestSpy.getCall(0).args[0], 'Operative event url does not match');
            assert.equal(data, requestSpy.getCall(0).args[1], 'Operative event data does not match');

            let urlKey: string = 'session.' + sessionId + '.operative.' + eventId + '.url';
            let dataKey: string = 'session.' + sessionId + '.operative.' + eventId + '.data';
            assert.equal('COULDNT_GET_VALUE', storageApi.get('PRIVATE', urlKey)[1], 'Successful operative event url should be deleted');
            assert.equal('COULDNT_GET_VALUE', storageApi.get('PRIVATE', dataKey)[1], 'Successful operative event data should be deleted');
            assert.equal(false, storageApi.isDirty(), 'Store should not be left dirty after successful operative event');
        });
    });

    it('Send failed operative event', () => {
        let clock = sinon.useFakeTimers();

        let eventId: string = '1234';
        let sessionId: string = '5678';
        let url: string = 'https://www.example.net/fail';
        let data: string = 'Test data';

        let requestSpy = sinon.spy(request, 'post');

        let event = eventManager.operativeEvent('test', eventId, sessionId, url, data).then(() => {
            assert.fail('Send failed operative event failed to fail');
        }, () => {
            assert(requestSpy.calledOnce, 'Failed operative event did not try sending POST request');
            assert.equal(url, requestSpy.getCall(0).args[0], 'Operative event url does not match');
            assert.equal(data, requestSpy.getCall(0).args[1], 'Operative event data does not match');

            let urlKey: string = 'session.' + sessionId + '.operative.' + eventId + '.url';
            let dataKey: string = 'session.' + sessionId + '.operative.' + eventId + '.data';
            assert.equal(url, storageApi.get('PRIVATE', urlKey)[1], 'Failed operative event url was not correctly stored');
            assert.equal(data, storageApi.get('PRIVATE', dataKey)[1], 'Failed operative event data was not correctly stored');
            assert.equal(false, storageApi.isDirty(), 'Store should not be left dirty after failed operative event');
        });
        clock.tick(30000);
        clock.restore();
        return event;
    });

    it('Send third party event', () => {
        let sessionId: string = '1234';
        let url: string = 'https://www.example.net/third_party_event';

        let requestSpy = sinon.spy(request, 'get');

        return eventManager.thirdPartyEvent('Test event', sessionId, url).then(() => {
            assert(requestSpy.calledOnce, 'Third party event did not try sending GET request');
            assert.equal(url, requestSpy.getCall(0).args[0], 'Third party event url does not match');
        });
    });

    it('Send diagnostic event', () => {
        let url: string = 'https://www.example.net/diagnostic_event';
        let data: string = 'Test Data';

        let requestSpy = sinon.spy(request, 'post');

        return eventManager.diagnosticEvent(url, data).then(() => {
            assert(requestSpy.calledOnce, 'Diagnostic event did not try sending POST request');
            assert.equal(url, requestSpy.getCall(0).args[0], 'Diagnostic event url does not match');
            assert.equal(data, requestSpy.getCall(0).args[1], 'Diagnostic event data does not match');
        });
    });

    it('Retry failed event', () => {
        let url: string = 'https://www.example.net/retry_event';
        let data: string = 'Retry test';
        let sessionId: string = 'abcd-1234';
        let eventId: string = '5678-efgh';

        let urlKey: string = 'session.' + sessionId + '.operative.' + eventId + '.url';
        let dataKey: string = 'session.' + sessionId + '.operative.' + eventId + '.data';

        StorageApi.set(StorageType.PRIVATE, urlKey, url);
        StorageApi.set(StorageType.PRIVATE, dataKey, data);

        let requestSpy = sinon.spy(request, 'post');

        return eventManager.sendUnsentSessions().then(() => {
            assert(requestSpy.calledOnce, 'Retry failed event did not send POST request');
            assert.equal(url, requestSpy.getCall(0).args[0], 'Retry failed event url does not match');
            assert.equal(data, requestSpy.getCall(0).args[1], 'Retry failed event data does not match');
            assert.equal('COULDNT_GET_VALUE', storageApi.get('PRIVATE', urlKey)[1], 'Retried event url should be deleted');
            assert.equal('COULDNT_GET_VALUE', storageApi.get('PRIVATE', dataKey)[1], 'Retried event data should be deleted');
            assert.equal(false, storageApi.isDirty(), 'Store should not be left dirty after retry failed event');
        });
    });

    it('Get unique event id', () => {
        let testId: string = '1234-5678';
        let deviceInfoApi: DeviceInfo = new DeviceInfo();
        testBridge.setApi('DeviceInfo', deviceInfoApi);
        deviceInfoApi.setTestId(testId);

        return eventManager.getUniqueEventId().then(uniqueId => {
            assert.equal(testId, uniqueId, 'Unique id does not match what native API returned');
        });
    });
});
