System.register(["mocha", "sinon", "chai", "../TestHelpers/TestFixtures", "Native/NativeBridge", "Managers/ThirdPartyEventManager", "Utilities/ComScoreTrackingService", "Constants/Platform", "Managers/WakeUpManager", "Managers/FocusManager", "Utilities/Request"], function (exports_1, context_1) {
    "use strict";
    var sinon, chai_1, TestFixtures_1, NativeBridge_1, ThirdPartyEventManager_1, ComScoreTrackingService_1, Platform_1, WakeUpManager_1, FocusManager_1, Request_1;
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
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            },
            function (NativeBridge_1_1) {
                NativeBridge_1 = NativeBridge_1_1;
            },
            function (ThirdPartyEventManager_1_1) {
                ThirdPartyEventManager_1 = ThirdPartyEventManager_1_1;
            },
            function (ComScoreTrackingService_1_1) {
                ComScoreTrackingService_1 = ComScoreTrackingService_1_1;
            },
            function (Platform_1_1) {
                Platform_1 = Platform_1_1;
            },
            function (WakeUpManager_1_1) {
                WakeUpManager_1 = WakeUpManager_1_1;
            },
            function (FocusManager_1_1) {
                FocusManager_1 = FocusManager_1_1;
            },
            function (Request_1_1) {
                Request_1 = Request_1_1;
            }
        ],
        execute: function () {
            describe('ComScoreTrackingServiceTest', function () {
                var stubbedDateNowPlay = 3333;
                var stubbedDateNowEnd = 9999;
                var stubbedPlatform = 0;
                var handleInvocation = sinon.spy();
                var handleCallback = sinon.spy();
                var nativeBridge;
                var deviceInfo;
                var request;
                var thirdPartyEventManager;
                var focusManager;
                var comscoreService;
                var sha1edAdvertisingTrackingId;
                beforeEach(function () {
                    nativeBridge = new NativeBridge_1.NativeBridge({
                        handleInvocation: handleInvocation,
                        handleCallback: handleCallback
                    });
                    sinon.stub(nativeBridge, 'getPlatform').callsFake(function () { return stubbedPlatform; });
                    focusManager = new FocusManager_1.FocusManager(nativeBridge);
                    var wakeUpManager = new WakeUpManager_1.WakeUpManager(nativeBridge, focusManager);
                    request = new Request_1.Request(nativeBridge, wakeUpManager);
                    deviceInfo = TestFixtures_1.TestFixtures.getAndroidDeviceInfo();
                    thirdPartyEventManager = new ThirdPartyEventManager_1.ThirdPartyEventManager(nativeBridge, request);
                    comscoreService = new ComScoreTrackingService_1.ComScoreTrackingService(thirdPartyEventManager, nativeBridge, deviceInfo);
                    sha1edAdvertisingTrackingId = '55315d765868baf4ae1b54681af18d4db20a6056';
                });
                describe('when calling sendEvent', function () {
                    var sendEventStub;
                    beforeEach(function () {
                        sendEventStub = sinon.stub(thirdPartyEventManager, 'sendEvent');
                    });
                    afterEach(function () {
                        sendEventStub.restore();
                    });
                    it('thirdPartyManger\'s sendEvent is called', function () {
                        comscoreService.sendEvent('play', TestFixtures_1.TestFixtures.getSession().getId(), '20', 15, TestFixtures_1.TestFixtures.getCampaign().getCreativeId(), undefined, undefined);
                        sinon.assert.calledOnce(thirdPartyEventManager.sendEvent);
                    });
                });
                describe('when constructing url via setEventUrl()', function () {
                    var sendEventStub;
                    beforeEach(function () {
                        sinon.stub(Date, 'now').onFirstCall().callsFake(function () { return stubbedDateNowPlay; })
                            .onSecondCall().callsFake(function () { return stubbedDateNowEnd; });
                        sendEventStub = sinon.stub(thirdPartyEventManager, 'sendEvent');
                    });
                    afterEach(function () {
                        Date.now.restore();
                        sendEventStub.restore();
                    });
                    var urlPlay;
                    var urlEnd;
                    var queryParamsDictPlay;
                    var queryParamsDictEnd;
                    var fillComscoreParams = function () {
                        comscoreService.sendEvent('play', TestFixtures_1.TestFixtures.getSession().getId(), '20', 0, TestFixtures_1.TestFixtures.getCampaign().getCreativeId(), undefined, undefined);
                        comscoreService.sendEvent('end', TestFixtures_1.TestFixtures.getSession().getId(), '20', 15, TestFixtures_1.TestFixtures.getCampaign().getCreativeId(), undefined, undefined);
                        urlPlay = sendEventStub.firstCall.args[2];
                        urlEnd = sendEventStub.secondCall.args[2];
                        queryParamsDictPlay = getDictFromQueryString(urlPlay.split('?')[1]);
                        queryParamsDictEnd = getDictFromQueryString(urlEnd.split('?')[1]);
                    };
                    it('should return the correct scheme, scorecardresearch hostname, and path', function () {
                        fillComscoreParams();
                        chai_1.assert.isAbove(urlPlay.search('https://sb.scorecardresearch.com/p'), -1);
                        chai_1.assert.isAbove(urlEnd.search('https://sb.scorecardresearch.com/p'), -1);
                    });
                    it('the query parameters c1 should return the correct fixed value 19 in url query parameter', function () {
                        fillComscoreParams();
                        chai_1.assert.equal(queryParamsDictPlay.c1, '19');
                        chai_1.assert.equal(queryParamsDictEnd.c1, '19');
                    });
                    it('the query parameters c2 should return the correct client id in url query parameter', function () {
                        fillComscoreParams();
                        chai_1.assert.equal(queryParamsDictPlay.c2, '23027898');
                        chai_1.assert.equal(queryParamsDictEnd.c2, '23027898');
                    });
                    it('the query parameters ns_type should return the correct fixed value hidden in url query parameter', function () {
                        fillComscoreParams();
                        chai_1.assert.equal(queryParamsDictPlay.ns_type, 'hidden');
                        chai_1.assert.equal(queryParamsDictEnd.ns_type, 'hidden');
                    });
                    it('the query parameters ns_st_ct should return the correct fixed value va00 in url query parameter', function () {
                        fillComscoreParams();
                        chai_1.assert.equal(queryParamsDictPlay.ns_st_ct, 'va00');
                        chai_1.assert.equal(queryParamsDictEnd.ns_st_ct, 'va00');
                    });
                    it('the query parameters ns_ap_sv should return the correct fixed value 2.1602.11 in url query parameter', function () {
                        fillComscoreParams();
                        chai_1.assert.equal(queryParamsDictPlay.ns_ap_sv, '2.1602.11');
                        chai_1.assert.equal(queryParamsDictEnd.ns_ap_sv, '2.1602.11');
                    });
                    it('the query parameters ns_st_it should return the correct fixed value a in url query parameter', function () {
                        fillComscoreParams();
                        chai_1.assert.equal(queryParamsDictPlay.ns_st_it, 'a');
                        chai_1.assert.equal(queryParamsDictEnd.ns_st_it, 'a');
                    });
                    it('the query parameters ns_st_sv should return the correct fixed value 4.0.0 in url query parameter', function () {
                        fillComscoreParams();
                        chai_1.assert.equal(queryParamsDictPlay.ns_st_sv, '4.0.0');
                        chai_1.assert.equal(queryParamsDictEnd.ns_st_sv, '4.0.0');
                    });
                    it('the query parameters ns_st_ad should return the correct fixed value 1 in url query parameter', function () {
                        fillComscoreParams();
                        chai_1.assert.equal(queryParamsDictPlay.ns_st_ad, '1');
                        chai_1.assert.equal(queryParamsDictEnd.ns_st_ad, '1');
                    });
                    it('the query parameters ns_st_sq should return the correct fixed value 1 in url query parameter', function () {
                        fillComscoreParams();
                        chai_1.assert.equal(queryParamsDictPlay.ns_st_sq, '1');
                        chai_1.assert.equal(queryParamsDictEnd.ns_st_sq, '1');
                    });
                    it('the query parameters should send sha1d adIdentifier when Device Limit Ad Tracking is turned off', function () {
                        sinon.stub(deviceInfo, 'getLimitAdTracking').callsFake(function () { return false; });
                        fillComscoreParams();
                        chai_1.assert.equal(queryParamsDictPlay.c12, sha1edAdvertisingTrackingId);
                        chai_1.assert.equal(queryParamsDictEnd.c12, sha1edAdvertisingTrackingId);
                    });
                    it('the query parameters should send deviceUniqueIdHash of "none" when Device Limit Ad Tracking is turned on', function () {
                        sinon.stub(deviceInfo, 'getLimitAdTracking').callsFake(function () { return true; });
                        fillComscoreParams();
                        chai_1.assert.equal(queryParamsDictPlay.c12, 'none');
                        chai_1.assert.equal(queryParamsDictEnd.c12, 'none');
                    });
                    it('the query parameters should return the correct platform', function () {
                        var platform = TestFixtures_1.TestFixtures.getNativeBridge(Platform_1.Platform.ANDROID).getPlatform();
                        fillComscoreParams();
                        chai_1.assert.equal(queryParamsDictPlay.ns_ap_pn, Platform_1.Platform[platform].toLowerCase());
                        chai_1.assert.equal(queryParamsDictEnd.ns_ap_pn, Platform_1.Platform[platform].toLowerCase());
                    });
                    it('the query parameters should return the device model', function () {
                        fillComscoreParams();
                        chai_1.assert.equal(queryParamsDictPlay.ns_ap_device, TestFixtures_1.TestFixtures.getAndroidDeviceInfo().getModel());
                        chai_1.assert.equal(queryParamsDictEnd.ns_ap_device, TestFixtures_1.TestFixtures.getAndroidDeviceInfo().getModel());
                    });
                    it('the query parameters should return the video eventName', function () {
                        fillComscoreParams();
                        chai_1.assert.equal(queryParamsDictPlay.ns_st_ev, 'play');
                        chai_1.assert.equal(queryParamsDictEnd.ns_st_ev, 'end');
                    });
                    it('the query parameters should return the duration of the video', function () {
                        fillComscoreParams();
                        chai_1.assert.equal(queryParamsDictPlay.ns_st_cl, '20');
                        chai_1.assert.equal(queryParamsDictEnd.ns_st_cl, '20');
                    });
                    it('the query parameters should send a Played Time value of "0" for the Playback Identity of "play"', function () {
                        fillComscoreParams();
                        chai_1.assert.equal(queryParamsDictPlay.ns_st_pt, '0');
                    });
                    it('the query parameters should return the correct played time for the "end" playback identity constructed url', function () {
                        fillComscoreParams();
                        chai_1.assert.equal(queryParamsDictEnd.ns_st_pt, 15);
                    });
                    it('the query parameters should send a random number value equal to Date.now()', function () {
                        fillComscoreParams();
                        chai_1.assert.equal(queryParamsDictPlay.ns_ts, stubbedDateNowPlay);
                        chai_1.assert.equal(queryParamsDictEnd.ns_ts, stubbedDateNowEnd);
                    });
                });
                function getDictFromQueryString(queryString) {
                    var keyValues = queryString.split('&');
                    var dict = {};
                    var splitKeyValue;
                    keyValues.forEach(function (el) {
                        splitKeyValue = el.split('=');
                        dict[splitKeyValue[0]] = splitKeyValue[1];
                    });
                    return dict;
                }
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tU2NvcmVUcmFja2luZ1NlcnZpY2VUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiQ29tU2NvcmVUcmFja2luZ1NlcnZpY2VUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7WUFjQSxRQUFRLENBQUMsNkJBQTZCLEVBQUU7Z0JBQ3BDLElBQU0sa0JBQWtCLEdBQVcsSUFBSSxDQUFDO2dCQUN4QyxJQUFNLGlCQUFpQixHQUFXLElBQUksQ0FBQztnQkFDdkMsSUFBTSxlQUFlLEdBQVcsQ0FBQyxDQUFDO2dCQUVsQyxJQUFNLGdCQUFnQixHQUFHLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFDckMsSUFBTSxjQUFjLEdBQUcsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUNuQyxJQUFJLFlBQTBCLENBQUM7Z0JBQy9CLElBQUksVUFBc0IsQ0FBQztnQkFDM0IsSUFBSSxPQUFnQixDQUFDO2dCQUNyQixJQUFJLHNCQUE4QyxDQUFDO2dCQUNuRCxJQUFJLFlBQTBCLENBQUM7Z0JBRS9CLElBQUksZUFBd0MsQ0FBQztnQkFDN0MsSUFBSSwyQkFBbUMsQ0FBQztnQkFFeEMsVUFBVSxDQUFDO29CQUNQLFlBQVksR0FBRyxJQUFJLDJCQUFZLENBQUM7d0JBQzVCLGdCQUFnQixrQkFBQTt3QkFDaEIsY0FBYyxnQkFBQTtxQkFDakIsQ0FBQyxDQUFDO29CQUNILEtBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLGFBQWEsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxjQUFNLE9BQUEsZUFBZSxFQUFmLENBQWUsQ0FBQyxDQUFDO29CQUV6RSxZQUFZLEdBQUcsSUFBSSwyQkFBWSxDQUFDLFlBQVksQ0FBQyxDQUFDO29CQUM5QyxJQUFNLGFBQWEsR0FBRyxJQUFJLDZCQUFhLENBQUMsWUFBWSxFQUFFLFlBQVksQ0FBQyxDQUFDO29CQUNwRSxPQUFPLEdBQUcsSUFBSSxpQkFBTyxDQUFDLFlBQVksRUFBRSxhQUFhLENBQUMsQ0FBQztvQkFDbkQsVUFBVSxHQUFHLDJCQUFZLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztvQkFDakQsc0JBQXNCLEdBQUcsSUFBSSwrQ0FBc0IsQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDLENBQUM7b0JBQzNFLGVBQWUsR0FBRyxJQUFJLGlEQUF1QixDQUFDLHNCQUFzQixFQUFFLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztvQkFDaEcsMkJBQTJCLEdBQUcsMENBQTBDLENBQUM7Z0JBQzdFLENBQUMsQ0FBQyxDQUFDO2dCQUVILFFBQVEsQ0FBQyx3QkFBd0IsRUFBRTtvQkFDL0IsSUFBSSxhQUE4QixDQUFDO29CQUNuQyxVQUFVLENBQUM7d0JBQ1AsYUFBYSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsc0JBQXNCLEVBQUUsV0FBVyxDQUFDLENBQUM7b0JBQ3BFLENBQUMsQ0FBQyxDQUFDO29CQUVILFNBQVMsQ0FBQzt3QkFDTixhQUFhLENBQUMsT0FBTyxFQUFFLENBQUM7b0JBQzVCLENBQUMsQ0FBQyxDQUFDO29CQUVILEVBQUUsQ0FBQyx5Q0FBeUMsRUFBRTt3QkFDMUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsMkJBQVksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLDJCQUFZLENBQUMsV0FBVyxFQUFFLENBQUMsYUFBYSxFQUFFLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO3dCQUNqSixLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBa0Isc0JBQXNCLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBQy9FLENBQUMsQ0FBQyxDQUFDO2dCQUNQLENBQUMsQ0FBQyxDQUFDO2dCQUVILFFBQVEsQ0FBQyx5Q0FBeUMsRUFBRTtvQkFDaEQsSUFBSSxhQUE4QixDQUFDO29CQUVuQyxVQUFVLENBQUM7d0JBQ1AsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsU0FBUyxDQUFDLGNBQU0sT0FBQSxrQkFBa0IsRUFBbEIsQ0FBa0IsQ0FBQzs2QkFDcEUsWUFBWSxFQUFFLENBQUMsU0FBUyxDQUFDLGNBQU0sT0FBQSxpQkFBaUIsRUFBakIsQ0FBaUIsQ0FBQyxDQUFDO3dCQUN2RCxhQUFhLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxXQUFXLENBQUMsQ0FBQztvQkFDcEUsQ0FBQyxDQUFDLENBQUM7b0JBRUgsU0FBUyxDQUFDO3dCQUNZLElBQUksQ0FBQyxHQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7d0JBQ3RDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztvQkFDNUIsQ0FBQyxDQUFDLENBQUM7b0JBRUgsSUFBSSxPQUFlLENBQUM7b0JBQ3BCLElBQUksTUFBYyxDQUFDO29CQUNuQixJQUFJLG1CQUF3QixDQUFDO29CQUM3QixJQUFJLGtCQUF1QixDQUFDO29CQUU1QixJQUFNLGtCQUFrQixHQUFHO3dCQUN2QixlQUFlLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSwyQkFBWSxDQUFDLFVBQVUsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsMkJBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxhQUFhLEVBQUUsRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7d0JBQ2hKLGVBQWUsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLDJCQUFZLENBQUMsVUFBVSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSwyQkFBWSxDQUFDLFdBQVcsRUFBRSxDQUFDLGFBQWEsRUFBRSxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQzt3QkFDaEosT0FBTyxHQUFHLGFBQWEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUMxQyxNQUFNLEdBQUcsYUFBYSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQzFDLG1CQUFtQixHQUFHLHNCQUFzQixDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDcEUsa0JBQWtCLEdBQUcsc0JBQXNCLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN0RSxDQUFDLENBQUM7b0JBRUYsRUFBRSxDQUFDLHdFQUF3RSxFQUFFO3dCQUN6RSxrQkFBa0IsRUFBRSxDQUFDO3dCQUNyQixhQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsb0NBQW9DLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUN6RSxhQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsb0NBQW9DLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUM1RSxDQUFDLENBQUMsQ0FBQztvQkFFSCxFQUFFLENBQUMseUZBQXlGLEVBQUU7d0JBQzFGLGtCQUFrQixFQUFFLENBQUM7d0JBQ3JCLGFBQU0sQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO3dCQUMzQyxhQUFNLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztvQkFDOUMsQ0FBQyxDQUFDLENBQUM7b0JBRUgsRUFBRSxDQUFDLG9GQUFvRixFQUFFO3dCQUNyRixrQkFBa0IsRUFBRSxDQUFDO3dCQUNyQixhQUFNLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLEVBQUUsRUFBRSxVQUFVLENBQUMsQ0FBQzt3QkFDakQsYUFBTSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLEVBQUUsVUFBVSxDQUFDLENBQUM7b0JBQ3BELENBQUMsQ0FBQyxDQUFDO29CQUVILEVBQUUsQ0FBQyxrR0FBa0csRUFBRTt3QkFDbkcsa0JBQWtCLEVBQUUsQ0FBQzt3QkFDckIsYUFBTSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7d0JBQ3BELGFBQU0sQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO29CQUN2RCxDQUFDLENBQUMsQ0FBQztvQkFFSCxFQUFFLENBQUMsaUdBQWlHLEVBQUU7d0JBQ2xHLGtCQUFrQixFQUFFLENBQUM7d0JBQ3JCLGFBQU0sQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO3dCQUNuRCxhQUFNLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztvQkFDdEQsQ0FBQyxDQUFDLENBQUM7b0JBRUgsRUFBRSxDQUFDLHNHQUFzRyxFQUFFO3dCQUN2RyxrQkFBa0IsRUFBRSxDQUFDO3dCQUNyQixhQUFNLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsQ0FBQzt3QkFDeEQsYUFBTSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLENBQUM7b0JBQzNELENBQUMsQ0FBQyxDQUFDO29CQUVILEVBQUUsQ0FBQyw4RkFBOEYsRUFBRTt3QkFDL0Ysa0JBQWtCLEVBQUUsQ0FBQzt3QkFDckIsYUFBTSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7d0JBQ2hELGFBQU0sQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO29CQUNuRCxDQUFDLENBQUMsQ0FBQztvQkFFSCxFQUFFLENBQUMsa0dBQWtHLEVBQUU7d0JBQ25HLGtCQUFrQixFQUFFLENBQUM7d0JBQ3JCLGFBQU0sQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO3dCQUNwRCxhQUFNLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztvQkFDdkQsQ0FBQyxDQUFDLENBQUM7b0JBRUgsRUFBRSxDQUFDLDhGQUE4RixFQUFFO3dCQUMvRixrQkFBa0IsRUFBRSxDQUFDO3dCQUNyQixhQUFNLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQzt3QkFDaEQsYUFBTSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7b0JBQ25ELENBQUMsQ0FBQyxDQUFDO29CQUVILEVBQUUsQ0FBQyw4RkFBOEYsRUFBRTt3QkFDL0Ysa0JBQWtCLEVBQUUsQ0FBQzt3QkFDckIsYUFBTSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7d0JBQ2hELGFBQU0sQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO29CQUNuRCxDQUFDLENBQUMsQ0FBQztvQkFFSCxFQUFFLENBQUMsaUdBQWlHLEVBQUU7d0JBQ2xHLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLG9CQUFvQixDQUFDLENBQUMsU0FBUyxDQUFDLGNBQU0sT0FBQSxLQUFLLEVBQUwsQ0FBSyxDQUFDLENBQUM7d0JBQ3BFLGtCQUFrQixFQUFFLENBQUM7d0JBQ3JCLGFBQU0sQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsR0FBRyxFQUFFLDJCQUEyQixDQUFDLENBQUM7d0JBQ25FLGFBQU0sQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsR0FBRyxFQUFFLDJCQUEyQixDQUFDLENBQUM7b0JBQ3RFLENBQUMsQ0FBQyxDQUFDO29CQUVILEVBQUUsQ0FBQywwR0FBMEcsRUFBRTt3QkFDM0csS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsb0JBQW9CLENBQUMsQ0FBQyxTQUFTLENBQUMsY0FBTSxPQUFBLElBQUksRUFBSixDQUFJLENBQUMsQ0FBQzt3QkFDbkUsa0JBQWtCLEVBQUUsQ0FBQzt3QkFDckIsYUFBTSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUM7d0JBQzlDLGFBQU0sQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDO29CQUNqRCxDQUFDLENBQUMsQ0FBQztvQkFFSCxFQUFFLENBQUMseURBQXlELEVBQUU7d0JBQzFELElBQU0sUUFBUSxHQUFHLDJCQUFZLENBQUMsZUFBZSxDQUFDLG1CQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7d0JBQzlFLGtCQUFrQixFQUFFLENBQUM7d0JBQ3JCLGFBQU0sQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsUUFBUSxFQUFFLG1CQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQzt3QkFDN0UsYUFBTSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLEVBQUUsbUJBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO29CQUNoRixDQUFDLENBQUMsQ0FBQztvQkFFSCxFQUFFLENBQUMscURBQXFELEVBQUU7d0JBQ3RELGtCQUFrQixFQUFFLENBQUM7d0JBQ3JCLGFBQU0sQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsWUFBWSxFQUFFLDJCQUFZLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO3dCQUMvRixhQUFNLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLFlBQVksRUFBRSwyQkFBWSxDQUFDLG9CQUFvQixFQUFFLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztvQkFDbEcsQ0FBQyxDQUFDLENBQUM7b0JBRUgsRUFBRSxDQUFDLHdEQUF3RCxFQUFFO3dCQUN6RCxrQkFBa0IsRUFBRSxDQUFDO3dCQUNyQixhQUFNLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQzt3QkFDbkQsYUFBTSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7b0JBQ3JELENBQUMsQ0FBQyxDQUFDO29CQUVILEVBQUUsQ0FBQyw4REFBOEQsRUFBRTt3QkFDL0Qsa0JBQWtCLEVBQUUsQ0FBQzt3QkFDckIsYUFBTSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7d0JBQ2pELGFBQU0sQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO29CQUNwRCxDQUFDLENBQUMsQ0FBQztvQkFFSCxFQUFFLENBQUMsaUdBQWlHLEVBQUU7d0JBQ2xHLGtCQUFrQixFQUFFLENBQUM7d0JBQ3JCLGFBQU0sQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO29CQUNwRCxDQUFDLENBQUMsQ0FBQztvQkFFSCxFQUFFLENBQUMsNEdBQTRHLEVBQUU7d0JBQzdHLGtCQUFrQixFQUFFLENBQUM7d0JBQ3JCLGFBQU0sQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDO29CQUNsRCxDQUFDLENBQUMsQ0FBQztvQkFFSCxFQUFFLENBQUMsNEVBQTRFLEVBQUU7d0JBQzdFLGtCQUFrQixFQUFFLENBQUM7d0JBQ3JCLGFBQU0sQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsS0FBSyxFQUFFLGtCQUFrQixDQUFDLENBQUM7d0JBQzVELGFBQU0sQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsS0FBSyxFQUFFLGlCQUFpQixDQUFDLENBQUM7b0JBQzlELENBQUMsQ0FBQyxDQUFDO2dCQUNQLENBQUMsQ0FBQyxDQUFDO2dCQUVILFNBQVMsc0JBQXNCLENBQUMsV0FBbUI7b0JBQy9DLElBQU0sU0FBUyxHQUFhLFdBQVcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ25ELElBQU0sSUFBSSxHQUFRLEVBQUUsQ0FBQztvQkFDckIsSUFBSSxhQUF1QixDQUFDO29CQUM1QixTQUFTLENBQUMsT0FBTyxDQUFDLFVBQUMsRUFBVTt3QkFDekIsYUFBYSxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBQzlCLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzlDLENBQUMsQ0FBQyxDQUFDO29CQUVILE9BQU8sSUFBSSxDQUFDO2dCQUNoQixDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUMifQ==