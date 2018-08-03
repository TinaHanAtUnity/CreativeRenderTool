System.register(["mocha", "sinon", "Models/VPAID/VPAID", "Views/VPAID", "Native/NativeBridge", "Models/VPAID/VPAIDCampaign", "Test/Unit/TestHelpers/TestFixtures", "Native/Api/WebPlayer", "Utilities/Observable", "Native/Api/DeviceInfo", "Views/Privacy"], function (exports_1, context_1) {
    "use strict";
    var sinon, VPAID_1, VPAID_2, NativeBridge_1, VPAIDCampaign_1, TestFixtures_1, WebPlayer_1, Observable_1, DeviceInfo_1, Privacy_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
            },
            function (sinon_1) {
                sinon = sinon_1;
            },
            function (VPAID_1_1) {
                VPAID_1 = VPAID_1_1;
            },
            function (VPAID_2_1) {
                VPAID_2 = VPAID_2_1;
            },
            function (NativeBridge_1_1) {
                NativeBridge_1 = NativeBridge_1_1;
            },
            function (VPAIDCampaign_1_1) {
                VPAIDCampaign_1 = VPAIDCampaign_1_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            },
            function (WebPlayer_1_1) {
                WebPlayer_1 = WebPlayer_1_1;
            },
            function (Observable_1_1) {
                Observable_1 = Observable_1_1;
            },
            function (DeviceInfo_1_1) {
                DeviceInfo_1 = DeviceInfo_1_1;
            },
            function (Privacy_1_1) {
                Privacy_1 = Privacy_1_1;
            }
        ],
        execute: function () {
            describe('VPAID View', function () {
                var nativeBridge;
                var campaign;
                var eventHandler;
                var view;
                beforeEach(function () {
                    nativeBridge = sinon.createStubInstance(NativeBridge_1.NativeBridge);
                    campaign = sinon.createStubInstance(VPAIDCampaign_1.VPAIDCampaign);
                    var deviceInfo = sinon.createStubInstance(DeviceInfo_1.DeviceInfoApi);
                    deviceInfo.getScreenWidth.returns(Promise.resolve(320));
                    deviceInfo.getScreenHeight.returns(Promise.resolve(480));
                    nativeBridge.DeviceInfo = deviceInfo;
                    var webPlayer = sinon.createStubInstance(WebPlayer_1.WebPlayerApi);
                    webPlayer.onWebPlayerEvent = new Observable_1.Observable1();
                    webPlayer.setData.returns(Promise.resolve());
                    webPlayer.sendEvent.returns(Promise.resolve());
                    nativeBridge.WebPlayer = webPlayer;
                    var model = sinon.createStubInstance(VPAID_1.VPAID);
                    model.getCreativeParameters.returns('{}');
                    campaign.getVPAID.returns(model);
                    var privacy = new Privacy_1.Privacy(nativeBridge, true);
                    view = new VPAID_2.VPAID(nativeBridge, campaign, TestFixtures_1.TestFixtures.getPlacement());
                    eventHandler = {
                        onVPAIDCompanionClick: sinon.spy(),
                        onVPAIDCompanionView: sinon.spy(),
                        onVPAIDEvent: sinon.spy(),
                        onVPAIDStuck: sinon.spy(),
                        onVPAIDSkip: sinon.spy(),
                        onVPAIDProgress: sinon.spy()
                    };
                    view.addEventHandler(eventHandler);
                });
                describe('loading web player', function () {
                    beforeEach(function () {
                        return view.loadWebPlayer();
                    });
                    it('should call setData on the WebPlayer', function () {
                        sinon.assert.called(nativeBridge.WebPlayer.setData);
                    });
                });
                var verifyEventSent = function (event, parameters) {
                    return function () {
                        var webPlayerParams = [event];
                        if (parameters) {
                            webPlayerParams.push(parameters);
                        }
                        sinon.assert.calledWith(nativeBridge.WebPlayer.sendEvent, webPlayerParams);
                    };
                };
                var sendWebPlayerEvent = function (event) {
                    var parameters = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        parameters[_i - 1] = arguments[_i];
                    }
                    return function () {
                        var args = [];
                        if (parameters.length > 0) {
                            args = parameters;
                        }
                        args.unshift(event);
                        nativeBridge.WebPlayer.onWebPlayerEvent.trigger(JSON.stringify(args));
                        return new Promise(function (res) { return window.setTimeout(res); });
                    };
                };
                describe('hide', function () {
                    beforeEach(function () {
                        view.hide();
                    });
                    it('should send the "destroy" event', verifyEventSent('destroy'));
                });
                describe('showAd', function () {
                    beforeEach(function () {
                        view.showAd();
                    });
                    it('should send the "show" event', verifyEventSent('show'));
                });
                describe('pauseAd', function () {
                    beforeEach(function () {
                        view.pauseAd();
                    });
                    it('should send the "pause" event', verifyEventSent('pause'));
                });
                describe('resumeAd', function () {
                    beforeEach(function () {
                        view.resumeAd();
                    });
                    it('should send the "resume" event', verifyEventSent('resume'));
                });
                describe('mute', function () {
                    beforeEach(function () {
                        view.mute();
                    });
                    it('should send the "mute" event', verifyEventSent('mute'));
                });
                describe('unmute', function () {
                    beforeEach(function () {
                        view.unmute();
                    });
                    it('should send the "unmute" event', verifyEventSent('unmute'));
                });
                describe('handling web player events', function () {
                    beforeEach(function () {
                        return view.loadWebPlayer();
                    });
                    describe('on webplayer "ready" event', function () {
                        beforeEach(sendWebPlayerEvent('ready'));
                        it('should respond with the "init" event', verifyEventSent('init', [{
                                width: 320,
                                height: 480,
                                bitrate: 500,
                                viewMode: 'normal',
                                creativeData: {
                                    AdParameters: '{}'
                                }
                            }]));
                    });
                    describe('on webplayer "progress" event', function () {
                        beforeEach(sendWebPlayerEvent('progress', [1, 2]));
                        it('should forward the event to the handler', function () {
                            sinon.assert.calledWith(eventHandler.onVPAIDProgress, 1, 2);
                        });
                    });
                    describe('on webplayer "VPAID" event', function () {
                        var event = 'AdLoaded';
                        var params = ['foo', 'bar'];
                        beforeEach(sendWebPlayerEvent('VPAID', [event, params]));
                        it('should forward the event to the handler', function () {
                            sinon.assert.calledWith(eventHandler.onVPAIDEvent, event, params);
                        });
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlBBSURUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiVlBBSURUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7WUFpQkEsUUFBUSxDQUFDLFlBQVksRUFBRTtnQkFDbkIsSUFBSSxZQUEwQixDQUFDO2dCQUMvQixJQUFJLFFBQXVCLENBQUM7Z0JBQzVCLElBQUksWUFBMkIsQ0FBQztnQkFDaEMsSUFBSSxJQUFXLENBQUM7Z0JBRWhCLFVBQVUsQ0FBQztvQkFDUCxZQUFZLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDLDJCQUFZLENBQUMsQ0FBQztvQkFDdEQsUUFBUSxHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyw2QkFBYSxDQUFDLENBQUM7b0JBRW5ELElBQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQywwQkFBYSxDQUFDLENBQUM7b0JBQzNELFVBQVUsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFDeEQsVUFBVSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUNuRCxZQUFhLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztvQkFFNUMsSUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDLHdCQUFZLENBQUMsQ0FBQztvQkFDekQsU0FBUyxDQUFDLGdCQUFnQixHQUFHLElBQUksd0JBQVcsRUFBVSxDQUFDO29CQUN2RCxTQUFTLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztvQkFDN0MsU0FBUyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7b0JBQ3pDLFlBQWEsQ0FBQyxTQUFT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