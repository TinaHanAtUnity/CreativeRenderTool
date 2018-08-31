import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { Cache } from 'Core/Utilities/Cache';
import { NativeBridge } from 'Common/Native/NativeBridge';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Platform } from 'Common/Constants/Platform';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { Video } from 'Ads/Models/Assets/Video';
import { VideoMetadata } from 'Common/Constants/Android/VideoMetadata';
import { CacheError } from 'Core/Native/Cache';
import { Request } from 'Core/Utilities/Request';
import { FocusManager } from 'Core/Managers/FocusManager';
import { CacheBookkeeping } from 'Core/Utilities/CacheBookkeeping';
import { FileInfo } from 'Core/Utilities/FileInfo';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';

describe('VideoMetadataTest', () => {
    const validVideo: string = 'https://www.example.net/valid.mp4';
    const validHash: string = 'abcd1234';
    const validId: string = 'abcd1234.mp4';

    const invalidVideo: string = 'https://www.example.net/invalid.mp4';
    const invalidHash: string = 'defg5678';
    const invalidId: string = 'defg5678.mp4';

    let nativeBridge: NativeBridge;
    let wakeUpManager: WakeUpManager;
    let request: Request;
    let programmaticTrackingService: ProgrammaticTrackingService;
    let cache: Cache;
    let focusManager: FocusManager;
    let cacheBookkeeping: CacheBookkeeping;

    describe('on Android', () => {
        const metadataKeys = [VideoMetadata.METADATA_KEY_VIDEO_WIDTH, VideoMetadata.METADATA_KEY_VIDEO_HEIGHT, VideoMetadata.METADATA_KEY_DURATION];

        beforeEach(() => {
            nativeBridge = TestFixtures.getNativeBridge(Platform.ANDROID);
            focusManager = new FocusManager(nativeBridge);
            wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
            request = new Request(nativeBridge, wakeUpManager);
            cacheBookkeeping = new CacheBookkeeping(nativeBridge);
            programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);
            cache = new Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService);
        });

        it('should validate valid video', () => {
            sinon.stub(nativeBridge.Cache, 'getHash').withArgs(validVideo).returns(Promise.resolve(validHash));
            sinon.stub(nativeBridge.Cache.Android, 'getMetaData').withArgs(validId, metadataKeys).returns(Promise.resolve([
                [VideoMetadata.METADATA_KEY_VIDEO_WIDTH, 640],
                [VideoMetadata.METADATA_KEY_VIDEO_HEIGHT, 360],
                [VideoMetadata.METADATA_KEY_DURATION, 10000]
            ]));

            const video: Video = new Video(validVideo, TestFixtures.getSession());
            return FileInfo.isVideoValid(nativeBridge, video, TestFixtures.getCampaign()).then(valid => {
                assert.isTrue(valid, 'Valid video failed to validate on Android');
            });
        });

        it('should not validate invalid video', () => {
            sinon.stub(nativeBridge.Cache, 'getHash').withArgs(invalidVideo).returns(Promise.resolve(invalidHash));
            sinon.stub(nativeBridge.Cache.Android, 'getMetaData').withArgs(invalidId, metadataKeys).returns(Promise.resolve([CacheError.FILE_IO_ERROR, 'File not found']));

            const video: Video = new Video(invalidVideo, TestFixtures.getSession());
            return FileInfo.isVideoValid(nativeBridge, video, TestFixtures.getCampaign()).then(valid => {
                assert.isFalse(valid, 'Invalid video was validated on Android');
            });
        });
    });

    describe('on iOS', () => {
        beforeEach(() => {
            nativeBridge = TestFixtures.getNativeBridge(Platform.IOS);
            focusManager = new FocusManager(nativeBridge);
            wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
            request = new Request(nativeBridge, wakeUpManager);
            cacheBookkeeping = new CacheBookkeeping(nativeBridge);
            programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);
            cache = new Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService);
        });

        it('should validate valid video', () => {
            sinon.stub(nativeBridge.Cache, 'getHash').withArgs(validVideo).returns(Promise.resolve(validHash));
            sinon.stub(nativeBridge.Cache.Ios, 'getVideoInfo').withArgs(validId).returns(Promise.resolve([640, 360, 10000]));

            const video: Video = new Video(validVideo, TestFixtures.getSession());
            return FileInfo.isVideoValid(nativeBridge, video, TestFixtures.getCampaign()).then(valid => {
                assert.isTrue(valid, 'Valid video failed to validate on iOS');
            });
        });

        it('should not validate invalid video', () => {
            sinon.stub(nativeBridge.Cache, 'getHash').withArgs(invalidVideo).returns(Promise.resolve(invalidHash));
            sinon.stub(nativeBridge.Cache.Ios, 'getVideoInfo').withArgs(invalidId).returns(Promise.reject(['INVALID_ARGUMENT']));

            const video: Video = new Video(invalidVideo, TestFixtures.getSession());
            return FileInfo.isVideoValid(nativeBridge, video, TestFixtures.getCampaign()).then(valid => {
                assert.isFalse(valid, 'Invalid video was validated on iOS');
            });
        });
    });
});
