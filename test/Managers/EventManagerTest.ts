import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { Request } from 'Utilities/Request';
import { EventManager } from 'Managers/EventManager';
import { StorageApi, StorageType } from 'Native/Api/Storage';
import { RequestApi } from 'Native/Api/Request';
import { DeviceInfoApi } from 'Native/Api/DeviceInfo';
import { NativeBridge } from 'Native/NativeBridge';
import { WakeUpManager } from 'Managers/WakeUpManager';

class TestStorageApi extends StorageApi {

    private _storage = {};
    private _dirty: boolean = false;

    public set<T>(storageType: StorageType, key: string, value: T): Promise<void> {
        this._dirty = true;
        this._storage = this.setInMemoryValue(this._storage, key, value);
        return Promise.resolve(void(0));
    }

    public get<T>(storageType: StorageType, key: string): Promise<T> {
        let retValue = this.getInMemoryValue(this._storage, key);
        if(!retValue) {
            return Promise.reject(['COULDNT_GET_VALUE', key]);
        }
        return Promise.resolve(retValue);
    }

    public getKeys(storageType: StorageType, key: string, recursive: boolean): Promise<string[]> {
        return Promise.resolve(this.getInMemoryKeys(this._storage, key));
    }

    public write(storageType: StorageType): Promise<void> {
        this._dirty = false;
        return Promise.resolve(void(0));
    }

    public delete(storageType: StorageType, key: string): Promise<void> {
        this._dirty = true;
        this._storage = this.deleteInMemoryValue(this._storage, key);
        return Promise.resolve(void(0));
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

class TestRequestApi extends RequestApi {

    public get(id: string, url: string, headers?: [string, string][]): Promise<string> {
        if(url.indexOf('/fail') !== -1) {
            setTimeout(() => {
                this._nativeBridge.handleEvent(['REQUEST', 'FAILED', id, url, 'Fail response']);
            }, 0);
        } else {
            setTimeout(() => {
                this._nativeBridge.handleEvent(['REQUEST', 'COMPLETE', id, url, 'Success response', 200, headers]);
            }, 0);
        }
        return Promise.resolve(id);
    }

    public post(id: string, url: string, body?: string, headers?: [string, string][]): Promise<string> {
        if(url.indexOf('/fail') !== -1) {
            setTimeout(() => {
                this._nativeBridge.handleEvent(['REQUEST', 'FAILED', id, url, 'Fail response']);
            }, 0);
        } else {
            setTimeout(() => {
                this._nativeBridge.handleEvent(['REQUEST', 'COMPLETE', id, url, 'Success response', 200, headers]);
            }, 0);
        }
        return Promise.resolve(id);
    }

}

class TestDeviceInfoApi extends DeviceInfoApi {

    private _testId: string;

    public getUniqueEventId(): Promise<string> {
        return Promise.resolve(this._testId);
    }

    public setTestId(testId: string) {
        this._testId = testId;
    }

}

describe('EventManagerTest', () => {
    let handleInvocation = sinon.spy();
    let handleCallback = sinon.spy();
    let nativeBridge: NativeBridge;

    let storageApi: TestStorageApi;
    let requestApi: TestRequestApi;
    let request: Request;
    let eventManager: EventManager;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });

        storageApi = nativeBridge.Storage = new TestStorageApi(nativeBridge);
        requestApi = nativeBridge.Request = new TestRequestApi(nativeBridge);
        request = new Request(nativeBridge, new WakeUpManager(nativeBridge));
        eventManager = new EventManager(nativeBridge, request);
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
            return storageApi.get<string>(StorageType.PRIVATE, urlKey).catch(error => {
                let errorCode = error.shift();
                assert.equal('COULDNT_GET_VALUE', errorCode, 'Successful operative event url should be deleted');
            }).then(() => {
                return storageApi.get(StorageType.PRIVATE, dataKey);
            }).catch(error => {
                let errorCode = error.shift();
                assert.equal('COULDNT_GET_VALUE', errorCode, 'Successful operative event data should be deleted');
            }).then(() => {
                assert.equal(false, storageApi.isDirty(), 'Storage should not be left dirty after successful operative event');
            });
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
        }).catch(() => {
            assert(requestSpy.calledOnce, 'Failed operative event did not try sending POST request');
            assert.equal(url, requestSpy.getCall(0).args[0], 'Operative event url does not match');
            assert.equal(data, requestSpy.getCall(0).args[1], 'Operative event data does not match');

            let urlKey: string = 'session.' + sessionId + '.operative.' + eventId + '.url';
            let dataKey: string = 'session.' + sessionId + '.operative.' + eventId + '.data';
            return storageApi.get<string>(StorageType.PRIVATE, urlKey).then(storedUrl => {
                assert.equal(url, storedUrl, 'Failed operative event url was not correctly stored');
            }).then(() => {
                return storageApi.get<string>(StorageType.PRIVATE, dataKey);
            }).then(storedData => {
                assert.equal(data, storedData, 'Failed operative event data was not correctly stored');
                assert.equal(false, storageApi.isDirty(), 'Storage should not be left dirty after failed operative event');
            });
        });
        clock.tick(30000);
        clock.restore();
        return event;
    });

    it('Send click attribution event', () => {
        let sessionId: string = '1234';
        let url: string = 'https://www.example.net/third_party_event';

        let requestSpy = sinon.spy(request, 'get');

        return eventManager.clickAttributionEvent(sessionId, url, false).then(() => {
            assert(requestSpy.calledOnce, 'Click attribution event did not try sending GET request');
            assert.equal(url, requestSpy.getCall(0).args[0], 'Click attribution event url does not match');
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

        let sessionTsKey: string = 'session.' + sessionId + '.ts';
        let urlKey: string = 'session.' + sessionId + '.operative.' + eventId + '.url';
        let dataKey: string = 'session.' + sessionId + '.operative.' + eventId + '.data';

        storageApi.set(StorageType.PRIVATE, sessionTsKey, Date.now() - 100);
        storageApi.set(StorageType.PRIVATE, urlKey, url);
        storageApi.set(StorageType.PRIVATE, dataKey, data);

        let requestSpy = sinon.spy(request, 'post');

        return eventManager.sendUnsentSessions().then(() => {
            assert(requestSpy.calledOnce, 'Retry failed event did not send POST request');
            assert.equal(url, requestSpy.getCall(0).args[0], 'Retry failed event url does not match');
            assert.equal(data, requestSpy.getCall(0).args[1], 'Retry failed event data does not match');
            return storageApi.get<string>(StorageType.PRIVATE, urlKey).then(() => {
                assert.fail('Retried event url should be deleted from storage');
            }).catch(error => {
                assert.equal('COULDNT_GET_VALUE', error[0], 'Retried event url should be deleted from storage');
            }).then(() => {
                return storageApi.get(StorageType.PRIVATE, dataKey);
            }).then(() => {
                assert.fail('Retried event data should be deleted from storage');
            }).catch(error => {
                assert.equal('COULDNT_GET_VALUE', error[0], 'Retried event data should be deleted from storage');
            }).then(() => {
                assert.equal(false, storageApi.isDirty(), 'Storage should not be left dirty after retry failed event');
            });
        });
    });

    it('Start new session', () => {
        let sessionId: string = 'new-12345';
        let sessionTsKey: string = 'session.' + sessionId + '.ts';

        return eventManager.startNewSession(sessionId).then(() => {
            return storageApi.get<number>(StorageType.PRIVATE, sessionTsKey).then(timestamp => {
                assert.equal(true, Date.now() >= timestamp, 'New session timestamp must be in present or past');
                assert.equal(false, storageApi.isDirty(), 'Storage should not be left dirty after starting new session');
            });
        });
    });

    it('Delete old session', () => {
        let sessionId: string = 'old-1234';
        let sessionTsKey: string = 'session.' + sessionId + '.ts';
        let threeMonthsAgo: number = Date.now() - 90 * 24 * 60 * 60 * 1000;

        storageApi.set(StorageType.PRIVATE, sessionTsKey, threeMonthsAgo);

        return eventManager.sendUnsentSessions().then(() => {
            return storageApi.get<number>(StorageType.PRIVATE, sessionTsKey).then(() => {
                assert.fail('Old session found in storage but it should have been deleted');
            }).catch(error => {
                assert.equal('COULDNT_GET_VALUE', error[0], 'Old session should have been deleted');
            }).then(() => {
                assert.equal(false, storageApi.isDirty(), 'Storage should not be left dirty after deleting old session');
            });
        });
    });

    it('Delete session without timestamp', () => {
        let randomKey: string = 'session.random123.operative.456.test';

        storageApi.set(StorageType.PRIVATE, randomKey, 'test');

        return eventManager.sendUnsentSessions().then(() => {
            return storageApi.get<number>(StorageType.PRIVATE, randomKey).then(() => {
                assert.fail('Session without timestamp found in storage but it should have been deleted');
            }).catch(error => {
                assert.equal('COULDNT_GET_VALUE', error[0], 'Session without timestamp should have been deleted');
            }).then(() => {
                assert.equal(false, storageApi.isDirty(), 'Storage should not be left dirty after deleting session without timestamp');
            });
        });
    });

    it('Get unique event id', () => {
        let testId: string = '1234-5678';
        let deviceInfoApi: TestDeviceInfoApi = nativeBridge.DeviceInfo = new TestDeviceInfoApi(nativeBridge);
        deviceInfoApi.setTestId(testId);

        return eventManager.getUniqueEventId().then(uniqueId => {
            assert.equal(testId, uniqueId, 'Unique id does not match what native API returned');
        });
    });
});
