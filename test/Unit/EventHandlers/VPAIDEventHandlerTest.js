System.register(["mocha", "sinon", "AdUnits/VPAIDAdUnit", "Models/VPAID/VPAIDCampaign", "Views/VPAID", "Native/NativeBridge", "AdUnits/Containers/AdUnitContainer", "AdUnits/Containers/Activity", "Constants/Platform", "Test/Unit/TestHelpers/TestFixtures", "Managers/OperativeEventManager", "Managers/ThirdPartyEventManager", "Managers/FocusManager", "Utilities/Request", "EventHandlers/VPAIDEventHandler", "Constants/FinishState", "Views/VPAIDEndScreen", "Models/DeviceInfo", "Models/ClientInfo", "Models/Configuration", "Native/Api/UrlScheme", "Native/Api/Intent", "Native/Api/Sdk", "Views/Closer", "Managers/GdprManager", "Views/Privacy", "ProgrammaticTrackingService/ProgrammaticTrackingService"], function (exports_1, context_1) {
    "use strict";
    var sinon, VPAIDAdUnit_1, VPAIDCampaign_1, VPAID_1, NativeBridge_1, AdUnitContainer_1, Activity_1, Platform_1, TestFixtures_1, OperativeEventManager_1, ThirdPartyEventManager_1, FocusManager_1, Request_1, VPAIDEventHandler_1, FinishState_1, VPAIDEndScreen_1, DeviceInfo_1, ClientInfo_1, Configuration_1, UrlScheme_1, Intent_1, Sdk_1, Closer_1, GdprManager_1, Privacy_1, ProgrammaticTrackingService_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
            },
            function (sinon_1) {
                sinon = sinon_1;
            },
            function (VPAIDAdUnit_1_1) {
                VPAIDAdUnit_1 = VPAIDAdUnit_1_1;
            },
            function (VPAIDCampaign_1_1) {
                VPAIDCampaign_1 = VPAIDCampaign_1_1;
            },
            function (VPAID_1_1) {
                VPAID_1 = VPAID_1_1;
            },
            function (NativeBridge_1_1) {
                NativeBridge_1 = NativeBridge_1_1;
            },
            function (AdUnitContainer_1_1) {
                AdUnitContainer_1 = AdUnitContainer_1_1;
            },
            function (Activity_1_1) {
                Activity_1 = Activity_1_1;
            },
            function (Platform_1_1) {
                Platform_1 = Platform_1_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            },
            function (OperativeEventManager_1_1) {
                OperativeEventManager_1 = OperativeEventManager_1_1;
            },
            function (ThirdPartyEventManager_1_1) {
                ThirdPartyEventManager_1 = ThirdPartyEventManager_1_1;
            },
            function (FocusManager_1_1) {
                FocusManager_1 = FocusManager_1_1;
            },
            function (Request_1_1) {
                Request_1 = Request_1_1;
            },
            function (VPAIDEventHandler_1_1) {
                VPAIDEventHandler_1 = VPAIDEventHandler_1_1;
            },
            function (FinishState_1_1) {
                FinishState_1 = FinishState_1_1;
            },
            function (VPAIDEndScreen_1_1) {
                VPAIDEndScreen_1 = VPAIDEndScreen_1_1;
            },
            function (DeviceInfo_1_1) {
                DeviceInfo_1 = DeviceInfo_1_1;
            },
            function (ClientInfo_1_1) {
                ClientInfo_1 = ClientInfo_1_1;
            },
            function (Configuration_1_1) {
                Configuration_1 = Configuration_1_1;
            },
            function (UrlScheme_1_1) {
                UrlScheme_1 = UrlScheme_1_1;
            },
            function (Intent_1_1) {
                Intent_1 = Intent_1_1;
            },
            function (Sdk_1_1) {
                Sdk_1 = Sdk_1_1;
            },
            function (Closer_1_1) {
                Closer_1 = Closer_1_1;
            },
            function (GdprManager_1_1) {
                GdprManager_1 = GdprManager_1_1;
            },
            function (Privacy_1_1) {
                Privacy_1 = Privacy_1_1;
            },
            function (ProgrammaticTrackingService_1_1) {
                ProgrammaticTrackingService_1 = ProgrammaticTrackingService_1_1;
            }
        ],
        execute: function () {
            describe('VPAIDEventHandlerTest', function () {
                var eventHandler;
                var nativeBridge;
                var adUnit;
                var parameters;
                beforeEach(function () {
                    var programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService_1.ProgrammaticTrackingService);
                    parameters = {
                        campaign: sinon.createStubInstance(VPAIDCampaign_1.VPAIDCampaign),
                        closer: sinon.createStubInstance(Closer_1.Closer),
                        vpaid: sinon.createStubInstance(VPAID_1.VPAID),
                        endScreen: sinon.createStubInstance(VPAIDEndScreen_1.VPAIDEndScreen),
                        focusManager: sinon.createStubInstance(FocusManager_1.FocusManager),
                        deviceInfo: sinon.createStubInstance(DeviceInfo_1.DeviceInfo),
                        clientInfo: sinon.createStubInstance(ClientInfo_1.ClientInfo),
                        thirdPartyEventManager: sinon.createStubInstance(ThirdPartyEventManager_1.ThirdPartyEventManager),
                        operativeEventManager: sinon.createStubInstance(OperativeEventManager_1.OperativeEventManager),
                        placement: TestFixtures_1.TestFixtures.getPlacement(),
                        container: sinon.createStubInstance(Activity_1.Activity),
                        configuration: sinon.createStubInstance(Configuration_1.Configuration),
                        request: sinon.createStubInstance(Request_1.Request),
                        privacy: sinon.createStubInstance(Privacy_1.Privacy),
                        forceOrientation: AdUnitContainer_1.Orientation.NONE,
                        options: {},
                        gdprManager: sinon.createStubInstance(GdprManager_1.GdprManager),
                        programmaticTrackingService: programmaticTrackingService
                    };
                    adUnit = sinon.createStubInstance(VPAIDAdUnit_1.VPAIDAdUnit);
                    parameters.campaign.getSession.returns(TestFixtures_1.TestFixtures.getSession());
                    parameters.campaign.getVideoClickTrackingURLs.returns(['https://tracking.unityads.unity3d.com']);
                    parameters.campaign.getVideoClickThroughURL.returns('https://unityads.unity3d.com');
                    nativeBridge = sinon.createStubInstance(NativeBridge_1.NativeBridge);
                    nativeBridge.UrlScheme = sinon.createStubInstance(UrlScheme_1.UrlSchemeApi);
                    nativeBridge.Intent = sinon.createStubInstance(Intent_1.IntentApi);
                    nativeBridge.Sdk = sinon.createStubInstance(Sdk_1.SdkApi);
                    eventHandler = new VPAIDEventHandler_1.VPAIDEventHandler(nativeBridge, adUnit, parameters);
                });
                describe('VPAID events', function () {
                    var triggerVPAIDEvent = function (eventType) {
                        var args = [];
                        for (var _i = 1; _i < arguments.length; _i++) {
                            args[_i - 1] = arguments[_i];
                        }
                        return function () {
                            eventHandler.onVPAIDEvent(eventType, args);
                        };
                    };
                    var verifyTrackingEvent = function (eventType) {
                        return function () {
                            sinon.assert.calledWith(adUnit.sendTrackingEvent, eventType);
                        };
                    };
                    describe('on AdLoaded', function () {
                        beforeEach(triggerVPAIDEvent('AdLoaded'));
                        it('should call adLoaded on the ad unit', function () {
                            sinon.assert.called(adUnit.onAdLoaded);
                        });
                    });
                    describe('on AdVideoFirstQuartile', function () {
                        beforeEach(triggerVPAIDEvent('AdVideoFirstQuartile'));
                        it('should trigger firstQuartile tracking', verifyTrackingEvent('firstQuartile'));
                        it('should send the first quartile operative event', function () {
                            sinon.assert.called(parameters.operativeEventManager.sendFirstQuartile);
                        });
                    });
                    describe('on AdVideoMidpoint', function () {
                        beforeEach(triggerVPAIDEvent('AdVideoMidpoint'));
                        it('should trigger midpoint tracking', verifyTrackingEvent('midpoint'));
                        it('should send the midpoint operative event', function () {
                            sinon.assert.called(parameters.operativeEventManager.sendMidpoint);
                        });
                    });
                    describe('on AdVideoThirdQuartile', function () {
                        beforeEach(triggerVPAIDEvent('AdVideoThirdQuartile'));
                        it('should trigger thirdQuartile tracking', verifyTrackingEvent('thirdQuartile'));
                        it('should send the third quartile operative event', function () {
                            sinon.assert.called(parameters.operativeEventManager.sendThirdQuartile);
                        });
                    });
                    describe('on AdVideoComplete', function () {
                        beforeEach(triggerVPAIDEvent('AdVideoComplete'));
                        it('should trigger complete tracking', verifyTrackingEvent('complete'));
                        it('should send the view operative event', function () {
                            sinon.assert.called(parameters.operativeEventManager.sendView);
                        });
                        it('should set the finish state to COMPLETE', function () {
                            sinon.assert.calledWith(adUnit.setFinishState, FinishState_1.FinishState.COMPLETED);
                        });
                    });
                    describe('on AdSkipped', function () {
                        beforeEach(triggerVPAIDEvent('AdSkipped'));
                        it('should trigger skip tracking', verifyTrackingEvent('skip'));
                        it('should send the skip operative event', function () {
                            sinon.assert.called(parameters.operativeEventManager.sendSkip);
                        });
                        it('should set the finish state to SKIPPED', function () {
                            sinon.assert.calledWith(adUnit.setFinishState, FinishState_1.FinishState.SKIPPED);
                        });
                        it('should hide the ad unit', function () {
                            sinon.assert.called(adUnit.hide);
                        });
                    });
                    describe('on AdError', function () {
                        beforeEach(triggerVPAIDEvent('AdError'));
                        it('should trigger error tracking', verifyTrackingEvent('error'));
                        it('should set the finish state to ERROR', function () {
                            sinon.assert.calledWith(adUnit.setFinishState, FinishState_1.FinishState.ERROR);
                        });
                        it('should hide the ad unit', function () {
                            sinon.assert.called(adUnit.hide);
                        });
                    });
                    describe('on AdClickThru', function () {
                        var checkClickThroughTracking = function () {
                            var urls = parameters.campaign.getVideoClickTrackingURLs();
                            for (var _i = 0, urls_1 = urls; _i < urls_1.length; _i++) {
                                var url = urls_1[_i];
                                sinon.assert.calledWith(parameters.thirdPartyEventManager.sendEvent, 'vpaid video click', TestFixtures_1.TestFixtures.getSession().getId(), url);
                            }
                        };
                        describe('on android', function () {
                            beforeEach(function () {
                                nativeBridge.getPlatform.returns(Platform_1.Platform.ANDROID);
                            });
                            describe('when url is passed', function () {
                                var aURL = 'http://learnmore2.unityads.unity3d.com';
                                beforeEach(triggerVPAIDEvent('AdClickThru', aURL, null, true));
                                it('should open the url passed', function () {
                                    sinon.assert.calledWith(adUnit.openUrl, aURL);
                                });
                                it('should send click tracking events', checkClickThroughTracking);
                            });
                            describe('when url is not passed', function () {
                                beforeEach(triggerVPAIDEvent('AdClickThru', null, null, true));
                                it('should open the url from the VAST definition', function () {
                                    sinon.assert.calledWith(adUnit.openUrl, parameters.campaign.getVideoClickThroughURL());
                                });
                                it('should send click tracking events', checkClickThroughTracking);
                            });
                        });
                        describe('on ios', function () {
                            beforeEach(function () {
                                nativeBridge.getPlatform.returns(Platform_1.Platform.IOS);
                            });
                            describe('when url is passed', function () {
                                var aURL = 'http://learnmore2.unityads.unity3d.com';
                                beforeEach(triggerVPAIDEvent('AdClickThru', aURL, null, true));
                                it('should open the url passed', function () {
                                    sinon.assert.calledWith(adUnit.openUrl, aURL);
                                });
                                it('should send click tracking events', checkClickThroughTracking);
                            });
                            describe('when url is not passed', function () {
                                beforeEach(triggerVPAIDEvent('AdClickThru', null, null, true));
                                it('should open the url from the VAST definition', function () {
                                    sinon.assert.calledWith(adUnit.openUrl, parameters.campaign.getVideoClickThroughURL());
                                });
                                it('should send click tracking events', checkClickThroughTracking);
                            });
                        });
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlBBSURFdmVudEhhbmRsZXJUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiVlBBSURFdmVudEhhbmRsZXJUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7WUE2QkEsUUFBUSxDQUFDLHVCQUF1QixFQUFFO2dCQUM5QixJQUFJLFlBQStCLENBQUM7Z0JBQ3BDLElBQUksWUFBMEIsQ0FBQztnQkFDL0IsSUFBSSxNQUFtQixDQUFDO2dCQUN4QixJQUFJLFVBQWtDLENBQUM7Z0JBRXZDLFVBQVUsQ0FBQztvQkFDUCxJQUFNLDJCQUEyQixHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyx5REFBMkIsQ0FBQyxDQUFDO29CQUMxRixVQUFVLEdBQUc7d0JBQ1QsUUFBUSxFQUFFLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyw2QkFBYSxDQUFDO3dCQUNqRCxNQUFNLEVBQUUsS0FBSyxDQUFDLGtCQUFrQixDQUFDLGVBQU0sQ0FBQzt3QkFDeEMsS0FBSyxFQUFFLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxhQUFLLENBQUM7d0JBQ3RDLFNBQVMsRUFBRSxLQUFLLENBQUMsa0JBQWtCLENBQUMsK0JBQWMsQ0FBQzt3QkFDbkQsWUFBWSxFQUFFLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQywyQkFBWSxDQUFDO3dCQUNwRCxVQUFVLEVBQUUsS0FBSyxDQUFDLGtCQUFrQixDQUFDLHVCQUFVLENBQUM7d0JBQ2hELFVBQVUsRUFBRSxLQUFLLENBQUMsa0JBQWtCLENBQUMsdUJBQVUsQ0FBQzt3QkFDaEQsc0JBQXNCLEVBQUUsS0FBSyxDQUFDLGtCQUFrQixDQUFDLCtDQUFzQixDQUFDO3dCQUN4RSxxQkFBcUIsRUFBRSxLQUFLLENBQUMsa0JBQWtCLENBQUMsNkNBQXFCLENBQUM7d0JBQ3RFLFNBQVMsRUFBRSwy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