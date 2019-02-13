import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Platform } from 'Core/Constants/Platform';
import { DownloadColumn, DownloadDestination, DownloadVisibility } from 'China/Native/Android/Download';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { IChinaApi } from 'China/IChina';

describe('DownloadApi', () => {
    let handleInvocation = sinon.spy();
    let nativeBridge: NativeBridge;
    let china: IChinaApi;

    beforeEach(() => {
        const platform = Platform.ANDROID;
        const backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        china = TestFixtures.getChinaApi(nativeBridge);
        handleInvocation = sinon.spy(backend, 'handleInvocation');
    });

    it('should call Download.enqueue on native bridge', () => {
        const downloadData = {
            url: 'http://cdn-in-china.com/game.apk',
            title: 'Title',
            description: 'Description',
            visibility: DownloadVisibility.VISIBLE_NOTIFY_COMPLETED,
            destination: DownloadDestination.DEFAULT,
            headers: Array<[string, string]>(),
            updateIntervalMillis: 1000,
            maxUpdateCount: 500
        };

        china.Android.Download.enqueue(downloadData);
        sinon.assert.calledWith(handleInvocation, JSON.stringify([['com.unity3d.services.china.api.Download', 'enqueue', [downloadData], '1']]));
    });

    it('should call Download.query on native bridge', () => {
        china.Android.Download.query(1, [DownloadColumn.BYTES_DOWNLOADED_SO_FAR]);
        sinon.assert.calledWith(handleInvocation, JSON.stringify([['com.unity3d.services.china.api.Download', 'query', [1, ['bytes_so_far']], '1']]));
    });

    it('should call Download.subscribeDownloadId on native bridge', () => {
        china.Android.Download.subscribeDownloadId(1, 10, 100);
        sinon.assert.calledWith(handleInvocation, JSON.stringify([['com.unity3d.services.china.api.Download', 'subscribeDownloadId', [1, 10, 100], '1']]));
    });

    it('should call Download.getUriForDownloadedFile on native bridge', () => {
        china.Android.Download.getUriForDownloadedFile(1);
        sinon.assert.calledWith(handleInvocation, JSON.stringify([['com.unity3d.services.china.api.Download', 'getUriForDownloadedFile', [1], '1']]));
    });

    it('should call Download.unsubscribeDownloadId on native bridge', () => {
        china.Android.Download.unsubscribeDownloadId(1);
        sinon.assert.calledWith(handleInvocation, JSON.stringify([['com.unity3d.services.china.api.Download', 'unsubscribeDownloadId', [1], '1']]));
    });

    it('should trigger onCompleted', () => {
        const spy = sinon.spy();
        china.Android.Download.onCompleted.subscribe(spy);
        china.Android.Download.handleEvent('COMPLETE', [1, {'status': 2, 'reason': 3}]);
        sinon.assert.calledWith(spy, 1, {'status': 2, 'reason': 3});
    });

    it('should trigger onClicked', () => {
        const spy = sinon.spy();
        china.Android.Download.onClicked.subscribe(spy);
        china.Android.Download.handleEvent('CLICKED', [1, {'status': 2, 'reason': 3}]);
        sinon.assert.calledWith(spy, 1, {'status': 2, 'reason': 3});
    });

    it('should trigger onUpdated', () => {
        const spy = sinon.spy();
        china.Android.Download.onUpdated.subscribe(spy);
        china.Android.Download.handleEvent('UPDATE', [1, {
            'status': 2,
            'reason': 3,
            'bytes_so_far': 1000,
            'total_size': 2000
        }]);
        sinon.assert.calledWith(spy, 1, {'status': 2, 'reason': 3, 'bytes_so_far': 1000, 'total_size': 2000});
    });

    it('should throw', () => {
        assert.throws(() => {
            china.Android.Download.handleEvent('INVALID', []);
        });
    });
});
