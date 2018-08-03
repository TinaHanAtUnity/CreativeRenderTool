System.register(["mocha", "chai", "sinon", "Utilities/Cache", "../TestHelpers/TestFixtures", "Constants/Platform", "Managers/WakeUpManager", "Models/Assets/Video", "Constants/Android/VideoMetadata", "Native/Api/Cache", "Utilities/Request", "Managers/FocusManager", "Utilities/CacheBookkeeping", "Utilities/FileInfo", "ProgrammaticTrackingService/ProgrammaticTrackingService"], function (exports_1, context_1) {
    "use strict";
    var chai_1, sinon, Cache_1, TestFixtures_1, Platform_1, WakeUpManager_1, Video_1, VideoMetadata_1, Cache_2, Request_1, FocusManager_1, CacheBookkeeping_1, FileInfo_1, ProgrammaticTrackingService_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
            },
            function (chai_1_1) {
                chai_1 = chai_1_1;
            },
            function (sinon_1) {
                sinon = sinon_1;
            },
            function (Cache_1_1) {
                Cache_1 = Cache_1_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            },
            function (Platform_1_1) {
                Platform_1 = Platform_1_1;
            },
            function (WakeUpManager_1_1) {
                WakeUpManager_1 = WakeUpManager_1_1;
            },
            function (Video_1_1) {
                Video_1 = Video_1_1;
            },
            function (VideoMetadata_1_1) {
                VideoMetadata_1 = VideoMetadata_1_1;
            },
            function (Cache_2_1) {
                Cache_2 = Cache_2_1;
            },
            function (Request_1_1) {
                Request_1 = Request_1_1;
            },
            function (FocusManager_1_1) {
                FocusManager_1 = FocusManager_1_1;
            },
            function (CacheBookkeeping_1_1) {
                CacheBookkeeping_1 = CacheBookkeeping_1_1;
            },
            function (FileInfo_1_1) {
                FileInfo_1 = FileInfo_1_1;
            },
            function (ProgrammaticTrackingService_1_1) {
                ProgrammaticTrackingService_1 = ProgrammaticTrackingService_1_1;
            }
        ],
        execute: function () {
            describe('VideoMetadataTest', function () {
                var validVideo = 'https://www.example.net/valid.mp4';
                var validHash = 'abcd1234';
                var validId = 'abcd1234.mp4';
                var invalidVideo = 'https://www.example.net/invalid.mp4';
                var invalidHash = 'defg5678';
                var invalidId = 'defg5678.mp4';
                var nativeBridge;
                var wakeUpManager;
                var request;
                var programmaticTrackingService;
                var cache;
                var focusManager;
                var cacheBookkeeping;
                describe('on Android', function () {
                    var metadataKeys = [VideoMetadata_1.VideoMetadata.METADATA_KEY_VIDEO_WIDTH, VideoMetadata_1.VideoMetadata.METADATA_KEY_VIDEO_HEIGHT, VideoMetadata_1.VideoMetadata.METADATA_KEY_DURATION];
                    beforeEach(function () {
                        nativeBridge = TestFixtures_1.TestFixtures.getNativeBridge(Platform_1.Platform.ANDROID);
                        focusManager = new FocusManager_1.FocusManager(nativeBridge);
                        wakeUpManager = new WakeUpManager_1.WakeUpManager(nativeBridge, focusManager);
                        request = new Request_1.Request(nativeBridge, wakeUpManager);
                        cacheBookkeeping = new CacheBookkeeping_1.CacheBookkeeping(nativeBridge);
                        programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService_1.ProgrammaticTrackingService);
                        cache = new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService);
                    });
                    it('should validate valid video', function () {
                        sinon.stub(nativeBridge.Cache, 'getHash').withArgs(validVideo).returns(Promise.resolve(validHash));
                        sinon.stub(nativeBridge.Cache.Android, 'getMetaData').withArgs(validId, metadataKeys).returns(Promise.resolve([
                            [VideoMetadata_1.VideoMetadata.METADATA_KEY_VIDEO_WIDTH, 640],
                            [VideoMetadata_1.VideoMetadata.METADATA_KEY_VIDEO_HEIGHT, 360],
                            [VideoMetadata_1.VideoMetadata.METADATA_KEY_DURATION, 10000]
                        ]));
                        var video = new Video_1.Video(validVideo, TestFixtures_1.TestFixtures.getSession());
                        return FileInfo_1.FileInfo.isVideoValid(nativeBridge, video, TestFixtures_1.TestFixtures.getCampaign()).then(function (valid) {
                            chai_1.assert.isTrue(valid, 'Valid video failed to validate on Android');
                        });
                    });
                    it('should not validate invalid video', function () {
                        sinon.stub(nativeBridge.Cache, 'getHash').withArgs(invalidVideo).returns(Promise.resolve(invalidHash));
                        sinon.stub(nativeBridge.Cache.Android, 'getMetaData').withArgs(invalidId, metadataKeys).returns(Promise.resolve([Cache_2.CacheError.FILE_IO_ERROR, 'File not found']));
                        var video = new Video_1.Video(invalidVideo, TestFixtures_1.TestFixtures.getSession());
                        return FileInfo_1.FileInfo.isVideoValid(nativeBridge, video, TestFixtures_1.TestFixtures.getCampaign()).then(function (valid) {
                            chai_1.assert.isFalse(valid, 'Invalid video was validated on Android');
                        });
                    });
                });
                describe('on iOS', function () {
                    beforeEach(function () {
                        nativeBridge = TestFixtures_1.TestFixtures.getNativeBridge(Platform_1.Platform.IOS);
                        focusManager = new FocusManager_1.FocusManager(nativeBridge);
                        wakeUpManager = new WakeUpManager_1.WakeUpManager(nativeBridge, focusManager);
                        request = new Request_1.Request(nativeBridge, wakeUpManager);
                        cacheBookkeeping = new CacheBookkeeping_1.CacheBookkeeping(nativeBridge);
                        programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService_1.ProgrammaticTrackingService);
                        cache = new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService);
                    });
                    it('should validate valid video', function () {
                        sinon.stub(nativeBridge.Cache, 'getHash').withArgs(validVideo).returns(Promise.resolve(validHash));
                        sinon.stub(nativeBridge.Cache.Ios, 'getVideoInfo').withArgs(validId).returns(Promise.resolve([640, 360, 10000]));
                        var video = new Video_1.Video(validVideo, TestFixtures_1.TestFixtures.getSession());
                        return FileInfo_1.FileInfo.isVideoValid(nativeBridge, video, TestFixtures_1.TestFixtures.getCampaign()).then(function (valid) {
                            chai_1.assert.isTrue(valid, 'Valid video failed to validate on iOS');
                        });
                    });
                    it('should not validate invalid video', function () {
                        sinon.stub(nativeBridge.Cache, 'getHash').withArgs(invalidVideo).returns(Promise.resolve(invalidHash));
                        sinon.stub(nativeBridge.Cache.Ios, 'getVideoInfo').withArgs(invalidId).returns(Promise.reject(['INVALID_ARGUMENT']));
                        var video = new Video_1.Video(invalidVideo, TestFixtures_1.TestFixtures.getSession());
                        return FileInfo_1.FileInfo.isVideoValid(nativeBridge, video, TestFixtures_1.TestFixtures.getCampaign()).then(function (valid) {
                            chai_1.assert.isFalse(valid, 'Invalid video was validated on iOS');
                        });
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmlkZW9NZXRhZGF0YVRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJWaWRlb01ldGFkYXRhVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBa0JBLFFBQVEsQ0FBQyxtQkFBbUIsRUFBRTtnQkFDMUIsSUFBTSxVQUFVLEdBQVcsbUNBQW1DLENBQUM7Z0JBQy9ELElBQU0sU0FBUyxHQUFXLFVBQVUsQ0FBQztnQkFDckMsSUFBTSxPQUFPLEdBQVcsY0FBYyxDQUFDO2dCQUV2QyxJQUFNLFlBQVksR0FBVyxxQ0FBcUMsQ0FBQztnQkFDbkUsSUFBTSxXQUFXLEdBQVcsVUFBVSxDQUFDO2dCQUN2QyxJQUFNLFNBQVMsR0FBVyxjQUFjLENBQUM7Z0JBRXpDLElBQUksWUFBMEIsQ0FBQztnQkFDL0IsSUFBSSxhQUE0QixDQUFDO2dCQUNqQyxJQUFJLE9BQWdCLENBQUM7Z0JBQ3JCLElBQUksMkJBQXdELENBQUM7Z0JBQzdELElBQUksS0FBWSxDQUFDO2dCQUNqQixJQUFJLFlBQTBCLENBQUM7Z0JBQy9CLElBQUksZ0JBQWtDLENBQUM7Z0JBRXZDLFFBQVEsQ0FBQyxZQUFZLEVBQUU7b0JBQ25CLElBQU0sWUFBWSxHQUFHLENBQUMsNkJBQWEsQ0FBQyx3QkFBd0IsRUFBRSw2QkFBYSxDQUFDLHlCQUF5QixFQUFFLDZCQUFhLENBQUMscUJBQXFCLENBQUMsQ0FBQztvQkFFNUksVUFBVSxDQUFDO3dCQUNQLFlBQVksR0FBRywyQkFBWSxDQUFDLGVBQWUsQ0FBQyxtQkFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO3dCQUM5RCxZQUFZLEdBQUcsSUFBSSwyQkFBWSxDQUFDLFlBQVksQ0FBQyxDQUFDO3dCQUM5QyxhQUFhLEdBQUcsSUFBSSw2QkFBYSxDQUFDLFlBQVksRUFBRSxZQUFZLENBQUMsQ0FBQzt3QkFDOUQsT0FBTyxHQUFHLElBQUksaUJBQU8sQ0FB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