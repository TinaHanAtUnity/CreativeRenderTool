import 'mocha';
import { assert } from 'chai';
import { Backend } from 'Backend/Backend';
import { ICoreApi } from 'Core/ICore';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Platform } from 'Core/Constants/Platform';
import { UnityInfo } from 'Core/Models/UnityInfo';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('UnityInfoTest - ' + Platform[platform], () => {
        const appId: string = 'test.app';
        const userId: string = '123456acbdef';
        const sessionId: string = '12345';

        let backend: Backend;
        let nativeBridge: NativeBridge;
        let core: ICoreApi;
        let unityInfo: UnityInfo;

        beforeEach(() => {
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            unityInfo = new UnityInfo(platform, core);
        });

        it('should return undefined identifiers when Unity engine is not running', () => {
            backend.Api.Preferences.setUnityEngineRunning(false);
            return unityInfo.fetch(appId).then(() => {
                assert.isUndefined(unityInfo.getAnalyticsUserId(), 'analytics user id was defined when engine is not running');
                assert.isUndefined(unityInfo.getAnalyticsSessionId(), 'analytics session id was defined when engine is not running');
            });
        });

        it('should return Unity Analytics identifiers when Unity engine is running', () => {
            backend.Api.Preferences.setUnityEngineRunning(true);
            return unityInfo.fetch(appId).then(() => {
                assert.equal(unityInfo.getAnalyticsUserId(), userId, 'analytics user id was not successfully fetched');
                assert.equal(unityInfo.getAnalyticsSessionId(), sessionId, 'analytics session id was not successfully fetched');
            });
        });
    });
});
