System.register(["Constants/Platform", "Models/AuctionResponse", "Native/Api/Sdk", "Native/NativeBridge", "Parsers/ProgrammaticAdMobParser", "Utilities/Request", "chai", "json/campaigns/admob/ValidAdMobCampaign.json", "mocha", "sinon", "../TestHelpers/TestFixtures", "Utilities/FileId"], function (exports_1, context_1) {
    "use strict";
    var Platform_1, AuctionResponse_1, Sdk_1, NativeBridge_1, ProgrammaticAdMobParser_1, Request_1, chai_1, ValidAdMobCampaign_json_1, sinon, TestFixtures_1, FileId_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (Platform_1_1) {
                Platform_1 = Platform_1_1;
            },
            function (AuctionResponse_1_1) {
                AuctionResponse_1 = AuctionResponse_1_1;
            },
            function (Sdk_1_1) {
                Sdk_1 = Sdk_1_1;
            },
            function (NativeBridge_1_1) {
                NativeBridge_1 = NativeBridge_1_1;
            },
            function (ProgrammaticAdMobParser_1_1) {
                ProgrammaticAdMobParser_1 = ProgrammaticAdMobParser_1_1;
            },
            function (Request_1_1) {
                Request_1 = Request_1_1;
            },
            function (chai_1_1) {
                chai_1 = chai_1_1;
            },
            function (ValidAdMobCampaign_json_1_1) {
                ValidAdMobCampaign_json_1 = ValidAdMobCampaign_json_1_1;
            },
            function (_1) {
            },
            function (sinon_1) {
                sinon = sinon_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            },
            function (FileId_1_1) {
                FileId_1 = FileId_1_1;
            }
        ],
        execute: function () {
            describe('ProgrammaticAdMobParser', function () {
                var placements = ['TestPlacement'];
                var mediaId = 'o2YMT0Cmps6xHiOwNMeCrH';
                var correlationId = '583dfda0d933a3630a53249c';
                var url = 'https://r2---sn-n4v7knll.googlevideo.com/videoplayback?id=a6e915b5b0f41a1c&itag=22&source=youtube&requiressl=yes&mm=31&mn=sn-n4v7knll&ms=au&mv=m&pl=19&ei=eo3rWuGXD8-KuAL6oLvQAQ&susc=yti&mime=video/mp4&lmt=1518153041357987&mt=1525386488&ip=4.14.109.2&ipbits=0&expire=1525415418&sparams=ip,ipbits,expire,id,itag,source,requiressl,mm,mn,ms,mv,pl,ei,susc,mime,lmt&signature=4834094C1C09F34DE9D6473658D0B1EE75DB3E10.830B2F45714128B27549A3B15E8BE3CB8EFCBE19&key=ck2';
                var urlNoMime = 'https://r2---sn-n4v7knll.googlevideo.com/videoplayback?id=a6e915b5b0f41a1c&itag=22&source=youtube&requiressl=yes&mm=31&mn=sn-n4v7knll&ms=au&mv=m&pl=19&ei=eo3rWuGXD8-KuAL6oLvQAQ&susc=yti&lmt=1518153041357987&mt=1525386488&ip=4.14.109.2&ipbits=0&expire=1525415418&sparams=ip,ipbits,expire,id,itag,source,requiressl,mm,mn,ms,mv,pl,ei,susc,mime,lmt&signature=4834094C1C09F34DE9D6473658D0B1EE75DB3E10.830B2F45714128B27549A3B15E8BE3CB8EFCBE19&key=ck2';
                var parser;
                var nativeBridge;
                var request;
                var session;
                var setFileIdSpy;
                describe('parsing a campaign', function () {
                    var campaign;
                    var parse = function (data) {
                        var response = new AuctionResponse_1.AuctionResponse(placements, data, mediaId, correlationId);
                        return parser.parse(nativeBridge, request, response, session).then(function (parsedCampaign) {
                            campaign = parsedCampaign;
                        });
                    };
                    beforeEach(function () {
                        nativeBridge = sinon.createStubInstance(NativeBridge_1.NativeBridge);
                        nativeBridge.Sdk = sinon.createStubInstance(Sdk_1.SdkApi);
                        request = sinon.createStubInstance(Request_1.Request);
                        session = TestFixtures_1.TestFixtures.getSession();
                        parser = new ProgrammaticAdMobParser_1.ProgrammaticAdMobParser();
                        setFileIdSpy = sinon.spy(FileId_1.FileId, 'setFileID');
                        request.followRedirectChain.returns(Promise.resolve(url));
                    });
                    afterEach(function () {
                        setFileIdSpy.restore();
                    });
                    describe('on Android', function () {
                        beforeEach(function () {
                            nativeBridge.getPlatform.returns(Platform_1.Platform.ANDROID);
                        });
                        describe('without a mime type in url', function () {
                            beforeEach(function () {
                                request.followRedirectChain.returns(Promise.resolve(urlNoMime));
                                return parse(JSON.parse(ValidAdMobCampaign_json_1.default));
                            });
                            it('should FileId.setFileId without a mp4 mime type', function () {
                                sinon.assert.calledWith(setFileIdSpy, urlNoMime, 'G2KkvNWTNuU');
                            });
                        });
                        describe('with a mime type in url', function () {
                            beforeEach(function () {
                                request.followRedirectChain.returns(Promise.resolve(url));
                                return parse(JSON.parse(ValidAdMobCampaign_json_1.default));
                            });
                            it('should FileId.setFileId without a mp4 mime type', function () {
                                sinon.assert.calledWith(setFileIdSpy, url, 'G2KkvNWTNuU');
                            });
                        });
                        describe('should cache', function () {
                            beforeEach(function () {
                                request.followRedirectChain.returns(Promise.resolve(url));
                                return parse(JSON.parse(ValidAdMobCampaign_json_1.default));
                            });
                            afterEach(function () {
                                setFileIdSpy.resetHistory();
                            });
                            it('and call FileId.setFileId', function () {
                                sinon.assert.calledOnce(setFileIdSpy);
                                sinon.assert.calledWith(setFileIdSpy, url, 'G2KkvNWTNuU');
                            });
                        });
                    });
                    describe('on iOS', function () {
                        beforeEach(function () {
                            nativeBridge.getPlatform.returns(Platform_1.Platform.IOS);
                        });
                        describe('without a mime type in url', function () {
                            beforeEach(function () {
                                request.followRedirectChain.returns(Promise.resolve(urlNoMime));
                                return parse(JSON.parse(ValidAdMobCampaign_json_1.default));
                            });
                            it('should not call FileId.setFileId', function () {
                                sinon.assert.notCalled(setFileIdSpy);
                            });
                        });
                        describe('with a mime type in url', function () {
                            beforeEach(function () {
                                request.followRedirectChain.returns(Promise.resolve(url));
                                return parse(JSON.parse(ValidAdMobCampaign_json_1.default));
                            });
                            it('should FileId.setFileId with a mp4 mime type', function () {
                                sinon.assert.calledWith(setFileIdSpy, url, 'G2KkvNWTNuU.mp4');
                            });
                        });
                        describe('should cache', function () {
                            beforeEach(function () {
                                request.followRedirectChain.returns(Promise.resolve(url));
                                return parse(JSON.parse(ValidAdMobCampaign_json_1.default));
                            });
                            afterEach(function () {
                                setFileIdSpy.resetHistory();
                            });
                            it('and call FileId.setFileId', function () {
                                sinon.assert.calledOnce(setFileIdSpy);
                                sinon.assert.calledWith(setFileIdSpy, url, 'G2KkvNWTNuU.mp4');
                            });
                        });
                    });
                    describe('with a proper JSON payload', function () {
                        var validateCampaign = function () {
                            var json = JSON.parse(ValidAdMobCampaign_json_1.default);
                            chai_1.assert.isNotNull(campaign);
                            chai_1.assert.equal(campaign.getDynamicMarkup(), json.content, 'Markup is not equal');
                            chai_1.assert.equal(campaign.getSession(), session, 'Session is not equal');
                            chai_1.assert.deepEqual(campaign.getTrackingUrls(), json.trackingUrls, 'Tracking URLs are not equal');
                        };
                        describe('on Android', function () {
                            beforeEach(function () {
                                nativeBridge.getPlatform.returns(Platform_1.Platform.ANDROID);
                                setFileIdSpy.resetHistory();
                                return parse(JSON.parse(ValidAdMobCampaign_json_1.default));
                            });
                            it('should have a video cached from the AdMob ad', function () {
                                var assets = campaign.getOptionalAssets();
                                chai_1.assert.lengthOf(assets, 1, 'Video is not contained within campaign');
                            });
                            it('should have valid data', validateCampaign);
                        });
                        describe('on iOS', function () {
                            beforeEach(function () {
                                nativeBridge.getPlatform.returns(Platform_1.Platform.IOS);
                                setFileIdSpy.resetHistory();
                                return parse(JSON.parse(ValidAdMobCampaign_json_1.default));
                            });
                            it('should have a video cached from the AdMobAd', function () {
                                var assets = campaign.getOptionalAssets();
                                chai_1.assert.lengthOf(assets, 1, 'Video is not contained within campaign');
                            });
                            it('should have valid data', validateCampaign);
                        });
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvZ3JhbW1hdGljQWRNb2JQYXJzZXJUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiUHJvZ3JhbW1hdGljQWRNb2JQYXJzZXJUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7WUFlQSxRQUFRLENBQUMseUJBQXlCLEVBQUU7Z0JBQ2hDLElBQU0sVUFBVSxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7Z0JBQ3JDLElBQU0sT0FBTyxHQUFHLHdCQUF3QixDQUFDO2dCQUN6QyxJQUFNLGFBQWEsR0FBRywwQkFBMEIsQ0FBQztnQkFDakQsSUFBTSxHQUFHLEdBQUcsNmNBQTZjLENBQUM7Z0JBQzFkLElBQU0sU0FBUyxHQUFHLDhiQUE4YixDQUFDO2dCQUVqZCxJQUFJLE1BQStCLENBQUM7Z0JBQ3BDLElBQUksWUFBMEIsQ0FBQztnQkFDL0IsSUFBSSxPQUFnQixDQUFDO2dCQUNyQixJQUFJLE9BQWdCLENBQUM7Z0JBQ3JCLElBQUksWUFBNEIsQ0FBQztnQkFFakMsUUFBUSxDQUFDLG9CQUFvQixFQUFFO29CQUMzQixJQUFJLFFBQXVCLENBQUM7b0JBRTVCLElBQU0sS0FBSyxHQUFHLFVBQUMsSUFBUzt3QkFDcEIsSUFBTSxRQUFRLEdBQUcsSUFBSSxpQ0FBZSxDQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLGFBQWEsQ0FBQyxDQUFDO3dCQUMvRSxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUMsY0FBYzs0QkFDOUUsUUFBUSxHQUFrQixjQUFjLENBQUM7d0JBQzdDLENBQUMsQ0FBQyxDQUFDO29CQUNQLENBQUMsQ0FBQztvQkFFRixVQUFVLENBQUM7d0JBQ1AsWUFBWSxHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQywyQkFBWSxDQUFDLENBQUM7d0JBQ2hELFlBQVksQ0FBQyxHQUFJLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDLFlBQU0sQ0FBQyxDQUFDO3dCQUUzRCxPQUFPLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDLGlCQUFPLENBQUMsQ0FBQzt3QkFFNUMsT0FBTyxHQUFHLDJCQUFZLENBQUMsVUFBVSxFQUFFLENBQUM7d0JBRXBDLE1BQU0sR0FBRyxJQUFJLGlEQUF1QixFQUFFLENBQUM7d0JBQ3ZDLFlBQVksR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLGVBQU0sRUFBRSxXQUFXLENBQUMsQ0FBQzt3QkFDNUIsT0FBTyxDQUFDLG1CQUFvQixDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQ2pGLENBQUMsQ0FBQyxDQUFDO29CQUVILFNBQVMsQ0FBQzt3QkFDTixZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7b0JBQzNCLENBQUMsQ0FBQyxDQUFDO29CQUVILFFBQVEsQ0FBQyxZQUFZLEVBQUU7d0JBRW5CLFVBQVUsQ0FBQzs0QkFDVyxZQUFZLENBQUMsV0FBWSxDQUFDLE9BQU8sQ0FBQyxtQkFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO3dCQUMxRSxDQUFDLENBQUMsQ0FBQzt3QkFFSCxRQUFRLENBQUMsNEJBQTRCLEVBQUU7NEJBRW5DLFVBQVUsQ0FBQztnQ0FDVyxPQUFPLENBQUMsbUJBQW9CLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztnQ0FDbkYsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQ0FBa0IsQ0FBQyxDQUFDLENBQUM7NEJBQ2pELENBQUMsQ0FBQyxDQUFDOzRCQUVILEVBQUUsQ0FBQyxpREFBaUQsRUFBRTtnQ0FDbEQsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsWUFBWSxFQUFFLFNBQVMsRUFBRSxhQUFhLENBQUMsQ0FBQzs0QkFDcEUsQ0FBQyxDQUFDLENBQUM7d0JBQ1AsQ0FBQyxDQUFDLENBQUM7d0JBRUgsUUFBUSxDQUFDLHlCQUF5QixFQUFFOzRCQUNoQyxVQUFVLENBQUM7Z0NBQ1csT0FBTyxDQUFDLG1CQUFvQixDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0NBQzdFLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsaUNBQWtCLENBQUMsQ0FBQyxDQUFDOzRCQUNqRCxDQUFDLENBQUMsQ0FBQzs0QkFFSCxFQUFFLENBQUMsaURBQWlELEVBQUU7Z0NBQ2xELEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLFlBQVksRUFBRSxHQUFHLEVBQUUsYUFBYSxDQUFDLENBQUM7NEJBQzlELENBQUMsQ0FBQyxDQUFDO3dCQUNQLENBQUMsQ0FBQyxDQUFDO3dCQUVILFFBQVEsQ0FBQyxjQUFjLEVBQUU7NEJBRXJCLFVBQVUsQ0FBQztnQ0FDVyxPQUFPLENBQUMsbUJBQW9CLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQ0FDN0UsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQ0FBa0IsQ0FBQyxDQUFDLENBQUM7NEJBQ2pELENBQUMsQ0FBQyxDQUFDOzRCQUVILFNBQVMsQ0FBQztnQ0FDTixZQUFZLENBQUMsWUFBWSxFQUFFLENBQUM7NEJBQ2hDLENBQUMsQ0FBQyxDQUFDOzRCQUVILEVBQUUsQ0FBQywyQkFBMkIsRUFBRTtnQ0FDNUIsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUM7Z0NBQ3RDLEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLFlBQVksRUFBRSxHQUFHLEVBQUUsYUFBYSxDQUFDLENBQUM7NEJBQzlELENBQUMsQ0FBQyxDQUFDO3dCQUNQLENBQUMsQ0FBQyxDQUFDO29CQUVQLENBQUMsQ0FBQyxDQUFDO29CQUVILFFBQVEsQ0FBQyxRQUFRLEVBQUU7d0JBRWYsVUFBVSxDQUFDOzRCQUNXLFlBQVksQ0FBQyxXQUFZLENBQUMsT0FBTyxDQUFDLG1CQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBQ3RFLENBQUMsQ0FBQyxDQUFDO3dCQUVILFFBQVEsQ0FBQyw0QkFBNEIsRUFBRTs0QkFFbkMsVUFBVSxDQUFDO2dDQUNXLE9BQU8sQ0FBQyxtQkFBb0IsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO2dDQUNuRixPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGlDQUFrQixDQUFDLENBQUMsQ0FBQzs0QkFDakQsQ0FBQyxDQUFDLENBQUM7NEJBRUgsRUFBRSxDQUFDLGtDQUFrQyxFQUFFO2dDQUNuQyxLQUFLLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQzs0QkFDekMsQ0FBQyxDQUFDLENBQUM7d0JBQ1AsQ0FBQyxDQUFDLENBQUM7d0JBRUgsUUFBUSxDQUFDLHlCQUF5QixFQUFFOzRCQUNoQyxVQUFVLENBQUM7Z0NBQ1csT0FBTyxDQUFDLG1CQUFvQixDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0NBQzdFLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsaUNBQWtCLENBQUMsQ0FBQyxDQUFDOzRCQUNqRCxDQUFDLENBQUMsQ0FBQzs0QkFFSCxFQUFFLENBQUMsOENBQThDLEVBQUU7Z0NBQy9DLEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLFlBQVksRUFBRSxHQUFHLEVBQUUsaUJBQWlCLENBQUMsQ0FBQzs0QkFDbEUsQ0FBQyxDQUFDLENBQUM7d0JBQ1AsQ0FBQyxDQUFDLENBQUM7d0JBRUgsUUFBUSxDQUFDLGNBQWMsRUFBRTs0QkFFckIsVUFBVSxDQUFDO2dDQUNXLE9BQU8sQ0FBQyxtQkFBb0IsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dDQUM3RSxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGlDQUFrQixDQUFDLENBQUMsQ0FBQzs0QkFDakQsQ0FBQyxDQUFDLENBQUM7NEJBRUgsU0FBUyxDQUFDO2dDQUNOLFlBQVksQ0FBQyxZQUFZLEVBQUUsQ0FBQzs0QkFDaEMsQ0FBQyxDQUFDLENBQUM7NEJBRUgsRUFBRSxDQUFDLDJCQUEyQixFQUFFO2dDQUM1QixLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQ0FDdEMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsWUFBWSxFQUFFLEdBQUcsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDOzRCQUNsRSxDQUFDLENBQUMsQ0FBQzt3QkFDUCxDQUFDLENBQUMsQ0FBQztvQkFDUCxDQUFDLENBQUMsQ0FBQztvQkFFSCxRQUFRLENBQUMsNEJBQTRCLEVBQUU7d0JBRW5DLElBQU0sZ0JBQWdCLEdBQUc7NEJBQ3JCLElBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsaUNBQWtCLENBQUMsQ0FBQzs0QkFDNUMsYUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQzs0QkFDM0IsYUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLHFCQUFxQixDQUFDLENBQUM7NEJBQy9FLGFBQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxFQUFFLE9BQU8sRUFBRSxzQkFBc0IsQ0FBQyxDQUFDOzRCQUNyRSxhQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxlQUFlLEVBQUUsRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLDZCQUE2QixDQUFDLENBQUM7d0JBQ25HLENBQUMsQ0FBQzt3QkFFRixRQUFRLENBQUMsWUFBWSxFQUFFOzRCQUNuQixVQUFVLENBQUM7Z0NBQ1csWUFBWSxDQUFDLFdBQVksQ0FBQyxPQUFPLENBQUMsbUJBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQ0FDdEUsWUFBWSxDQUFDLFlBQVksRUFBRSxDQUFDO2dDQUM1QixPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGlDQUFrQixDQUFDLENBQUMsQ0FBQzs0QkFDakQsQ0FBQyxDQUFDLENBQUM7NEJBRUgsRUFBRSxDQUFDLDhDQUE4QyxFQUFFO2dDQUMvQyxJQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztnQ0FDNUMsYUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLHdDQUF3QyxDQUFDLENBQUM7NEJBQ3pFLENBQUMsQ0FBQyxDQUFDOzRCQUVILEVBQUUsQ0FBQyx3QkFBd0IsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO3dCQUVuRCxDQUFDLENBQUMsQ0FBQzt3QkFFSCxRQUFRLENBQUMsUUFBUSxFQUFFOzRCQUNmLFVBQVUsQ0FBQztnQ0FDVyxZQUFZLENBQUMsV0FBWSxDQUFDLE9BQU8sQ0FBQyxtQkFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dDQUNsRSxZQUFZLENBQUMsWUFBWSxFQUFFLENBQUM7Z0NBQzVCLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsaUNBQWtCLENBQUMsQ0FBQyxDQUFDOzRCQUNqRCxDQUFDLENBQUMsQ0FBQzs0QkFFSCxFQUFFLENBQUMsNkNBQTZDLEVBQUU7Z0NBQzlDLElBQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO2dDQUM1QyxhQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsd0NBQXdDLENBQUMsQ0FBQzs0QkFDekUsQ0FBQyxDQUFDLENBQUM7NEJBRUgsRUFBRSxDQUFDLHdCQUF3QixFQUFFLGdCQUFnQixDQUFDLENBQUM7d0JBRW5ELENBQUMsQ0FBQyxDQUFDO29CQUNQLENBQUMsQ0FBQyxDQUFDO2dCQUNQLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUMifQ==