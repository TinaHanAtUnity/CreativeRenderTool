System.register(["mocha", "chai", "sinon", "Models/Vast/Vast", "Models/Vast/VastAd", "Models/Vast/VastCreativeLinear", "Models/Vast/VastMediaFile", "Models/Vast/VastCreativeCompanionAd"], function (exports_1, context_1) {
    "use strict";
    var chai_1, sinon, Vast_1, VastAd_1, VastCreativeLinear_1, VastMediaFile_1, VastCreativeCompanionAd_1;
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
            function (Vast_1_1) {
                Vast_1 = Vast_1_1;
            },
            function (VastAd_1_1) {
                VastAd_1 = VastAd_1_1;
            },
            function (VastCreativeLinear_1_1) {
                VastCreativeLinear_1 = VastCreativeLinear_1_1;
            },
            function (VastMediaFile_1_1) {
                VastMediaFile_1 = VastMediaFile_1_1;
            },
            function (VastCreativeCompanionAd_1_1) {
                VastCreativeCompanionAd_1 = VastCreativeCompanionAd_1_1;
            }
        ],
        execute: function () {
            describe('Vast', function () {
                var vastCreative;
                var vastMediaFile;
                var vastAd;
                beforeEach(function () {
                    vastCreative = new VastCreativeLinear_1.VastCreativeLinear();
                    vastMediaFile = new VastMediaFile_1.VastMediaFile();
                    vastAd = new VastAd_1.VastAd();
                    vastAd.addCreative(vastCreative);
                });
                it('should return url for a playable video given multiple media files in VAST', function () {
                    var vast = new Vast_1.Vast([vastAd], []);
                    var unsupportedVastMediaFile = new VastMediaFile_1.VastMediaFile();
                    sinon.stub(vastMediaFile, 'getFileURL').returns('http://static.scanscout.com/filemanager/vhs/partner364124_f00a7d93-0858-4b28-bf8e-e9af7a879f74.mp4');
                    sinon.stub(vastMediaFile, 'getMIMEType').returns('video/mp4');
                    sinon.stub(unsupportedVastMediaFile, 'getFileURL').returns('http://static.scanscout.com/filemanager/vhs/blah.3gpp');
                    sinon.stub(unsupportedVastMediaFile, 'getMIMEType').returns('video/3gpp');
                    sinon.stub(vastCreative, 'getMediaFiles').returns([unsupportedVastMediaFile, vastMediaFile]);
                    chai_1.assert.equal(vast.getVideoUrl(), 'http://static.scanscout.com/filemanager/vhs/partner364124_f00a7d93-0858-4b28-bf8e-e9af7a879f74.mp4');
                });
                it('should return url for a playable video', function () {
                    var vast = new Vast_1.Vast([vastAd], []);
                    sinon.stub(vastMediaFile, 'getFileURL').returns('http://static.scanscout.com/filemanager/vhs/partner364124_f00a7d93-0858-4b28-bf8e-e9af7a879f74.mp4');
                    sinon.stub(vastMediaFile, 'getMIMEType').returns('video/mp4');
                    sinon.stub(vastCreative, 'getMediaFiles').returns([vastMediaFile]);
                    chai_1.assert.equal(vast.getVideoUrl(), 'http://static.scanscout.com/filemanager/vhs/partner364124_f00a7d93-0858-4b28-bf8e-e9af7a879f74.mp4');
                });
                it('should be case insensitive to mime type string', function () {
                    var vast = new Vast_1.Vast([vastAd], []);
                    sinon.stub(vastMediaFile, 'getFileURL').returns('http://static.scanscout.com/filemanager/vhs/partner364124_f00a7d93-0858-4b28-bf8e-e9af7a879f74.mp4');
                    sinon.stub(vastMediaFile, 'getMIMEType').returns('Video/Mp4');
                    sinon.stub(vastCreative, 'getMediaFiles').returns([vastMediaFile]);
                    chai_1.assert.equal(vast.getVideoUrl(), 'http://static.scanscout.com/filemanager/vhs/partner364124_f00a7d93-0858-4b28-bf8e-e9af7a879f74.mp4');
                });
                it('should not return url for unplayable video', function () {
                    var vast = new Vast_1.Vast([vastAd], []);
                    sinon.stub(vastMediaFile, 'getFileURL').returns('http://static.scanscout.com/filemanager/vhs/not-supported.3gpp');
                    sinon.stub(vastMediaFile, 'getMIMEType').returns('video/3gpp');
                    sinon.stub(vastCreative, 'getMediaFiles').returns([vastMediaFile]);
                    chai_1.assert.throws(vast.getVideoUrl);
                });
                describe('when VAST has a companion ad', function () {
                    it('should return url for landscape endcard image', function () {
                        vastAd.addCompanionAd(new VastCreativeCompanionAd_1.VastCreativeCompanionAd('id1', 'image/png', 320, 480, 'http://url.com/landscape.png', 'https://url.com/click'));
                        vastAd.addCompanionAd(new VastCreativeCompanionAd_1.VastCreativeCompanionAd('id2', 'image/png', 480, 320, 'http://url.com/portrait.png', 'https://url.com/click'));
                        vastAd.addCompanionAd(new VastCreativeCompanionAd_1.VastCreativeCompanionAd('id3', 'image/png', 700, 800, 'http://image.com', 'https://url.com/click'));
                        var vast = new Vast_1.Vast([vastAd], []);
                        chai_1.assert.equal(vast.getCompanionLandscapeUrl(), 'http://url.com/landscape.png');
                    });
                    it('should return url for landscape endcard image', function () {
                        vastAd.addCompanionAd(new VastCreativeCompanionAd_1.VastCreativeCompanionAd('id1', 'image/png', 320, 480, 'http://url.com/landscape.png', 'https://url.com/click'));
                        vastAd.addCompanionAd(new VastCreativeCompanionAd_1.VastCreativeCompanionAd('id2', 'image/png', 480, 320, 'http://url.com/portrait.png', 'https://url.com/click'));
                        vastAd.addCompanionAd(new VastCreativeCompanionAd_1.VastCreativeCompanionAd('id3', 'image/png', 700, 800, 'http://image.com', 'https://url.com/click'));
                        var vast = new Vast_1.Vast([vastAd], []);
                        chai_1.assert.equal(vast.getCompanionPortraitUrl(), 'http://url.com/portrait.png');
                    });
                    it('should return url for click through url', function () {
                        vastAd.addCompanionAd(new VastCreativeCompanionAd_1.VastCreativeCompanionAd('id1', 'image/png', 320, 480, 'http://url.com/landscape.png', 'https://url.com/click'));
                        vastAd.addCompanionAd(new VastCreativeCompanionAd_1.VastCreativeCompanionAd('id2', 'image/png', 480, 320, 'http://url.com/portrait.png', 'https://url.com/click'));
                        vastAd.addCompanionAd(new VastCreativeCompanionAd_1.VastCreativeCompanionAd('id3', 'image/png', 700, 800, 'http://image.com', 'https://url.com/click'));
                        var vast = new Vast_1.Vast([vastAd], []);
                        chai_1.assert.equal(vast.getCompanionClickThroughUrl(), 'https://url.com/click');
                    });
                    it('should not return url for landscape endcard if dimensions are too small', function () {
                        vastAd.addCompanionAd(new VastCreativeCompanionAd_1.VastCreativeCompanionAd('id1', 'image/png', 319, 500, 'http://url.com/landscape.png', 'https://url.com/click'));
                        vastAd.addCompanionAd(new VastCreativeCompanionAd_1.VastCreativeCompanionAd('id1', 'image/png', 350, 479, 'http://url.com/landscape.png', 'https://url.com/click'));
                        var vast = new Vast_1.Vast([vastAd], []);
                        chai_1.assert.equal(vast.getCompanionLandscapeUrl(), null);
                    });
                    it('should not return url for portrait endcard if dimensions are too small', function () {
                        vastAd.addCompanionAd(new VastCreativeCompanionAd_1.VastCreativeCompanionAd('id1', 'image/png', 490, 319, 'http://url.com/portrait.png', 'https://url.com/click'));
                        vastAd.addCompanionAd(new VastCreativeCompanionAd_1.VastCreativeCompanionAd('id1', 'image/png', 479, 350, 'http://url.com/portrait.png', 'https://url.com/click'));
                        var vast = new Vast_1.Vast([vastAd], []);
                        chai_1.assert.equal(vast.getCompanionPortraitUrl(), null);
                    });
                    it('should not return image urls when image mime types are not supported', function () {
                        vastAd.addCompanionAd(new VastCreativeCompanionAd_1.VastCreativeCompanionAd('id1', 'application/json', 320, 480, 'http://url.com/landscape.png', 'https://url.com/click'));
                        vastAd.addCompanionAd(new VastCreativeCompanionAd_1.VastCreativeCompanionAd('id2', 'js', 480, 320, 'http://url.com/portrait.png', 'https://url.com/click'));
                        vastAd.addCompanionAd(new VastCreativeCompanionAd_1.VastCreativeCompanionAd('id3', 'blah', 700, 800, 'http://image.com', 'https://url.com/click'));
                        var vast = new Vast_1.Vast([vastAd], []);
                        chai_1.assert.equal(vast.getCompanionLandscapeUrl(), null);
                        chai_1.assert.equal(vast.getCompanionPortraitUrl(), null);
                    });
                    it('should not return image urls when image mime types are not supported', function () {
                        vastAd.addCompanionAd(new VastCreativeCompanionAd_1.VastCreativeCompanionAd('id1', 'application/json', 320, 480, 'http://url.com/landscape.png', 'https://url.com/click'));
                        vastAd.addCompanionAd(new VastCreativeCompanionAd_1.VastCreativeCompanionAd('id2', 'js', 480, 320, 'http://url.com/portrait.png', 'https://url.com/click'));
                        vastAd.addCompanionAd(new VastCreativeCompanionAd_1.VastCreativeCompanionAd('id3', 'blah', 700, 800, 'http://image.com', 'https://url.com/click'));
                        var vast = new Vast_1.Vast([vastAd], []);
                        chai_1.assert.equal(vast.getCompanionLandscapeUrl(), null);
                        chai_1.assert.equal(vast.getCompanionPortraitUrl(), null);
                    });
                    it('should return image urls when image mime type is jpeg or jpg', function () {
                        vastAd.addCompanionAd(new VastCreativeCompanionAd_1.VastCreativeCompanionAd('id1', 'image/jpeg', 320, 480, 'http://url.com/landscape.jpeg', 'https://url.com/click'));
                        vastAd.addCompanionAd(new VastCreativeCompanionAd_1.VastCreativeCompanionAd('id2', 'image/jpg', 480, 320, 'http://url.com/portrait.jpg', 'https://url.com/click'));
                        var vast = new Vast_1.Vast([vastAd], []);
                        chai_1.assert.equal(vast.getCompanionLandscapeUrl(), 'http://url.com/landscape.jpeg');
                        chai_1.assert.equal(vast.getCompanionPortraitUrl(), 'http://url.com/portrait.jpg');
                    });
                    it('should return image urls when image mime type is png', function () {
                        vastAd.addCompanionAd(new VastCreativeCompanionAd_1.VastCreativeCompanionAd('id1', 'image/png', 320, 480, 'http://url.com/landscape.png', 'https://url.com/click'));
                        vastAd.addCompanionAd(new VastCreativeCompanionAd_1.VastCreativeCompanionAd('id2', 'image/png', 480, 320, 'http://url.com/portrait.png', 'https://url.com/click'));
                        var vast = new Vast_1.Vast([vastAd], []);
                        chai_1.assert.equal(vast.getCompanionLandscapeUrl(), 'http://url.com/landscape.png');
                        chai_1.assert.equal(vast.getCompanionPortraitUrl(), 'http://url.com/portrait.png');
                    });
                    it('should return image urls when image mime type is gif', function () {
                        vastAd.addCompanionAd(new VastCreativeCompanionAd_1.VastCreativeCompanionAd('id1', 'image/gif', 320, 480, 'http://url.com/landscape.gif', 'https://url.com/click'));
                        vastAd.addCompanionAd(new VastCreativeCompanionAd_1.VastCreativeCompanionAd('id2', 'image/gif', 480, 320, 'http://url.com/portrait.gif', 'https://url.com/click'));
                        var vast = new Vast_1.Vast([vastAd], []);
                        chai_1.assert.equal(vast.getCompanionLandscapeUrl(), 'http://url.com/landscape.gif');
                        chai_1.assert.equal(vast.getCompanionPortraitUrl(), 'http://url.com/portrait.gif');
                    });
                    it('should return image urls when image mime type is in caps', function () {
                        vastAd.addCompanionAd(new VastCreativeCompanionAd_1.VastCreativeCompanionAd('id1', 'image/GIF', 320, 480, 'http://url.com/landscape.gif', 'https://url.com/click'));
                        vastAd.addCompanionAd(new VastCreativeCompanionAd_1.VastCreativeCompanionAd('id2', 'IMAGE/Gif', 480, 320, 'http://url.com/portrait.gif', 'https://url.com/click'));
                        var vast = new Vast_1.Vast([vastAd], []);
                        chai_1.assert.equal(vast.getCompanionLandscapeUrl(), 'http://url.com/landscape.gif');
                        chai_1.assert.equal(vast.getCompanionPortraitUrl(), 'http://url.com/portrait.gif');
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdFRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJWYXN0VGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBVUEsUUFBUSxDQUFDLE1BQU0sRUFBRTtnQkFDYixJQUFJLFlBQWdDLENBQUM7Z0JBQ3JDLElBQUksYUFBNEIsQ0FBQztnQkFDakMsSUFBSSxNQUFjLENBQUM7Z0JBRW5CLFVBQVUsQ0FBQztvQkFDUCxZQUFZLEdBQUcsSUFBSSx1Q0FBa0IsRUFBRSxDQUFDO29CQUN4QyxhQUFhLEdBQUcsSUFBSSw2QkFBYSxFQUFFLENBQUM7b0JBQ3BDLE1BQU0sR0FBRyxJQUFJLGVBQU0sRUFBRSxDQUFDO29CQUN0QixNQUFNLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUNyQyxDQUFDLENBQUMsQ0FBQztnQkFFSCxFQUFFLENBQUMsMkVBQTJFLEVBQUU7b0JBQzVFLElBQU0sSUFBSSxHQUFHLElBQUksV0FBSSxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7b0JBQ3BDLElBQU0sd0JBQXdCLEdBQUcsSUFBSSw2QkFBYSxFQUFFLENBQUM7b0JBRXJELEtBQUssQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLFlBQVksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxvR0FBb0csQ0FBQyxDQUFDO29CQUN0SixLQUFLLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxhQUFhLENBQUMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7b0JBQzlELEtBQUssQ0FBQyxJQUFJLENBQUMsd0JBQXdCLEVBQUUsWUFBWSxDQUFDLENBQUMsT0FBTyxDQUFDLHVEQUF1RCxDQUFDLENBQUM7b0JBQ3BILEtBQUssQ0FBQyxJQUFJLENBQUMsd0JBQXdCLEVBQUUsYUFBYSxDQUFDLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO29CQUUxRSxLQUFLLENBQUMsSUFBSSxD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