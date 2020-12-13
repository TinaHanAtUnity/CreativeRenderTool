import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { FocusManager } from 'Core/Managers/FocusManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { RequestManager } from 'Core/Managers/RequestManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { StorageType } from 'Core/Native/Storage';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { PrivacySDK } from 'Privacy/PrivacySDK';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
class TestHelper {
    static waitForStorageBatch(storageBridge) {
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
    let platform;
    let backend;
    let nativeBridge;
    let core;
    let ads;
    let storageBridge;
    let focusManager;
    let operativeEventManager;
    let deviceInfo;
    let clientInfo;
    let thirdPartyEventManager;
    let request;
    let metaDataManager;
    let sessionManager;
    let privacySDK;
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
        privacySDK = sinon.createStubInstance(PrivacySDK);
        const privacyManager = sinon.createStubInstance(UserPrivacyManager);
        thirdPartyEventManager = new ThirdPartyEventManager(core, request);
        sessionManager = new SessionManager(core, request, storageBridge);
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
            campaign: TestFixtures.getCampaign(),
            playerMetadataServerId: 'test-gamerSid',
            privacySDK: privacySDK,
            userPrivacyManager: privacyManager
        });
    });
    xit('Retry failed event', () => {
        const url = 'https://www.example.net/retry_event';
        const data = 'Retry test';
        const sessionId = 'abcd-1234';
        const eventId = '5678-efgh';
        const sessionTsKey = 'session.' + sessionId + '.ts';
        const urlKey = 'session.' + sessionId + '.operative.' + eventId + '.url';
        const dataKey = 'session.' + sessionId + '.operative.' + eventId + '.data';
        backend.Api.Storage.set(StorageType.PRIVATE, sessionTsKey, Date.now() - 100);
        backend.Api.Storage.set(StorageType.PRIVATE, urlKey, url);
        backend.Api.Storage.set(StorageType.PRIVATE, dataKey, data);
        const requestSpy = sinon.spy(request, 'post');
        return sessionManager.sendUnsentSessions().then(() => {
            assert(requestSpy.calledOnce, 'Retry failed event did not send POST request');
            assert.equal(url, requestSpy.getCall(0).args[0], 'Retry failed event url does not match');
            assert.equal(data, requestSpy.getCall(0).args[1], 'Retry failed event data does not match');
            return backend.Api.Storage.get(StorageType.PRIVATE, urlKey).then(() => {
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
    it('Retry failed pts event', () => {
        const url = 'https://www.example.net/retry_event';
        const sessionId = 'abcd-1234';
        const eventId = '5678-efgh';
        const sessionTsKey = 'session.' + sessionId + '.ts';
        const ptsUrlKey = 'session.' + sessionId + '.ptsevent.' + eventId + '.url';
        backend.Api.Storage.set(StorageType.PRIVATE, sessionTsKey, Date.now() - 100);
        backend.Api.Storage.set(StorageType.PRIVATE, ptsUrlKey, url);
        const requestGetSpy = sinon.spy(request, 'get');
        return sessionManager.sendUnsentSessions().then(() => {
            assert(requestGetSpy.calledOnce, 'Retry failed event did not send POST request');
            assert.equal(url, requestGetSpy.getCall(0).args[0], 'PTS retry failed event url does not match');
        });
    });
    it('Start new session', () => {
        const sessionId = 'new-12345';
        const sessionTsKey = 'session.' + sessionId + '.ts';
        const storagePromise = TestHelper.waitForStorageBatch(storageBridge);
        sessionManager.startNewSession(sessionId);
        return storagePromise.then(() => {
            return backend.Api.Storage.get(StorageType.PRIVATE, sessionTsKey).then(timestamp => {
                assert.equal(true, Date.now() >= timestamp, 'New session timestamp must be in present or past');
                assert.equal(false, backend.Api.Storage.isDirty(), 'Storage should not be left dirty after starting new session');
            });
        });
    });
    it('Delete old session', () => {
        const sessionId = 'old-1234';
        const sessionTsKey = 'session.' + sessionId + '.ts';
        const threeMonthsAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
        backend.Api.Storage.set(StorageType.PRIVATE, sessionTsKey, threeMonthsAgo);
        const storagePromise = TestHelper.waitForStorageBatch(storageBridge);
        return sessionManager.sendUnsentSessions().then(() => {
            return storagePromise;
        }).then(() => {
            return backend.Api.Storage.get(StorageType.PRIVATE, sessionTsKey).then(() => {
                assert.fail('Old session found in storage but it should have been deleted');
            }).catch(error => {
                assert.equal('COULDNT_GET_VALUE', error[0], 'Old session should have been deleted');
            }).then(() => {
                assert.equal(false, backend.Api.Storage.isDirty(), 'Storage should not be left dirty after deleting old session');
            });
        });
    });
    it('Delete session without timestamp', () => {
        const randomKey = 'session.random123.operative.456.test';
        backend.Api.Storage.set(StorageType.PRIVATE, randomKey, 'test');
        const storagePromise = TestHelper.waitForStorageBatch(storageBridge);
        return sessionManager.sendUnsentSessions().then(() => {
            return storagePromise;
        }).then(() => {
            return backend.Api.Storage.get(StorageType.PRIVATE, randomKey).then(() => {
                assert.fail('Session without timestamp found in storage but it should have been deleted');
            }).catch(error => {
                assert.equal('COULDNT_GET_VALUE', error[0], 'Session without timestamp should have been deleted');
            }).then(() => {
                assert.equal(false, backend.Api.Storage.isDirty(), 'Storage should not be left dirty after deleting session without timestamp');
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2Vzc2lvbk1hbmFnZXJUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vdGVzdC9Vbml0L0Fkcy9TZXNzaW9uTWFuYWdlclRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFFLDRCQUE0QixFQUFFLE1BQU0sMkNBQTJDLENBQUM7QUFDekYsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQzdELE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBRTdFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDOUIsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRW5ELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFFaEUsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzlELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUk1RCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDbEQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzdELE9BQU8sT0FBTyxDQUFDO0FBQ2YsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUM7QUFDL0IsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ3hELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUNoRCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUVyRSxNQUFNLFVBQVU7SUFDTCxNQUFNLENBQUMsbUJBQW1CLENBQUMsYUFBNEI7UUFDMUQsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFN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