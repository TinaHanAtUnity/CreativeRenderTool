System.register(["mocha", "sinon", "chai", "ProgrammaticTrackingService/ProgrammaticTrackingService", "Utilities/Request", "Models/ClientInfo", "Models/DeviceInfo", "Constants/Platform"], function (exports_1, context_1) {
    "use strict";
    var sinon, chai_1, ProgrammaticTrackingService_1, Request_1, ClientInfo_1, DeviceInfo_1, Platform_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
            },
            function (sinon_1) {
                sinon = sinon_1;
            },
            function (chai_1_1) {
                chai_1 = chai_1_1;
            },
            function (ProgrammaticTrackingService_1_1) {
                ProgrammaticTrackingService_1 = ProgrammaticTrackingService_1_1;
            },
            function (Request_1_1) {
                Request_1 = Request_1_1;
            },
            function (ClientInfo_1_1) {
                ClientInfo_1 = ClientInfo_1_1;
            },
            function (DeviceInfo_1_1) {
                DeviceInfo_1 = DeviceInfo_1_1;
            },
            function (Platform_1_1) {
                Platform_1 = Platform_1_1;
            }
        ],
        execute: function () {
            describe('ProgrammaticTrackingService', function () {
                var programmaticTrackingService;
                var platformStub;
                var osVersionStub;
                var sdkVersionStub;
                var postStub;
                beforeEach(function () {
                    var request = sinon.createStubInstance(Request_1.Request);
                    var clientInfo = sinon.createStubInstance(ClientInfo_1.ClientInfo);
                    var deviceInfo = sinon.createStubInstance(DeviceInfo_1.DeviceInfo);
                    programmaticTrackingService = new ProgrammaticTrackingService_1.ProgrammaticTrackingService(request, clientInfo, deviceInfo);
                    platformStub = clientInfo.getPlatform;
                    osVersionStub = deviceInfo.getOsVersion;
                    sdkVersionStub = clientInfo.getSdkVersionName;
                    postStub = request.post;
                    postStub.resolves({
                        url: 'test',
                        response: 'test',
                        responseCode: 200,
                        headers: []
                    });
                });
                describe('buildErrorData', function () {
                    it('should send correct data for too_large_file', function () {
                        platformStub.returns(Platform_1.Platform.TEST);
                        osVersionStub.returns('11.2.1');
                        sdkVersionStub.returns('2.3.0');
                        var errorData = programmaticTrackingService.buildErrorData(ProgrammaticTrackingService_1.ProgrammaticTrackingError.TooLargeFile, 'test', 1234);
                        sinon.assert.calledOnce(platformStub);
                        sinon.assert.calledOnce(osVersionStub);
                        sinon.assert.calledOnce(sdkVersionStub);
                        chai_1.assert.deepEqual(errorData, {
                            event: ProgrammaticTrackingService_1.ProgrammaticTrackingError.TooLargeFile,
                            platform: 'TEST',
                            osVersion: '11.2.1',
                            sdkVersion: '2.3.0',
                            adType: 'test',
                            seatId: 1234
                        });
                    });
                });
                describe('reportError', function () {
                    it('should send correct data using request api', function () {
                        platformStub.returns(Platform_1.Platform.TEST);
                        osVersionStub.returns('11.2.1');
                        sdkVersionStub.returns('2.3.0');
                        var errorData = programmaticTrackingService.buildErrorData(ProgrammaticTrackingService_1.ProgrammaticTrackingError.TooLargeFile, 'test', 1234);
                        var promise = programmaticTrackingService.reportError(errorData);
                        sinon.assert.calledOnce(postStub);
                        chai_1.assert.equal(postStub.firstCall.args.length, 3);
                        chai_1.assert.equal(postStub.firstCall.args[0], 'https://tracking.adsx.unityads.unity3d.com/tracking/sdk/error');
                        chai_1.assert.equal(postStub.firstCall.args[1], JSON.stringify(errorData));
                        chai_1.assert.deepEqual(postStub.firstCall.args[2], [['Content-Type', 'application/json']]);
                        return promise;
                    });
                });
                describe('reportMetric', function () {
                    var tests = [{
                            input: ProgrammaticTrackingService_1.ProgrammaticTrackingMetric.AdmobUsedCachedVideo,
                            expected: {
                                event: ProgrammaticTrackingService_1.ProgrammaticTrackingMetric.AdmobUsedCachedVideo
                            }
                        }, {
                            input: ProgrammaticTrackingService_1.ProgrammaticTrackingMetric.AdmobUsedStreamedVideo,
                            expected: {
                                event: ProgrammaticTrackingService_1.ProgrammaticTrackingMetric.AdmobUsedStreamedVideo
                            }
                        }];
                    tests.forEach(function (t) {
                        it("should send \"" + t.expected + "\" when \"" + t.input + "\" is passed in", function () {
                            var promise = programmaticTrackingService.reportMetric(t.input);
                            sinon.assert.calledOnce(postStub);
                            chai_1.assert.equal(postStub.firstCall.args.length, 3);
                            chai_1.assert.equal(postStub.firstCall.args[0], 'https://tracking.adsx.unityads.unity3d.com/tracking/sdk/metric');
                            chai_1.assert.equal(postStub.firstCall.args[1], JSON.stringify(t.expected));
                            chai_1.assert.deepEqual(postStub.firstCall.args[2], [['Content-Type', 'application/json']]);
                            return promise;
                        });
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvZ3JhbW1hdGljVHJhY2tpbmdTZXJ2aWNlVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlByb2dyYW1tYXRpY1RyYWNraW5nU2VydmljZVRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztZQVNBLFFBQVEsQ0FBQyw2QkFBNkIsRUFBRTtnQkFFcEMsSUFBSSwyQkFBd0QsQ0FBQztnQkFDN0QsSUFBSSxZQUE2QixDQUFDO2dCQUNsQyxJQUFJLGFBQThCLENBQUM7Z0JBQ25DLElBQUksY0FBK0IsQ0FBQztnQkFDcEMsSUFBSSxRQUF5QixDQUFDO2dCQUU5QixVQUFVLENBQUM7b0JBQ1AsSUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDLGlCQUFPLENBQUMsQ0FBQztvQkFDbEQsSUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDLHVCQUFVLENBQUMsQ0FBQztvQkFDeEQsSUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDLHVCQUFVLENBQUMsQ0FBQztvQkFDeEQsMkJBQTJCLEdBQUcsSUFBSSx5REFBMkIsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO29CQUMvRixZQUFZLEdBQUcsVUFBVSxDQUFDLFdBQVcsQ0FBQztvQkFDdEMsYUFBYSxHQUFHLFVBQVUsQ0FBQyxZQUFZLENBQUM7b0JBQ3hDLGNBQWMsR0FBRyxVQUFVLENBQUMsaUJBQWlCLENBQUM7b0JBQzlDLFFBQVEsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDO29CQUN4QixRQUFRLENBQUMsUUFBUSxDQUFDO3dCQUNkLEdBQUcsRUFBRSxNQUFNO3dCQUNYLFFBQVEsRUFBRSxNQUFNO3dCQUNoQixZQUFZLEVBQUUsR0FBRzt3QkFDakIsT0FBTyxFQUFFLEVBQUU7cUJBQ2QsQ0FBQyxDQUFDO2dCQUNQLENBQUMsQ0FBQyxDQUFDO2dCQUVILFFBQVEsQ0FB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