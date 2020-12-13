import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { CacheBookkeepingManager } from 'Core/Managers/CacheBookkeepingManager';
import { CacheManager, CacheStatus } from 'Core/Managers/CacheManager';
import { RequestManager } from 'Core/Managers/RequestManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { FileId } from 'Core/Utilities/FileId';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
[Platform.ANDROID, Platform.IOS].forEach((platform) => {
    describe(Platform[platform] + ' - CacheManagerTest', () => {
        let backend;
        let nativeBridge;
        let core;
        let wakeUpManager;
        let requestManager;
        let cacheBookkeeping;
        let cacheManager;
        beforeEach(() => {
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            wakeUpManager = new WakeUpManager(core);
            requestManager = new RequestManager(nativeBridge.getPlatform(), core, wakeUpManager);
            cacheBookkeeping = new CacheBookkeepingManager(core);
            cacheManager = new CacheManager(core, wakeUpManager, requestManager, cacheBookkeeping);
        });
        it('Get local file url for cached file', () => {
            const testUrl = 'http://www.example.net/test.mp4';
            const testFileUrl = 'file:///test/cache/dir/UnityAdsCache--960478764.mp4';
            backend.Api.Cache.addPreviouslyDownloadedFile(testUrl);
            return FileId.getFileId(testUrl, core.Cache).then(fileId => FileId.getFileUrl(fileId, core.Cache)).then(fileUrl => {
                assert.equal(testFileUrl, fileUrl, 'Local file url does not match');
            });
        });
        it('Cache one file with success', () => {
            const testUrl = 'http://www.example.net/test.mp4';
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
            const testUrl1 = 'http://www.example.net/first.jpg';
            const testUrl2 = 'http://www.example.net/second.jpg';
            const testUrl3 = 'http://www.example.net/third.jpg';
            const testFileUrl1 = 'file:///test/cache/dir/UnityAdsCache-1647395140.jpg';
            const testFileUrl2 = 'file:///test/cache/dir/UnityAdsCache-158720486.jpg';
            const testFileUrl3 = 'file:///test/cache/dir/UnityAdsCache-929022075.jpg';
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
            const testUrl = 'http://www.example.net/test.mp4';
            let networkTriggered = false;
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
            const testUrl = 'http://www.example.net/test.mp4';
            let networkTriggers = 0;
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
            const testUrl = 'http://www.example.net/test.mp4';
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
            const testUrl = 'http://www.example.net/test.mp4';
            const testFileUrl = 'file:///test/cache/dir/UnityAdsCache--960478764.mp4';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FjaGVNYW5hZ2VyVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Rlc3QvVW5pdC9Db3JlL01hbmFnZXJzL0NhY2hlTWFuYWdlclRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUM5QixPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFFbkQsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFDaEYsT0FBTyxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUN2RSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDOUQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBRTVELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUMvQyxPQUFPLE9BQU8sQ0FBQztBQUNmLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFDO0FBQy9CLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUV4RCxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFO0lBQ2xELFFBQVEsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEdBQUcscUJBQXFCLEVBQUUsR0FBRyxFQUFFO1FBRXRELElBQUksT0FBZ0IsQ0FBQztRQUNyQixJQUFJLFlBQTBCLENBQUM7UUFDL0IsSUFBSSxJQUFjLENBQUM7UUFDbkIsSUFBSSxhQUE0QixDQUFDO1FBQ2pDLElBQUksY0FBOEIsQ0FBQztRQUNuQyxJQUFJLGdCQUF5QyxDQUFDO1FBQzlDLElBQUksWUFBMEIsQ0FBQztRQUUvQixVQUFVLENBQUMsR0FBRyxFQUFFO1lBQ1osT0FB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