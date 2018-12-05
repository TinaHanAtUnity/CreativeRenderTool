import { Backend } from 'Backend/Backend';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { CacheBookkeepingManager } from 'Core/Managers/CacheBookkeepingManager';
import { CacheManager, CacheStatus } from 'Core/Managers/CacheManager';
import { RequestManager } from 'Core/Managers/RequestManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { FileId } from 'Core/Utilities/FileId';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';

[Platform.ANDROID, Platform.IOS].forEach((platform) => {
    describe(Platform[platform] + ' - CacheManagerTest', () => {

        let backend: Backend;
        let nativeBridge: NativeBridge;
        let core: ICoreApi;
        let wakeUpManager: WakeUpManager;
        let requestManager: RequestManager;
        let cacheBookkeeping: CacheBookkeepingManager;
        let cacheManager: CacheManager;

        beforeEach(() => {
            backend = new Backend(platform);
            nativeBridge = new NativeBridge(backend, platform, false);
            backend.setNativeBridge(nativeBridge);
            core = TestFixtures.getCoreApi(nativeBridge);
            wakeUpManager = new WakeUpManager(core);
            requestManager = new RequestManager(nativeBridge.getPlatform(), core, wakeUpManager);
            cacheBookkeeping = new CacheBookkeepingManager(core);
            cacheManager = new CacheManager(core, wakeUpManager, requestManager, cacheBookkeeping);
        });

        it('Get local file url for cached file', () => {
            const testUrl: string = 'http://www.example.net/test.mp4';
            const testFileUrl = 'file:///test/cache/dir/UnityAdsCache--960478764.mp4';

            backend.Api.Cache.addPreviouslyDownloadedFile(testUrl);

            return FileId.getFileId(testUrl, core.Cache).then(fileId => FileId.getFileUrl(fileId, core.Cache)).then(fileUrl => {
                assert.equal(testFileUrl, fileUrl, 'Local file url does not match');
            });
        });

        it('Cache one file with success', () => {
            const testUrl: string = 'http://www.example.net/test.mp4';
            const testFileUrl = 'file:///test/cache/dir/UnityAdsCache--960478764.mp4';

            const cacheSpy = sinon.spy(backend.Api.Cache, 'download');

            return cacheManager.cache(testUrl).then(([fileId, fileUrl]) => {
                assert(cacheSpy.calledOnce, 'Cache one file did not send download request');
                assert.equal(fileId, '-960478764.mp4', 'Cache fileId did not match');
                assert.equal(testUrl, cacheSpy.getCall(0).args[0], 'Cache one file download request url does not match');
                assert.equal(testFileUrl, fileUrl, 'Local file url does not match');
            }).then(() => {
                cacheSpy.restore();
            });
        });

        it('Cache three files with success', () => {
            const testUrl1: string = 'http://www.example.net/first.jpg';
            const testUrl2: string = 'http://www.example.net/second.jpg';
            const testUrl3: string = 'http://www.example.net/third.jpg';
            const testFileUrl1: string = 'file:///test/cache/dir/UnityAdsCache-1647395140.jpg';
            const testFileUrl2: string = 'file:///test/cache/dir/UnityAdsCache-158720486.jpg';
            const testFileUrl3: string = 'file:///test/cache/dir/UnityAdsCache-929022075.jpg';

            const cacheSpy = sinon.spy(backend.Api.Cache, 'download');

            return cacheManager.cache(testUrl1).then(([fileId, fileUrl]) => {
                assert.equal(testUrl1, cacheSpy.getCall(0).args[0], 'Cache three files first download request url does not match');
                assert.equal(fileId, '1647395140.jpg', 'Cache three files first fileId does not match');
                assert.equal(testFileUrl1, fileUrl, 'Cache three files first local file url does not match');
            }).then(() => cacheManager.cache(testUrl2)).then(([fileId, fileUrl]) => {
                assert.equal(testUrl2, cacheSpy.getCall(1).args[0], 'Cache three files second download request url does not match');
                assert.equal(fileId, '158720486.jpg', 'Cache three files second fileId does not match');
                assert.equal(testFileUrl2, fileUrl, 'Cache three files second local file url does not match');
            }).then(() => cacheManager.cache(testUrl3)).then(([fileId, fileUrl]) => {
                assert.equal(testUrl3, cacheSpy.getCall(2).args[0], 'Cache three files third download request url does not match');
                assert.equal(fileId, '929022075.jpg', 'Cache three files third fileId does not match');
                assert.equal(testFileUrl3, fileUrl, 'Cache three files third local file url does not match');
            }).then(() => {
                assert.equal(3, cacheSpy.callCount, 'Cache three files did not send three download requests');
                cacheSpy.restore();
            });
        });

        it('Cache one file with network failure', () => {
            const testUrl: string = 'http://www.example.net/test.mp4';
            let networkTriggered: boolean = false;

            backend.Api.Cache.setInternet(false);
            const cachePromise = cacheManager.cache(testUrl);
            networkTriggered = true;
            backend.Api.Cache.setInternet(true);
            wakeUpManager.onNetworkConnected.trigger();
            cachePromise.then(fileUrl => {
                assert(!networkTriggered, 'Cache one file with network failure: network was not triggered');
            });
        });

        it('Cache one file with repeated network failures (expect to fail)', () => {
            const testUrl: string = 'http://www.example.net/test.mp4';
            let networkTriggers: number = 0;

            const triggerNetwork = () => {
                networkTriggers++;
                wakeUpManager.onNetworkConnected.trigger();
            };

            backend.Api.Cache.setInternet(false);
            const cachePromise = cacheManager.cache(testUrl);
            triggerNetwork();
            triggerNetwork();
            triggerNetwork();
            cachePromise.then(() => {
                assert.fail('Cache one file with repeated network failures: caching should not be successful with no internet');
            }).catch(error => {
                assert.equal(networkTriggers, 3, 'Cache one file with repeated network failures: caching should have retried exactly three times');
            });
        });

        it('Stop caching', () => {
            const testUrl: string = 'http://www.example.net/test.mp4';

            backend.Api.Cache.setInternet(false);
            const cachePromise = cacheManager.cache(testUrl);
            cacheManager.stop();
            cachePromise.then(() => {
                assert.fail('Caching should fail when stopped');
            }).catch(error => {
                assert.equal(error, CacheStatus.STOPPED, 'Cache status not STOPPED after caching was stopped');
            });
        });

        it('Cache one already downloaded file', () => {
            const testUrl: string = 'http://www.example.net/test.mp4';
            const testFileUrl: string = 'file:///test/cache/dir/UnityAdsCache--960478764.mp4';

            backend.Api.Cache.addPreviouslyDownloadedFile(testUrl);
            cacheBookkeeping.writeFileEntry(backend.Api.Cache.getHashDirect(testUrl) + '.' + backend.Api.Cache.getExtension(testUrl), {
                fullyDownloaded: true,
                size: 123,
                totalSize: 123,
                extension: 'mp4'
            });

            return cacheManager.cache(testUrl).then(([fileId, fileUrl]) => {
                assert.equal(fileId, '-960478764.mp4', 'Cache fileId did not match');
                assert.equal(testFileUrl, fileUrl, 'Local file url does not match');
            });
        });

    });
});
