import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { Request } from 'Utilities/Request';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { StorageApi, StorageType } from 'Native/Api/Storage';
import { RequestApi } from 'Native/Api/Request';
import { NativeBridge } from 'Native/NativeBridge';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { FocusManager } from 'Managers/FocusManager';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { DeviceInfo } from 'Models/DeviceInfo';
import { ClientInfo } from 'Models/ClientInfo';
import { TestFixtures } from 'Test/Unit/TestHelpers/TestFixtures';
import { Platform } from 'Constants/Platform';
import { SessionManager } from 'Managers/SessionManager';
import { MetaDataManager } from 'Managers/MetaDataManager';

class TestStorageApi extends StorageApi {

    private _storage = {};
    private _dirty: boolean = false;

    public set<T>(storageType: StorageType, key: string, value: T): Promise<void> {
        this._dirty = true;
        this._storage = this.setInMemoryValue(this._storage, key, value);
        return Promise.resolve(void(0));
    }

    public get<T>(storageType: StorageType, key: string): Promise<T> {
        const retValue = this.getInMemoryValue(this._storage, key);
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

    private setInMemoryValue(storage: { [key: string]: any }, key: string, value: any): {} {
        const keyArray: string[] = key.split('.');

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

    private getInMemoryValue(storage: { [key: string]: any }, key: string): any {
        const keyArray: string[] = key.split('.');

        if(keyArray.length > 1) {
            if(!storage[keyArray[0]]) {
                return null;
            }

            return this.getInMemoryValue(storage[keyArray[0]], keyArray.slice(1).join('.'));
        } else {
            return storage[key];
        }
    }

    private getInMemoryKeys(storage: { [key: string]: any }, key: string): string[] {
        const keyArray: string[] = key.split('.');

        if(keyArray.length > 1) {
            if(!storage[keyArray[0]]) {
                return [];
            }

            return this.getInMemoryKeys(storage[keyArray[0]], keyArray.slice(1).join('.'));
        } else {
            if(!storage[key]) {
                return [];
            }

            const retArray: string[] = [];
            for(const property in storage[key]) {
                if(storage.hasOwnProperty(key)) {
                    retArray.push(property);
                }
            }

            return retArray;
        }
    }

    private deleteInMemoryValue(storage: { [key: string]: any }, key: string): {} {
        const keyArray: string[] = key.split('.');

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

    public get(id: string, url: string, headers?: Array<[string, string]>): Promise<string> {
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

    public post(id: string, url: string, body?: string, headers?: Array<[string, string]>): Promise<string> {
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

describe('SessionManagerTest', () => {
    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge;

    let storageApi: TestStorageApi;
    let requestApi: TestRequestApi;
    let focusManager: FocusManager;
    let operativeEventManager: OperativeEventManager;
    let deviceInfo: DeviceInfo;
    let clientInfo: ClientInfo;
    let thirdPartyEventManager: ThirdPartyEventManager;
    let request: Request;
    let metaDataManager: MetaDataManager;
    let sessionManager: SessionManager;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });

        metaDataManager = new MetaDataManager(nativeBridge);
        focusManager = new FocusManager(nativeBridge);
        storageApi = nativeBridge.Storage = new TestStorageApi(nativeBridge);
        requestApi = nativeBridge.Request = new TestRequestApi(nativeBridge);
        request = new Request(nativeBridge, new WakeUpManager(nativeBridge, focusManager));
        thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
        const wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
        request = new Request(nativeBridge, wakeUpManager);
        clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
        deviceInfo = TestFixtures.getDeviceInfo(Platform.ANDROID);

        thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
        sessionManager = new SessionManager(nativeBridge);
        operativeEventManager = new OperativeEventManager(nativeBridge, request, metaDataManager, sessionManager, clientInfo, deviceInfo);
    });

    xit('Retry failed event', () => {
        const url: string = 'https://www.example.net/retry_event';
        const data: string = 'Retry test';
        const sessionId: string = 'abcd-1234';
        const eventId: string = '5678-efgh';

        const sessionTsKey: string = 'session.' + sessionId + '.ts';
        const urlKey: string = 'session.' + sessionId + '.operative.' + eventId + '.url';
        const dataKey: string = 'session.' + sessionId + '.operative.' + eventId + '.data';

        storageApi.set(StorageType.PRIVATE, sessionTsKey, Date.now() - 100);
        storageApi.set(StorageType.PRIVATE, urlKey, url);
        storageApi.set(StorageType.PRIVATE, dataKey, data);

        const requestSpy = sinon.spy(request, 'post');

        return sessionManager.sendUnsentSessions(operativeEventManager).then(() => {
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
        const sessionId: string = 'new-12345';
        const sessionTsKey: string = 'session.' + sessionId + '.ts';

        return sessionManager.startNewSession(sessionId).then(() => {
            return storageApi.get<number>(StorageType.PRIVATE, sessionTsKey).then(timestamp => {
                assert.equal(true, Date.now() >= timestamp, 'New session timestamp must be in present or past');
                assert.equal(false, storageApi.isDirty(), 'Storage should not be left dirty after starting new session');
            });
        });
    });

    it('Delete old session', () => {
        const sessionId: string = 'old-1234';
        const sessionTsKey: string = 'session.' + sessionId + '.ts';
        const threeMonthsAgo: number = Date.now() - 90 * 24 * 60 * 60 * 1000;

        storageApi.set(StorageType.PRIVATE, sessionTsKey, threeMonthsAgo);

        return sessionManager.sendUnsentSessions(operativeEventManager).then(() => {
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
        const randomKey: string = 'session.random123.operative.456.test';

        storageApi.set(StorageType.PRIVATE, randomKey, 'test');

        return sessionManager.sendUnsentSessions(operativeEventManager).then(() => {
            return storageApi.get<number>(StorageType.PRIVATE, randomKey).then(() => {
                assert.fail('Session without timestamp found in storage but it should have been deleted');
            }).catch(error => {
                assert.equal('COULDNT_GET_VALUE', error[0], 'Session without timestamp should have been deleted');
            }).then(() => {
                assert.equal(false, storageApi.isDirty(), 'Storage should not be left dirty after deleting session without timestamp');
            });
        });
    });
});
