import 'mocha';
import { assert } from 'chai';
import { Backend } from 'Backend/Backend';
import { ICoreApi } from 'Core/ICore';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Platform } from 'Core/Constants/Platform';
import { UnityInfo } from 'Core/Models/UnityInfo';

describe('UnityInfoTest', () => {
    const appId: string = 'test.app';
    const userId: string = '123456acbdef';
    const sessionId: string = '12345';

    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    let unityInfo: UnityInfo;

    describe('on Android', () => {
        beforeEach(() => {
            backend = TestFixtures.getBackend(Platform.ANDROID);
            nativeBridge = TestFixtures.getNativeBridge(Platform.ANDROID, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            unityInfo = new UnityInfo(Platform.ANDROID, core);
        });

        it('should return undefined identifiers when Unity engine is not running', () => {
            backend.Api.Preferences.setUnityEngineRunning(false);
            return unityInfo.fetch(appId).then(() => {
                assert.isUndefined(unityInfo.getAnalyticsUserId(), 'analytics user id was defined when engine is not running (Android)');
                assert.isUndefined(unityInfo.getAnalyticsSessionId(), 'analytics session id was defined when engine is not running (Android)');
            });
        });

        it('should return Unity Analytics identifiers when Unity engine is running', () => {
            backend.Api.Preferences.setUnityEngineRunning(true);
            return unityInfo.fetch(appId).then(() => {
                assert.equal(unityInfo.getAnalyticsUserId(), userId, 'analytics user id was not successfully fetched (Android)');
                assert.equal(unityInfo.getAnalyticsSessionId(), sessionId, 'analytics session id was not successfully fetched (Android)');
            });
        });
    });

    describe('on iOS', () => {
        beforeEach(() => {
            backend = TestFixtures.getBackend(Platform.IOS);
            nativeBridge = TestFixtures.getNativeBridge(Platform.IOS, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            unityInfo = new UnityInfo(Platform.IOS, core);
        });

        it('should return undefined identifiers when Unity engine is not running', () => {
            backend.Api.Preferences.setUnityEngineRunning(false);
            return unityInfo.fetch(appId).then(() => {
                assert.isUndefined(unityInfo.getAnalyticsUserId(), 'analytics user id was defined when engine is not running (iOS)');
                assert.isUndefined(unityInfo.getAnalyticsSessionId(), 'analytics session id was defined when engine is not running (iOS)');
            });
        });

        it('should return Unity Analytics identifiers when Unity engine is running', () => {
            backend.Api.Preferences.setUnityEngineRunning(true);
            return unityInfo.fetch(appId).then(() => {
                assert.equal(unityInfo.getAnalyticsUserId(), userId, 'analytics user id was not successfully fetched (iOS)');
                assert.equal(unityInfo.getAnalyticsSessionId(), sessionId, 'analytics session id was not successfully fetched (iOS)');
            });
        });

    });
});
