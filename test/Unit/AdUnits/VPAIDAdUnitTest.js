System.register(["mocha", "chai", "sinon", "AdUnits/VPAIDAdUnit", "Models/VPAID/VPAIDCampaign", "Views/VPAID", "Native/NativeBridge", "AdUnits/Containers/AdUnitContainer", "Views/VPAIDEndScreen", "Managers/FocusManager", "Models/ClientInfo", "Models/DeviceInfo", "Managers/ThirdPartyEventManager", "Models/Configuration", "Utilities/Observable", "Native/Api/WebPlayer", "Utilities/Request", "AdUnits/Containers/Activity", "Native/Api/Listener", "Constants/FinishState", "Test/Unit/TestHelpers/TestFixtures", "Views/Closer", "Constants/Platform", "Managers/ProgrammaticOperativeEventManager", "Managers/GdprManager", "Views/Privacy", "ProgrammaticTrackingService/ProgrammaticTrackingService"], function (exports_1, context_1) {
    "use strict";
    var chai_1, sinon, VPAIDAdUnit_1, VPAIDCampaign_1, VPAID_1, NativeBridge_1, AdUnitContainer_1, VPAIDEndScreen_1, FocusManager_1, ClientInfo_1, DeviceInfo_1, ThirdPartyEventManager_1, Configuration_1, Observable_1, WebPlayer_1, Request_1, Activity_1, Listener_1, FinishState_1, TestFixtures_1, Closer_1, Platform_1, ProgrammaticOperativeEventManager_1, GdprManager_1, Privacy_1, ProgrammaticTrackingService_1;
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
            function (VPAIDEndScreen_1_1) {
                VPAIDEndScreen_1 = VPAIDEndScreen_1_1;
            },
            function (FocusManager_1_1) {
                FocusManager_1 = FocusManager_1_1;
            },
            function (ClientInfo_1_1) {
                ClientInfo_1 = ClientInfo_1_1;
            },
            function (DeviceInfo_1_1) {
                DeviceInfo_1 = DeviceInfo_1_1;
            },
            function (ThirdPartyEventManager_1_1) {
                ThirdPartyEventManager_1 = ThirdPartyEventManager_1_1;
            },
            function (Configuration_1_1) {
                Configuration_1 = Configuration_1_1;
            },
            function (Observable_1_1) {
                Observable_1 = Observable_1_1;
            },
            function (WebPlayer_1_1) {
                WebPlayer_1 = WebPlayer_1_1;
            },
            function (Request_1_1) {
                Request_1 = Request_1_1;
            },
            function (Activity_1_1) {
                Activity_1 = Activity_1_1;
            },
            function (Listener_1_1) {
                Listener_1 = Listener_1_1;
            },
            function (FinishState_1_1) {
                FinishState_1 = FinishState_1_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            },
            function (Closer_1_1) {
                Closer_1 = Closer_1_1;
            },
            function (Platform_1_1) {
                Platform_1 = Platform_1_1;
            },
            function (ProgrammaticOperativeEventManager_1_1) {
                ProgrammaticOperativeEventManager_1 = ProgrammaticOperativeEventManager_1_1;
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
            describe('VPAIDAdUnit', function () {
                var nativeBridge;
                var parameters;
                var adUnit;
                beforeEach(function () {
                    nativeBridge = sinon.createStubInstance(NativeBridge_1.NativeBridge);
                    parameters = {
                        campaign: sinon.createStubInstance(VPAIDCampaign_1.VPAIDCampaign),
                        closer: sinon.createStubInstance(Closer_1.Closer),
                        vpaid: sinon.createStubInstance(VPAID_1.VPAID),
                        endScreen: sinon.createStubInstance(VPAIDEndScreen_1.VPAIDEndScreen),
                        focusManager: sinon.createStubInstance(FocusManager_1.FocusManager),
                        deviceInfo: sinon.createStubInstance(DeviceInfo_1.DeviceInfo),
                        clientInfo: sinon.createStubInstance(ClientInfo_1.ClientInfo),
                        thirdPartyEventManager: sinon.createStubInstance(ThirdPartyEventManager_1.ThirdPartyEventManager),
                        operativeEventManager: sinon.createStubInstance(ProgrammaticOperativeEventManager_1.ProgrammaticOperativeEventManager),
                        placement: TestFixtures_1.TestFixtures.getPlacement(),
                        container: sinon.createStubInstance(Activity_1.Activity),
                        configuration: sinon.createStubInstance(Configuration_1.Configuration),
                        request: sinon.createStubInstance(Request_1.Request),
                        privacy: sinon.createStubInstance(Privacy_1.Privacy),
                        forceOrientation: AdUnitContainer_1.Orientation.NONE,
                        options: {},
                        gdprManager: sinon.createStubInstance(GdprManager_1.GdprManager),
                        programmaticTrackingService: sinon.createStubInstance(ProgrammaticTrackingService_1.ProgrammaticTrackingService)
                    };
                    var webPlayer = sinon.createStubInstance(WebPlayer_1.WebPlayerApi);
                    webPlayer.setSettings.returns(Promise.resolve());
                    webPlayer.setEventSettings.returns(Promise.resolve());
                    webPlayer.shouldOverrideUrlLoading = new Observable_1.Observable2();
                    nativeBridge.WebPlayer = webPlayer;
                    nativeBridge.Listener = sinon.createStubInstance(Listener_1.ListenerApi);
                    parameters.focusManager.onAppForeground = new Observable_1.Observable0();
                    parameters.focusManager.onAppBackground = new Observable_1.Observable0();
                    parameters.container.onShow = new Observable_1.Observable0();
                    parameters.container.onAndroidPause = new Observable_1.Observable0();
                    parameters.container.open.returns(Promise.resolve());
                    parameters.container.close.returns(Promise.resolve());
                    parameters.container.setViewFrame.returns(Promise.resolve());
                    parameters.deviceInfo.getScreenWidth.returns(Promise.resolve(320));
                    parameters.deviceInfo.getScreenHeight.returns(Promise.resolve(480));
                    var overlayEl = document.createElement('div');
                    overlayEl.setAttribute('id', 'closer');
                    parameters.closer.container.returns(overlayEl);
                    adUnit = new VPAIDAdUnit_1.VPAIDAdUnit(nativeBridge, parameters);
                });
                describe('on show', function () {
                    var onShowTests = function () {
                        var onStartObserver;
                        beforeEach(function () {
                            onStartObserver = sinon.spy();
                            adUnit.onStart.subscribe(onStartObserver);
                            return adUnit.show();
                        });
                        it('should trigger onStart', function () {
                            sinon.assert.calledOnce(onStartObserver);
                        });
                        it('should set up the web player', function () {
                            sinon.assert.calledOnce(nativeBridge.WebPlayer.setSettings);
                            sinon.assert.calledOnce(nativeBridge.WebPlayer.setEventSettings);
                        });
                        it('should open the container', function () {
                            sinon.assert.calledOnce(parameters.container.open);
                        });
                        afterEach(function () {
                            return adUnit.hide();
                        });
                    };
                    describe('on android', function () {
                        beforeEach(function () {
                            nativeBridge.getPlatform.returns(Platform_1.Platform.ANDROID);
                        });
                        onShowTests();
                    });
                    xdescribe('on ios', function () {
                        beforeEach(function () {
                            nativeBridge.getPlatform.returns(Platform_1.Platform.IOS);
                        });
                        onShowTests();
                    });
                });
                describe('on hide', function () {
                    var finishState = FinishState_1.FinishState.COMPLETED;
                    var onCloseObserver;
                    beforeEach(function () {
                        onCloseObserver = sinon.spy();
                        adUnit.onClose.subscribe(onCloseObserver);
                        adUnit.setFinishState(finishState);
                        var elements = document.querySelectorAll('#closer');
                        // tslint:disable-next-line:prefer-for-of
                        for (var i = 0; i < elements.length; i++) {
                            elements[i].parentNode.removeChild(elements[i]);
                        }
                        return adUnit.show().then(function () { return adUnit.hide(); });
                    });
                    it('should trigger on close', function () {
                        sinon.assert.called(onCloseObserver);
                    });
                    it('should send the finish event', function () {
                        sinon.assert.calledWith(nativeBridge.Listener.sendFinishEvent, parameters.placement.getId(), finishState);
                    });
                    it('should remove the closer from the document', function () {
                        chai_1.assert.isNull(document.querySelector('#closer'));
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlBBSURBZFVuaXRUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiVlBBSURBZFVuaXRUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7WUE4QkEsUUFBUSxDQUFDLGFBQWEsRUFBRTtnQkFDcEIsSUFBSSxZQUEwQixDQUFDO2dCQUMvQixJQUFJLFVBQWtDLENBQUM7Z0JBQ3ZDLElBQUksTUFBbUIsQ0FBQztnQkFFeEIsVUFBVSxDQUFDO29CQUNQLFlBQVksR0FBRyxLQUFLLENBQUMsa0JBQWtCLENBQUMsMkJBQVksQ0FBQyxDQUFDO29CQUV0RCxVQUFVLEdBQUc7d0JBQ1QsUUFBUSxFQUFFLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyw2QkFBYSxDQUFDO3dCQUNqRCxNQUFNLEVBQUUsS0FBSyxDQUFDLGtCQUFrQixDQUFDLGVBQU0sQ0FBQzt3QkFDeEMsS0FBSyxFQUFFLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxhQUFLLENBQUM7d0JBQ3RDLFNBQVMsRUFBRSxLQUFLLENBQUMsa0JBQWtCLENBQUMsK0JBQWMsQ0FBQzt3QkFDbkQsWUFBWSxFQUFFLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQywyQkFBWSxDQUFDO3dCQUNwRCxVQUFVLEVBQUUsS0FBSyxDQUFDLGtCQUFrQixDQUFDLHVCQUFVLENBQUM7d0JBQ2hELFVBQVUsRUFBRSxLQUFLLENBQUMsa0JBQWtCLENBQUMsdUJBQVUsQ0FBQzt3QkFDaEQsc0JBQXNCLEVBQUUsS0FBSyxDQUFDLGtCQUFrQixDQUFDLCtDQUFzQixDQUFDO3dCQUN4RSxxQkFBcUIsRUFBRSxLQUFLLENBQUMsa0JBQWtCLENBQUMscUVBQWlDLENBQUM7d0JBQ2xGLFNBQVMsRUFBRSwyQkFBWSxDQUFDLFlBQVksRUFBRTt3QkFDdEMsU0FBUyxFQUFFLEtBQUssQ0FB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