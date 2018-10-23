import { OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { FocusManager } from 'Core/Managers/FocusManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import { StorageType } from 'Core/Native/Storage';

import { RequestManager } from 'Core/Managers/RequestManager';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Backend } from 'Backend/Backend';
import { ICoreApi } from 'Core/ICore';
import { IAdsApi } from 'Ads/IAds';
import Test = Mocha.Test;

class TestHelper {
    public static waitForStorageBatch(storageBridge: StorageBridge): Promise<void> {
        return new Promise((resolve, reject) => {
            const storageObserver = () => {
                storageBridge.onPrivateStorageWrite.unsubscribe(storageObserver);
                resolve();
            };
            storageBridge.onPrivateStorageWrite.subscribe(storageObserver);
        });
    }
}

describe('SessionManagerTest', () => {
    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    let ads: IAdsApi;
    let storageBridge: StorageBridge;
    let focusManager: FocusManager;
    let operativeEventManager: OperativeEventManager;
    let deviceInfo: AndroidDeviceInfo;
    let clientInfo: ClientInfo;
    let thirdPartyEventManager: ThirdPartyEventManager;
    let request: RequestManager;
    let metaDataManager: MetaDataManager;
    let sessionManager: SessionManager;

    beforeEach(() => {
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        ads = TestFixtures.getAdsApi(nativeBridge);

        storageBridge = new StorageBridge(core, 1);
        metaDataManager = new MetaDataManager(core);
        focusManager = new FocusManager(platform, core);
        request = new RequestManager(platform, core, new WakeUpManager(core));
        thirdPartyEventManager = new ThirdPartyEventManager(core, request);
        const wakeUpManager = new WakeUpManager(core);
        request = new RequestManager(platform, core, wakeUpManager);
        clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
        deviceInfo = TestFixtures.getAndroidDeviceInfo(core);

        thirdPartyEventManager = new ThirdPartyEventManager(core, request);
        sessionManager = new SessionManager(core.Storage, request, storageBridge);
        operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager({
            platform,
            core,
            ads,
            request: request,
            metaDataManager: metaDataManager,
            sessionManager: sessionManager,
            clientInfo: clientInfo,
            deviceInfo: deviceInfo,
            coreConfig: TestFixtures.getCoreConfiguration(),
            adsConfig: TestFixtures.getAdsConfiguration(),
            storageBridge: storageBridge,
            campaign: TestFixtures.getCampaign()
        });
    });

    xit('Retry failed event', () => {
        const url: string = 'https://www.example.net/retry_event';
        const data: string = 'Retry test';
        const sessionId: string = 'abcd-1234';
        const eventId: string = '5678-efgh';

        const sessionTsKey: string = 'session.' + sessionId + '.ts';
        const urlKey: string = 'session.' + sessionId + '.operative.' + eventId + '.url';
        const dataKey: string = 'session.' + sessionId + '.operative.' + eventId + '.data';

        backend.Api.Storage.set(StorageType.PRIVATE, sessionTsKey, Date.now() - 100);
        backend.Api.Storage.set(StorageType.PRIVATE, urlKey, url);
        backend.Api.Storage.set(StorageType.PRIVATE, dataKey, data);

        const requestSpy = sinon.spy(request, 'post');

        return sessionManager.sendUnsentSessions().then(() => {
            assert(requestSpy.calledOnce, 'Retry failed event did not send POST request');
            assert.equal(url, requestSpy.getCall(0).args[0], 'Retry failed event url does not match');
            assert.equal(data, requestSpy.getCall(0).args[1], 'Retry failed event data does not match');
            return backend.Api.Storage.get<string>(StorageType.PRIVATE, urlKey).then(() => {
                assert.fail('Retried event url should be deleted from storage');
            }).catch(error => {
                assert.equal('COULDNT_GET_VALUE', error[0], 'Retried event url should be deleted from storage');
            }).then(() => {
                return backend.Api.Storage.get(StorageType.PRIVATE, dataKey);
            }).then(() => {
                assert.fail('Retried event data should be deleted from storage');
            }).catch(error => {
                assert.equal('COULDNT_GET_VALUE', error[0], 'Retried event data should be deleted from storage');
            }).then(() => {
                assert.equal(false, backend.Api.Storage.isDirty(), 'Storage should not be left dirty after retry failed event');
            });
        });
    });

    it('Start new session', () => {
        const sessionId: string = 'new-12345';
        const sessionTsKey: string = 'session.' + sessionId + '.ts';

        const storagePromise = TestHelper.waitForStorageBatch(storageBridge);

        sessionManager.startNewSession(sessionId);

        return storagePromise.then(() => {
            return backend.Api.Storage.get<number>(StorageType.PRIVATE, sessionTsKey).then(timestamp => {
                assert.equal(true, Date.now() >= timestamp, 'New session timestamp must be in present or past');
                assert.equal(false, backend.Api.Storage.isDirty(), 'Storage should not be left dirty after starting new session');
            });
        });
    });

    it('Delete old session', () => {
        const sessionId: string = 'old-1234';
        const sessionTsKey: string = 'session.' + sessionId + '.ts';
        const threeMonthsAgo: number = Date.now() - 90 * 24 * 60 * 60 * 1000;

        backend.Api.Storage.set(StorageType.PRIVATE, sessionTsKey, threeMonthsAgo);

        const storagePromise = TestHelper.waitForStorageBatch(storageBridge);

        return sessionManager.sendUnsentSessions().then(() => {
            return storagePromise;
        }).then(() => {
            return backend.Api.Storage.get<number>(StorageType.PRIVATE, sessionTsKey).then(() => {
                assert.fail('Old session found in storage but it should have been deleted');
            }).catch(error => {
                assert.equal('COULDNT_GET_VALUE', error[0], 'Old session should have been deleted');
            }).then(() => {
                assert.equal(false, backend.Api.Storage.isDirty(), 'Storage should not be left dirty after deleting old session');
            });
        });
    });

    it('Delete session without timestamp', () => {
        const randomKey: string = 'session.random123.operative.456.test';

        backend.Api.Storage.set(StorageType.PRIVATE, randomKey, 'test');

        const storagePromise = TestHelper.waitForStorageBatch(storageBridge);

        return sessionManager.sendUnsentSessions().then(() => {
            return storagePromise;
        }).then(() => {
            return backend.Api.Storage.get<number>(StorageType.PRIVATE, randomKey).then(() => {
                assert.fail('Session without timestamp found in storage but it should have been deleted');
            }).catch(error => {
                assert.equal('COULDNT_GET_VALUE', error[0], 'Session without timestamp should have been deleted');
            }).then(() => {
                assert.equal(false, backend.Api.Storage.isDirty(), 'Storage should not be left dirty after deleting session without timestamp');
            });
        });
    });
});
