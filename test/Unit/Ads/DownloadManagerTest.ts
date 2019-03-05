import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { DownloadDirectory, DownloadDestination, DownloadStatus, DownloadReason, IDownloadQueryResult } from 'China/Native/Android/Download';
import { AndroidPermission } from 'Core/Native/Android/Permissions';
import { DownloadMessage, DownloadManager, DownloadState, DownloadStorageKey } from 'China/Managers/DownloadManager';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { StorageType } from 'Core/Native/Storage';
import { Platform } from 'Core/Constants/Platform';
import { PermissionsUtil, PermissionTypes} from 'Core/Utilities/Permissions';
import { IntentFlag } from 'Core/Native/Android/Intent';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { ICoreApi } from 'Core/ICore';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Observable2 } from 'Core/Utilities/Observable';
import { BuildVerionCode } from 'Core/Constants/Android/BuildVerionCode';
import { IChinaApi } from 'China/IChina';

describe('DownloadManagerTest', () => {
    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    const sandbox = sinon.createSandbox();
    let nativeBridge: NativeBridge;
    let deviceInfo: AndroidDeviceInfo;
    let core: ICoreApi;
    let china: IChinaApi;
    let downloadManager: DownloadManager;

    let onDownloadCompletedCallbacks = <any>[];
    let onDownloadUpdateCallbacks = <any>[];

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        }, Platform.ANDROID);

        const platform = Platform.ANDROID;
        const backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        china = TestFixtures.getChinaApi(nativeBridge);
        deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
        downloadManager = new DownloadManager(core, china, deviceInfo.getApiLevel());

        sandbox.stub(china.Android.Download.onCompleted, 'subscribe')
            .callsFake((callback: any) => {
                onDownloadCompletedCallbacks.push(callback);
                return new Observable2();
            });

        sandbox.stub(china.Android.Download.onUpdated, 'subscribe')
            .callsFake((callback: any) => {
                onDownloadUpdateCallbacks.push(callback);
                return new Observable2();
            });
    });

    afterEach(() => {
        sandbox.restore();

        onDownloadCompletedCallbacks = [];
        onDownloadUpdateCallbacks = [];
    });

    describe('when subscribing stored download ids', () => {
        beforeEach(() => {
            sandbox.stub(china.Android.Download, 'subscribeDownloadId').resolves();
        });

        it('should read download ids from cache with native storage API', () => {
            sandbox.stub(core.Storage, 'get').resolves();
            return downloadManager.restoreStoredDownloadIds().then(() => {
                sinon.assert.calledWith(<sinon.SinonSpy>core.Storage.get, StorageType.PRIVATE, DownloadStorageKey.ENQUEUED_DOWNLOADS);
            });
        });

        describe('and no download ids are stored', () => {
            beforeEach(() => {
                sandbox.stub(core.Storage, 'get').resolves(undefined);
            });

            it('should not subscribe any download id', () => {
                return downloadManager.restoreStoredDownloadIds().then(() => {
                    sinon.assert.notCalled(<sinon.SinonSpy>china.Android.Download.subscribeDownloadId);
                });
            });
        });

        describe('and download ids exist in storage', () => {
            describe('and download ids is invalid', () => {
                it('should reject', () => {
                    sandbox.stub(core.Storage, 'get').resolves('non json string invalid download ids');
                    return downloadManager.restoreStoredDownloadIds().then(() => {
                        throw new Error('should not resolve because download ids is invalid');
                    }).catch(() => {
                        // error expected
                    });
                });
            });

            describe('and download ids is valid', () => {
                it('should call subscribe download ids in native API once for one entry', () => {
                    const tempDict: { [url: string]: number } = {};
                    tempDict['http://www.someurl.com'] = 123;

                    sandbox.stub(core.Storage, 'get').resolves(JSON.stringify(tempDict));
                    return downloadManager.restoreStoredDownloadIds().then(() => {
                        sinon.assert.calledOnce(<sinon.SinonSpy>china.Android.Download.subscribeDownloadId);
                    });
                });

                it('should call subscribe download ids in native API thrice for three entries', () => {
                    const tempDict: { [url: string]: number } = {};
                    tempDict['http://www.someurl.com'] = 123;
                    tempDict['http://www.otherurl.com'] = 124;
                    tempDict['http://www.anotherurl.com'] = 9999;

                    sandbox.stub(core.Storage, 'get').resolves(JSON.stringify(tempDict));
                    return downloadManager.restoreStoredDownloadIds().then(() => {
                        sinon.assert.calledThrice(<sinon.SinonSpy>china.Android.Download.subscribeDownloadId);
                    });
                });
            });
        });
    });

    describe('when downloading APK', () => {
        const url = 'http://cdn-in-china.com/game.apk';
        const title = 'Title';
        const description = 'Description';
        const visibility = 1;
        const mimeType = 'application/vnd.android.package-archive';
        const directory = DownloadDirectory.DOWNLOADS;
        const filename = 'game.apk';
        const destination = DownloadDestination.PUBLIC_DIR;
        const updateIntervalMillis = 1000;
        const maxUpdateCount = 600;

        beforeEach(() => {
            sandbox.stub(Diagnostics, 'trigger');
            sandbox.stub(downloadManager.onDownloadUpdate, 'trigger');
        });

        it('should check for write permissions', () => {
            sandbox.stub(PermissionsUtil, 'checkPermissions').resolves();

            return downloadManager.download(url, title, description).then(() => {
                sinon.assert.calledWith(<sinon.SinonSpy>PermissionsUtil.checkPermissions, Platform.ANDROID, core, PermissionTypes.WRITE_EXTERNAL_STORAGE);
            });
        });

        describe('and write permission is already granted', () => {
            let enqueueStub: sinon.SinonStub;
            let queryStub: sinon.SinonStub;

            beforeEach(() => {
                sandbox.stub(core.Permissions.Android!, 'checkPermission').resolves(0);
                sinon.spy(core.Android!.Intent, 'launch');
                enqueueStub = sandbox.stub(china.Android.Download, 'enqueue');
                queryStub = sandbox.stub(china.Android.Download, 'query');

                sandbox.stub(china.Android.Download, 'getUriForDownloadedFile').resolves(url);
            });

            it('should call enqueue once', () => {
                enqueueStub.resolves(1);

                return downloadManager.download(url, title, description).then(() => {
                    sinon.assert.calledOnce(enqueueStub);
                });
            });

            it('should call enqueue with parameters', () => {
                enqueueStub.resolves(1);
                return downloadManager.download(url, title, description).then(() => {
                    sinon.assert.calledWith(enqueueStub, {
                        url,
                        title,
                        description,
                        visibility,
                        mimeType,
                        directory,
                        filename,
                        destination,
                        updateIntervalMillis,
                        maxUpdateCount
                    });
                });
            });

            it('should return an error if trying to enqueue when enqueuing is in progress', () => {
                enqueueStub.resolves(1);
                downloadManager.download(url, title, description);

                return downloadManager.download(url, title, description).catch((error) => {
                    assert.equal(error.message, 'Enqueuing is in progress');
                });
            });

            it('should only subscribe onCompleted listener once with concurrent downloads', () => {
                enqueueStub.resolves(1);
                const url2 = 'http://another-cdn-in-china.com/another_game.apk';
                const title2 = 'Title 2';
                const description2 = 'Description 2';

                return downloadManager.download(url, title, description).then(() => {
                    enqueueStub.resolves(2);
                    return downloadManager.download(url2, title2, description2).then(() => {
                        sinon.assert.calledOnce(<sinon.SinonSpy>china.Android.Download.onCompleted.subscribe);
                    });
                });
            });

            it('should only subscribe onUpdated listener once with concurrent downloads', () => {
                enqueueStub.resolves(1);
                const url2 = 'http://another-cdn-in-china.com/another_game.apk';
                const title2 = 'Title 2';
                const description2 = 'Description 2';

                return downloadManager.download(url, title, description).then(() => {
                    enqueueStub.resolves(2);
                    return downloadManager.download(url2, title2, description2).then(() => {
                        sinon.assert.calledOnce(<sinon.SinonSpy>china.Android.Download.onUpdated.subscribe);
                    });
                });
            });

            describe('and there is a download already enqueued', () => {
                beforeEach(() => {
                    enqueueStub.resolves(1);
                });

                describe('and is active', () => {
                    it('should not enqueue same URL concurrently', () => {
                        queryStub.resolves({'status': DownloadStatus.RUNNING, 'reason': DownloadReason.NONE});
                        return downloadManager.download(url, title, description).then(() => {
                            assert.equal(downloadManager.enqueuedDownloads[url], 1);

                            downloadManager.download(url, title, description).catch(() => {
                                sinon.assert.calledOnce(enqueueStub);
                                assert.equal(downloadManager.enqueuedDownloads[url], 1);
                            });
                        });
                    });

                    it('should not fallback to view intent if url is already enqueued', () => {
                        queryStub.resolves({'status': DownloadStatus.RUNNING, 'reason': DownloadReason.NONE});
                        return downloadManager.download(url, title, description).then(() => {
                            assert.equal(downloadManager.enqueuedDownloads[url], 1);

                            downloadManager.download(url, title, description).catch(() => {
                                sinon.assert.notCalled(<sinon.SinonSpy>core.Android!.Intent.launch);
                            });
                        });
                    });

                    it('should return error download is running', () => {
                        queryStub.resolves({'status': DownloadStatus.RUNNING, 'reason': DownloadReason.NONE});
                        return downloadManager.download(url, title, description).then(() => {
                            assert.equal(downloadManager.enqueuedDownloads[url], 1);

                            downloadManager.download(url, title, description).catch((error) => {
                                assert.equal(error.message, 'Download already enqueued');
                            });
                        });
                    });

                    it('should return download already enqueued error when download is pending', () => {
                        queryStub.resolves({'status': DownloadStatus.PENDING, 'reason': DownloadReason.NONE});
                        return downloadManager.download(url, title, description).then(() => {
                            assert.equal(downloadManager.enqueuedDownloads[url], 1);

                            downloadManager.download(url, title, description).catch((error) => {
                                assert.equal(error.message, 'Download already enqueued');
                            });
                        });
                    });

                    it('should return download already enqueued error status query fails', () => {
                        queryStub.rejects();
                        return downloadManager.download(url, title, description).then(() => {
                            assert.equal(downloadManager.enqueuedDownloads[url], 1);

                            downloadManager.download(url, title, description).catch((error) => {
                                assert.equal(error.message, 'Download already enqueued');
                            });
                        });
                    });

                    it('should return error when download', () => {
                        queryStub.resolves({'status': DownloadStatus.PENDING, 'reason': DownloadReason.NONE});
                        return downloadManager.download(url, title, description).then(() => {
                            assert.equal(downloadManager.enqueuedDownloads[url], 1);

                            downloadManager.download(url, title, description).catch((error) => {
                                assert.equal(error.message, 'Download already enqueued');
                            });
                        });
                    });

                    it('should return error when download is paused', () => {
                        queryStub.resolves({'status': DownloadStatus.PAUSED, 'reason': DownloadReason.NONE});
                        return downloadManager.download(url, title, description).then(() => {
                            assert.equal(downloadManager.enqueuedDownloads[url], 1);

                            downloadManager.download(url, title, description).catch((error) => {
                                assert.equal(error.message, 'Download already enqueued');
                            });
                        });
                    });
                });

                describe('and is not active', () => {
                    it('should still enqueue if download has status failed', () => {
                        queryStub.resolves({'status': DownloadStatus.FAILED, 'reason': DownloadReason.NONE});
                        return downloadManager.download(url, title, description).then(() => {
                            assert.equal(downloadManager.enqueuedDownloads[url], 1);

                            downloadManager.download(url, title, description).then(() => {
                                sinon.assert.calledTwice(enqueueStub);
                                assert.equal(downloadManager.enqueuedDownloads[url], 1);
                            });
                        });
                    });

                    it('should still enqueue if download has no status', () => {
                        queryStub.resolves({});
                        return downloadManager.download(url, title, description).then(() => {
                            assert.equal(downloadManager.enqueuedDownloads[url], 1);

                            downloadManager.download(url, title, description).then(() => {
                                sinon.assert.calledTwice(enqueueStub);
                                assert.equal(downloadManager.enqueuedDownloads[url], 1);
                            });
                        });
                    });
                });
            });

            describe('and native Android enqueue is successful', () => {
                beforeEach(() => {
                    enqueueStub.resolves(1);
                });

                function mockDownloadSuccessfulTrigger(callback: any): void {
                    Object.keys(downloadManager.enqueuedDownloads).forEach((downloadUrl) => {
                        const downloadId = downloadManager.enqueuedDownloads[downloadUrl];
                        callback(downloadId, {'status': DownloadStatus.SUCCESSFUL, 'reason': DownloadReason.NONE});
                    });
                }

                it('should send diagnostic event on download start', () => {
                    return downloadManager.download(url, title, description).then(() => {
                        sinon.assert.calledWith(<sinon.SinonSpy>Diagnostics.trigger, 'download_started', {
                            url,
                            title,
                            description
                        });
                    });
                });

                it('should return download id', () => {
                    return downloadManager.download(url, title, description).then((downloadId) => {
                        assert.equal(downloadId, 1);
                    });
                });

                it('should return download id from getCurrentDownloadId()', () => {
                    return downloadManager.download(url, title, description).then(() => {
                        assert.equal(downloadManager.getCurrentDownloadId(), 1);
                    });
                });

                it('should save url to downloads map', () => {
                    return downloadManager.download(url, title, description).then(() => {
                        assert.equal(downloadManager.enqueuedDownloads[url], 1);
                    });
                });

                it('should enqueue different URLs concurrently', () => {
                    const url2 = 'http://another-cdn-in-china.com/another_game.apk';
                    const title2 = 'Title 2';
                    const description2 = 'Description 2';

                    return downloadManager.download(url, title, description).then(() => {
                        assert.equal(downloadManager.enqueuedDownloads[url], 1);

                        enqueueStub.resolves(2);

                        downloadManager.download(url2, title2, description2).then(() => {
                            sinon.assert.calledTwice(enqueueStub);
                            assert.equal(downloadManager.enqueuedDownloads[url2], 2);
                        });
                    });
                });

                describe('and download is completed', () => {
                    it('should remove url from downloads map', () => {
                        return downloadManager.download(url, title, description).then(() => {
                            onDownloadCompletedCallbacks.forEach(mockDownloadSuccessfulTrigger);
                            assert.isUndefined(downloadManager.enqueuedDownloads[url]);
                        });
                    });

                    it('should unsubscribe download id using native API', () => {
                        sandbox.stub(china.Android.Download, 'unsubscribeDownloadId');

                        return downloadManager.download(url, title, description).then(() => {
                            onDownloadCompletedCallbacks.forEach(mockDownloadSuccessfulTrigger);
                            sinon.assert.calledOnce(<sinon.SinonSpy>china.Android.Download.unsubscribeDownloadId);
                            sinon.assert.calledWith(<sinon.SinonSpy>china.Android.Download.unsubscribeDownloadId, 1);
                        });
                    });

                    it('should unsubscribe onCompleted observer', () => {
                        sandbox.stub(china.Android.Download.onCompleted, 'unsubscribe');

                        return downloadManager.download(url, title, description).then(() => {
                            onDownloadCompletedCallbacks.forEach(mockDownloadSuccessfulTrigger);
                            sinon.assert.calledOnce(<sinon.SinonSpy>china.Android.Download.onCompleted.unsubscribe);
                        });
                    });

                    it('should unsubscribe onUpdated observer', () => {
                        sandbox.stub(china.Android.Download.onUpdated, 'unsubscribe');

                        return downloadManager.download(url, title, description).then(() => {
                            onDownloadCompletedCallbacks.forEach(mockDownloadSuccessfulTrigger);
                            sinon.assert.calledOnce(<sinon.SinonSpy>china.Android.Download.onUpdated.unsubscribe);
                        });
                    });

                    it('should trigger download completed', () => {
                        return downloadManager.download(url, title, description).then(() => {
                            onDownloadCompletedCallbacks.forEach(mockDownloadSuccessfulTrigger);
                            sinon.assert.calledOnce(<sinon.SinonSpy>downloadManager.onDownloadUpdate.trigger);
                            sinon.assert.calledWith(<sinon.SinonSpy>downloadManager.onDownloadUpdate.trigger, 1, DownloadStatus.SUCCESSFUL, DownloadMessage.SUCCESS);
                        });
                    });

                    it('should set download state to ready', () => {
                        return downloadManager.download(url, title, description).then(() => {
                            onDownloadCompletedCallbacks.forEach(mockDownloadSuccessfulTrigger);
                            assert.equal(downloadManager.getState(), DownloadState.READY);
                        });
                    });

                    describe('when installing upon download success', () => {
                        it('should get uri of downloaded file', (resolve) => {
                            downloadManager.download(url, title, description).then((downloadId) => {
                                onDownloadCompletedCallbacks.forEach(mockDownloadSuccessfulTrigger);

                                setTimeout(() => {
                                    sinon.assert.calledOnce(<sinon.SinonSpy>china.Android.Download.getUriForDownloadedFile);
                                    sinon.assert.calledWith(<sinon.SinonSpy>china.Android.Download.getUriForDownloadedFile, downloadId);
                                    resolve();
                                }, 5);
                            });
                        });

                        describe('and API level is less than API 24', () => {
                            beforeEach(() => {
                                downloadManager = new DownloadManager(core, china, BuildVerionCode.M);
                            });

                            it('should launch install intent', (resolve) => {
                                downloadManager.download(url, title, description).then(() => {
                                    onDownloadCompletedCallbacks.forEach(mockDownloadSuccessfulTrigger);
                                    setTimeout(() => {
                                        sinon.assert.calledOnce(<sinon.SinonSpy>core.Android!.Intent.launch);
                                        sinon.assert.calledWith(<sinon.SinonSpy>core.Android!.Intent.launch, {
                                            'action': 'android.intent.action.VIEW',
                                            'uri': url,
                                            'mimeType': 'application/vnd.android.package-archive',
                                            'flags': IntentFlag.FLAG_ACTIVITY_NEW_TASK
                                        });
                                        resolve();
                                    }, 5);
                                });
                            });
                        });

                        describe('and API level is larger than or equal to API 24', () => {
                            beforeEach(() => {
                                downloadManager = new DownloadManager(core, china, BuildVerionCode.N);
                            });

                            it('should launch install intent with permission flag', (resolve) => {
                                downloadManager.download(url, title, description).then(() => {
                                    onDownloadCompletedCallbacks.forEach(mockDownloadSuccessfulTrigger);
                                    setTimeout(() => {
                                        sinon.assert.calledOnce(<sinon.SinonSpy>core.Android!.Intent.launch);
                                        sinon.assert.calledWith(<sinon.SinonSpy>core.Android!.Intent.launch, {
                                            'action': 'android.intent.action.VIEW',
                                            'uri': url,
                                            'mimeType': 'application/vnd.android.package-archive',
                                            'flags': IntentFlag.FLAG_GRANT_READ_URI_PERMISSION
                                        });
                                        resolve();
                                    }, 5);
                                });
                            });
                        });
                    });

                    it('should trigger error when completed with unknown status', () => {
                        const unknownStatus = 1234556;
                        return downloadManager.download(url, title, description).then(() => {
                            onDownloadCompletedCallbacks.forEach((callback: any) => {
                                callback(1, {
                                    'status': unknownStatus,
                                    'reason': 1111222
                                });
                            });
                            sinon.assert.calledOnce(<sinon.SinonSpy>downloadManager.onDownloadUpdate.trigger);
                            sinon.assert.calledWith(<sinon.SinonSpy>downloadManager.onDownloadUpdate.trigger, 1, unknownStatus, DownloadMessage.GENERIC_ERROR);
                        });
                    });

                    it('should trigger error when completed with canceled status', () => {
                        return downloadManager.download(url, title, description).then(() => {
                            onDownloadCompletedCallbacks.forEach((callback: any) => {
                                callback(1, {});
                            });
                            sinon.assert.calledOnce(<sinon.SinonSpy>downloadManager.onDownloadUpdate.trigger);
                            sinon.assert.calledWith(<sinon.SinonSpy>downloadManager.onDownloadUpdate.trigger, 1, DownloadStatus.FAILED, DownloadMessage.CANCELED_OR_NOT_FOUND);
                        });
                    });

                    it('should trigger error when completed with failed status', () => {
                        return downloadManager.download(url, title, description).then(() => {
                            onDownloadCompletedCallbacks.forEach((callback: any) => {
                                callback(1, {
                                    'status': DownloadStatus.FAILED,
                                    'reason': DownloadReason.ERROR_FILE_ALREADY_EXISTS
                                });
                            });
                            sinon.assert.calledOnce(<sinon.SinonSpy>downloadManager.onDownloadUpdate.trigger);
                            sinon.assert.calledWith(<sinon.SinonSpy>downloadManager.onDownloadUpdate.trigger, 1, DownloadStatus.FAILED, DownloadMessage.ERROR_FILE_ALREADY_EXISTS);
                        });
                    });
                });

                describe('and download is updated while running', () => {
                    describe('and download failed', () => {
                        function mockDownloadUpdateFailedStatus(callback: any): void {
                            callback(1, {
                                'status': DownloadStatus.FAILED,
                                'reason': DownloadReason.ERROR_INSUFFICIENT_SPACE
                            });
                        }

                        it('should unsubscribe download id using native API', () => {
                            sandbox.stub(china.Android.Download, 'unsubscribeDownloadId');

                            return downloadManager.download(url, title, description).then(() => {
                                onDownloadUpdateCallbacks.forEach(mockDownloadUpdateFailedStatus);
                                sinon.assert.calledOnce(<sinon.SinonSpy>china.Android.Download.unsubscribeDownloadId);
                                sinon.assert.calledWith(<sinon.SinonSpy>china.Android.Download.unsubscribeDownloadId, 1);
                            });
                        });

                        it('should remove url from downloads map when download is updated with failed status', () => {
                            return downloadManager.download(url, title, description).then(() => {
                                onDownloadUpdateCallbacks.forEach(mockDownloadUpdateFailedStatus);
                                assert.isUndefined(downloadManager.enqueuedDownloads[url]);
                            });
                        });

                        it('should unsubscribe onCompleted observer', () => {
                            sandbox.stub(china.Android.Download.onCompleted, 'unsubscribe');

                            return downloadManager.download(url, title, description).then(() => {
                                onDownloadUpdateCallbacks.forEach(mockDownloadUpdateFailedStatus);
                                sinon.assert.calledOnce(<sinon.SinonSpy>china.Android.Download.onCompleted.unsubscribe);
                                sinon.assert.calledWith(<sinon.SinonSpy>china.Android.Download.onCompleted.unsubscribe);

                            });
                        });

                        it('should unsubscribe onUpdated observer', () => {
                            sandbox.stub(china.Android.Download.onUpdated, 'unsubscribe');

                            return downloadManager.download(url, title, description).then(() => {
                                onDownloadUpdateCallbacks.forEach(mockDownloadUpdateFailedStatus);
                                sinon.assert.calledOnce(<sinon.SinonSpy>china.Android.Download.onUpdated.unsubscribe);
                            });
                        });

                        it('should trigger an error if download is updated with failed status', () => {
                            return downloadManager.download(url, title, description).then(() => {
                                onDownloadUpdateCallbacks.forEach(mockDownloadUpdateFailedStatus);
                                sinon.assert.calledOnce(<sinon.SinonSpy>downloadManager.onDownloadUpdate.trigger);
                                sinon.assert.calledWith(<sinon.SinonSpy>downloadManager.onDownloadUpdate.trigger, 1, DownloadStatus.FAILED, DownloadMessage.ERROR_INSUFFICIENT_SPACE);
                            });
                        });
                    });

                    describe('and download succeeded', () => {
                        it('should trigger onUpdate observer', () => {
                            return downloadManager.download(url, title, description).then(() => {
                                onDownloadUpdateCallbacks.forEach(mockDownloadSuccessfulTrigger);
                                sinon.assert.calledOnce(<sinon.SinonSpy>downloadManager.onDownloadUpdate.trigger);
                                sinon.assert.calledWith(<sinon.SinonSpy>downloadManager.onDownloadUpdate.trigger, 1, DownloadStatus.SUCCESSFUL, DownloadMessage.SUCCESS);
                            });
                        });

                        it('should unsubscribe onUpdated observer', () => {
                            sandbox.stub(china.Android.Download.onUpdated, 'unsubscribe');

                            return downloadManager.download(url, title, description).then(() => {
                                onDownloadCompletedCallbacks.forEach(mockDownloadSuccessfulTrigger);
                                sinon.assert.calledOnce(<sinon.SinonSpy>china.Android.Download.onUpdated.unsubscribe);
                            });
                        });

                        it('should trigger onUpdated observer twice only if there are two downloads', () => {
                            const url2 = 'http://another-cdn-in-china.com/another_game.apk';
                            const title2 = 'Title 2';
                            const description2 = 'Description 2';

                            sandbox.stub(china.Android.Download.onUpdated, 'unsubscribe');

                            return downloadManager.download(url, title, description).then(() => {
                                enqueueStub.resolves(2);
                                return downloadManager.download(url2, title2, description2).then(() => {
                                    onDownloadUpdateCallbacks.forEach(mockDownloadSuccessfulTrigger);
                                    sinon.assert.calledTwice(<sinon.SinonSpy>downloadManager.onDownloadUpdate.trigger);
                                    sinon.assert.calledWith(<sinon.SinonSpy>downloadManager.onDownloadUpdate.trigger, 1, DownloadStatus.SUCCESSFUL, DownloadMessage.SUCCESS);
                                    sinon.assert.calledWith(<sinon.SinonSpy>downloadManager.onDownloadUpdate.trigger, 2, DownloadStatus.SUCCESSFUL, DownloadMessage.SUCCESS);
                                });
                            });
                        });

                        it('should not unsubscribe onUpdated observer if there is download left', () => {
                            const url2 = 'http://another-cdn-in-china.com/another_game.apk';
                            const title2 = 'Title 2';
                            const description2 = 'Description 2';

                            sandbox.stub(china.Android.Download.onUpdated, 'unsubscribe');

                            return downloadManager.download(url, title, description).then(() => {
                                enqueueStub.resolves(2);
                                return downloadManager.download(url2, title2, description2).then(() => {
                                    onDownloadUpdateCallbacks.forEach((callback: any) => {
                                        callback(1, {'status': DownloadStatus.SUCCESSFUL, 'reason': DownloadReason.NONE});
                                    });
                                    sinon.assert.notCalled(<sinon.SinonSpy>china.Android.Download.onUpdated.unsubscribe);
                                });
                            });
                        });

                        describe('when installing upon download success', () => {
                            it('should get uri of downloaded file', (resolve) => {
                                downloadManager.download(url, title, description).then((downloadId) => {
                                    onDownloadUpdateCallbacks.forEach(mockDownloadSuccessfulTrigger);
                                    setTimeout(() => {
                                        sinon.assert.calledOnce(<sinon.SinonSpy>china.Android.Download.getUriForDownloadedFile);
                                        sinon.assert.calledWith(<sinon.SinonSpy>china.Android.Download.getUriForDownloadedFile, downloadId);
                                        resolve();
                                    }, 5);
                                });
                            });

                            describe('and API level is less than API 24', () => {
                                beforeEach(() => {
                                    downloadManager = new DownloadManager(core, china, BuildVerionCode.M);
                                });

                                it('should launch install intent', (resolve) => {
                                    downloadManager.download(url, title, description).then(() => {
                                        onDownloadUpdateCallbacks.forEach(mockDownloadSuccessfulTrigger);
                                        setTimeout(() => {
                                            sinon.assert.calledOnce(<sinon.SinonSpy>core.Android!.Intent.launch);
                                            sinon.assert.calledWith(<sinon.SinonSpy>core.Android!.Intent.launch, {
                                                'action': 'android.intent.action.VIEW',
                                                'uri': url,
                                                'mimeType': 'application/vnd.android.package-archive',
                                                'flags': IntentFlag.FLAG_ACTIVITY_NEW_TASK
                                            });
                                            resolve();
                                        }, 5);
                                    });
                                });
                            });

                            describe('and API level is larger than or equal to API 24', () => {
                                beforeEach(() => {
                                    downloadManager = new DownloadManager(core, china, BuildVerionCode.N);
                                });

                                it('should launch install intent with permission flag', (resolve) => {
                                    downloadManager.download(url, title, description).then(() => {
                                        onDownloadUpdateCallbacks.forEach(mockDownloadSuccessfulTrigger);
                                        setTimeout(() => {
                                            sinon.assert.calledOnce(<sinon.SinonSpy>core.Android!.Intent.launch);
                                            sinon.assert.calledWith(<sinon.SinonSpy>core.Android!.Intent.launch, {
                                                'action': 'android.intent.action.VIEW',
                                                'uri': url,
                                                'mimeType': 'application/vnd.android.package-archive',
                                                'flags': IntentFlag.FLAG_GRANT_READ_URI_PERMISSION
                                            });
                                            resolve();
                                        }, 5);
                                    });
                                });
                            });
                        });
                    });

                    it('should trigger on progress with current progress value if download is updated while running', () => {
                        return downloadManager.download(url, title, description).then(() => {
                            onDownloadUpdateCallbacks.forEach((callback: any) => {
                                callback(1, {
                                    'status': DownloadStatus.RUNNING,
                                    'reason': DownloadReason.NONE,
                                    'bytes_so_far': 1000,
                                    'total_size': 2000
                                });
                            });
                            sinon.assert.calledWith(<sinon.SinonSpy>downloadManager.onDownloadUpdate.trigger, 1, DownloadStatus.RUNNING, 50);
                        });
                    });

                    it('should trigger on progress with 0 value if total size is not known', () => {
                        return downloadManager.download(url, title, description).then(() => {
                            onDownloadUpdateCallbacks.forEach((callback: any) => {
                                callback(1, {
                                    'status': DownloadStatus.RUNNING,
                                    'reason': DownloadReason.NONE,
                                    'bytes_so_far': 1000,
                                    'total_size': -1
                                });
                            });
                            sinon.assert.calledWith(<sinon.SinonSpy>downloadManager.onDownloadUpdate.trigger, 1, DownloadStatus.RUNNING, 0);
                        });
                    });

                    it('should trigger on paused if download is updated with paused status', () => {
                        return downloadManager.download(url, title, description).then(() => {
                            onDownloadUpdateCallbacks.forEach((callback: any) => {
                                callback(1, {
                                    'status': DownloadStatus.PAUSED,
                                    'reason': DownloadReason.PAUSED_WAITING_FOR_NETWORK
                                });
                            });
                            sinon.assert.calledOnce(<sinon.SinonSpy>downloadManager.onDownloadUpdate.trigger);
                            sinon.assert.calledWith(<sinon.SinonSpy>downloadManager.onDownloadUpdate.trigger, 1, DownloadStatus.PAUSED, DownloadMessage.PAUSED_WAITING_FOR_NETWORK);
                        });
                    });
                });
            });

            describe('and native Android enqueue fails', () => {
                beforeEach(() => {
                    enqueueStub.rejects('some native error');
                });

                it('should fallback to view intent', () => {
                    return downloadManager.download(url, title, description).then(() => {
                        sinon.assert.calledWith(<sinon.SinonSpy>core.Android!.Intent.launch, {
                            'action': 'android.intent.action.VIEW',
                            'uri': 'http://cdn-in-china.com/game.apk'
                        });
                    });
                });

                it('should return download id equal to -1', () => {
                    return downloadManager.download(url, title, description).then((downloadId) => {
                        assert.equal(downloadId, -1);
                    });
                });
            });
        });

        describe('and there is no write permission', () => {
            beforeEach(() => {
                sandbox.stub(PermissionsUtil, 'checkPermissions').resolves(-1);
                sinon.spy(core.Android!.Intent, 'launch');
                sandbox.stub(china.Android.Download, 'enqueue').resolves();
                sandbox.stub(core.Permissions.Android!, 'requestPermissions');
                sandbox.stub(core.Android!.Preferences, 'setBoolean').resolves();
            });

            describe('and Android API is greater than or equal to 23', () => {
                beforeEach(() => {
                    downloadManager = new DownloadManager(core, china, BuildVerionCode.M);
                });

                it('should request write permission', () => {
                    sandbox.stub(core.Permissions.onPermissionsResult, 'subscribe')
                        .callsFake((callback: any) => {
                            setTimeout(() => callback(PermissionTypes.WRITE_EXTERNAL_STORAGE, true), 5);
                        });

                    return downloadManager.download(url, title, description).then(() => {
                        sinon.assert.calledWith(<sinon.SinonSpy>core.Permissions.Android!.requestPermissions, [AndroidPermission.WRITE_EXTERNAL_STORAGE], core.Permissions.permissionRequestCode);
                    });
                });

                describe('and write permission is granted', () => {
                    it('should enqueue download if write permission is granted', () => {
                        sandbox.stub(core.Permissions.onPermissionsResult, 'subscribe')
                            .callsFake((callback: any) => {
                                callback(PermissionTypes.WRITE_EXTERNAL_STORAGE, true);
                            });

                        return downloadManager.download(url, title, description).then(() => {
                            sinon.assert.calledWith(<sinon.SinonSpy>china.Android.Download.enqueue, {
                                url,
                                title,
                                description,
                                visibility,
                                mimeType,
                                directory,
                                filename,
                                destination,
                                updateIntervalMillis,
                                maxUpdateCount
                            });
                        });
                    });
                });

                describe('and write permission is denied', () => {
                    it('should fallback to search intent if write permission is denied', () => {
                        sandbox.stub(core.Permissions.onPermissionsResult, 'subscribe')
                            .callsFake((callback: any) => {
                                callback(PermissionTypes.WRITE_EXTERNAL_STORAGE, false);
                            });

                        return downloadManager.download(url, title, description).then(() => {
                            sinon.assert.calledWith(<sinon.SinonSpy>core.Android!.Intent.launch, {
                                'action': 'android.intent.action.VIEW',
                                'uri': 'http://cdn-in-china.com/game.apk'
                            });
                        });
                    });

                    it('should fallback to view intent if permission request fails', () => {
                        sandbox.stub(core.Permissions.onPermissionsResult, 'subscribe')
                            .callsFake((callback: any) => {
                                setTimeout(() => callback(new Error('Permission request error'), false), 5);
                            });

                        return downloadManager.download(url, title, description).then(() => {
                            sinon.assert.calledWith(<sinon.SinonSpy>core.Android!.Intent.launch, {
                                'action': 'android.intent.action.VIEW',
                                'uri': 'http://cdn-in-china.com/game.apk'
                            });
                        });
                    });

                    it('should return download id equal to -1', () => {
                        sandbox.stub(core.Permissions.onPermissionsResult, 'subscribe')
                            .callsFake((callback: any) => {
                                callback(PermissionTypes.WRITE_EXTERNAL_STORAGE, false);
                            });

                        return downloadManager.download(url, title, description).then((downloadId) => {
                            assert.equal(downloadId, -1);
                        });
                    });
                });
            });

            describe('and Android API is less than 23', () => {
                beforeEach(() => {
                    downloadManager = new DownloadManager(core, china, BuildVerionCode.LOLLIPOP);
                });

                it('should not request permissions', () => {
                    return downloadManager.download(url, title, description).then(() => {
                        sinon.assert.notCalled(<sinon.SinonSpy>core.Permissions.Android!.requestPermissions);
                    });
                });

                it('should fallback to view intent', () => {
                    return downloadManager.download(url, title, description).then(() => {
                        sinon.assert.calledWith(<sinon.SinonSpy>core.Android!.Intent.launch, {
                            'action': 'android.intent.action.VIEW',
                            'uri': 'http://cdn-in-china.com/game.apk'
                        });
                    });
                });

                it('should return download id equal to -1', () => {
                    return downloadManager.download(url, title, description).then((downloadId) => {
                        assert.equal(downloadId, -1);
                    });
                });
            });
        });
    });
});
