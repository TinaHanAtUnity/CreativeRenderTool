import 'mocha';
import { assert } from 'chai';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Platform } from 'Core/Constants/Platform';
import { UnityInfo } from 'Core/Models/UnityInfo';

class TestHelper {
    public static getAnalyticsRunningTest(platform: Platform): Promise<void> {
        const unityInfo = TestHelper.getUnityInfo(platform, true);

        return unityInfo.fetch(TestHelper._appId).then(() => {
            assert.equal(unityInfo.getAnalyticsUserId(), TestHelper._userId, 'analytics user id was not successfully fetched');
            assert.equal(unityInfo.getAnalyticsSessionId(), TestHelper._sessionId, 'analytics session id was not successfully fetched');
        });
    }

    public static getAnalyticsNotRunningTest(platform: Platform): Promise<void> {
        const unityInfo = TestHelper.getUnityInfo(platform, false);

        return unityInfo.fetch(TestHelper._appId).then(() => {
            assert.isUndefined(unityInfo.getAnalyticsUserId(), 'analytics user id was defined when engine is not running');
            assert.isUndefined(unityInfo.getAnalyticsSessionId(), 'analytics session id was defined when engine is not running');
        });
    }

    private static _appId: string = 'test.app';
    private static _userId: string = '123456acbdef';
    private static _sessionId: string = '12345';

    private static getUnityInfo(platform: Platform, analyticsRunning: boolean): UnityInfo {
        const backend = TestFixtures.getBackend(platform);
        backend.Api.Preferences.setUnityEngineRunning(analyticsRunning);
        const nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        const core = TestFixtures.getCoreApi(nativeBridge);
        return new UnityInfo(platform, core);
    }
}

describe('UnityInfoTest', () => {
    describe('on Android', () => {
        it('should return undefined identifiers when Unity engine is not running', () => {
            return TestHelper.getAnalyticsNotRunningTest(Platform.ANDROID);
        });

        it('should return Unity Analytics identifiers when Unity engine is running', () => {
            return TestHelper.getAnalyticsRunningTest(Platform.ANDROID);
        });
    });

    describe('on iOS', () => {
        it('should return undefined identifiers when Unity engine is not running', () => {
            return TestHelper.getAnalyticsNotRunningTest(Platform.IOS);
        });

        it('should return Unity Analytics identifiers when Unity engine is running', () => {
            return TestHelper.getAnalyticsRunningTest(Platform.IOS);
        });
    });
});
