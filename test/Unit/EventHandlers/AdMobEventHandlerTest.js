System.register(["sinon", "chai", "EventHandlers/AdmobEventHandler", "AdUnits/AdMobAdUnit", "Native/NativeBridge", "Native/Api/Intent", "Native/Api/UrlScheme", "Constants/Platform", "Utilities/Request", "Managers/ThirdPartyEventManager", "Test/Unit/TestHelpers/TestFixtures", "AdMob/AdMobSignalFactory", "Models/AdMobSignal", "Utilities/Url", "../../../../proto/unity_proto.js", "protobufjs/minimal", "Utilities/SdkStats", "Models/Campaigns/AdMobCampaign", "Models/ClientInfo", "Models/Configuration", "Managers/GdprManager"], function (exports_1, context_1) {
    "use strict";
    var sinon, chai_1, AdmobEventHandler_1, AdMobAdUnit_1, NativeBridge_1, Intent_1, UrlScheme_1, Platform_1, Request_1, ThirdPartyEventManager_1, TestFixtures_1, AdMobSignalFactory_1, AdMobSignal_1, Url_1, unity_proto_js_1, protobuf, SdkStats_1, AdMobCampaign_1, ClientInfo_1, Configuration_1, GdprManager_1, resolveAfter;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (sinon_1) {
                sinon = sinon_1;
            },
            function (chai_1_1) {
                chai_1 = chai_1_1;
            },
            function (AdmobEventHandler_1_1) {
                AdmobEventHandler_1 = AdmobEventHandler_1_1;
            },
            function (AdMobAdUnit_1_1) {
                AdMobAdUnit_1 = AdMobAdUnit_1_1;
            },
            function (NativeBridge_1_1) {
                NativeBridge_1 = NativeBridge_1_1;
            },
            function (Intent_1_1) {
                Intent_1 = Intent_1_1;
            },
            function (UrlScheme_1_1) {
                UrlScheme_1 = UrlScheme_1_1;
            },
            function (Platform_1_1) {
                Platform_1 = Platform_1_1;
            },
            function (Request_1_1) {
                Request_1 = Request_1_1;
            },
            function (ThirdPartyEventManager_1_1) {
                ThirdPartyEventManager_1 = ThirdPartyEventManager_1_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            },
            function (AdMobSignalFactory_1_1) {
                AdMobSignalFactory_1 = AdMobSignalFactory_1_1;
            },
            function (AdMobSignal_1_1) {
                AdMobSignal_1 = AdMobSignal_1_1;
            },
            function (Url_1_1) {
                Url_1 = Url_1_1;
            },
            function (unity_proto_js_1_1) {
                unity_proto_js_1 = unity_proto_js_1_1;
            },
            function (protobuf_1) {
                protobuf = protobuf_1;
            },
            function (SdkStats_1_1) {
                SdkStats_1 = SdkStats_1_1;
            },
            function (AdMobCampaign_1_1) {
                AdMobCampaign_1 = AdMobCampaign_1_1;
            },
            function (ClientInfo_1_1) {
                ClientInfo_1 = ClientInfo_1_1;
            },
            function (Configuration_1_1) {
                Configuration_1 = Configuration_1_1;
            },
            function (GdprManager_1_1) {
                GdprManager_1 = GdprManager_1_1;
            }
        ],
        execute: function () {
            resolveAfter = function (timeout) {
                return new Promise(function (resolve, reject) { return setTimeout(resolve, timeout); });
            };
            describe('AdMobEventHandler', function () {
                var admobEventHandler;
                var adUnit;
                var nativeBridge;
                var request;
                var thirdPartyEventManager;
                var session;
                var adMobSignalFactory;
                var campaign;
                var clientInfo;
                var testTimeout = 250;
                var configuration;
                var gdprManager;
                beforeEach(function () {
                    adUnit = sinon.createStubInstance(AdMobAdUnit_1.AdMobAdUnit);
                    request = sinon.createStubInstance(Request_1.Request);
                    thirdPartyEventManager = sinon.createStubInstance(ThirdPartyEventManager_1.ThirdPartyEventManager);
                    session = TestFixtures_1.TestFixtures.getSession();
                    adMobSignalFactory = sinon.createStubInstance(AdMobSignalFactory_1.AdMobSignalFactory);
                    nativeBridge = sinon.createStubInstance(NativeBridge_1.NativeBridge);
                    nativeBridge.Intent = sinon.createStubInstance(Intent_1.IntentApi);
                    nativeBridge.UrlScheme = sinon.createStubInstance(UrlScheme_1.UrlSchemeApi);
                    campaign = sinon.createStubInstance(AdMobCampaign_1.AdMobCampaign);
                    campaign.getSession.returns(TestFixtures_1.TestFixtures.getSession());
                    configuration = sinon.createStubInstance(Configuration_1.Configuration);
                    gdprManager = sinon.createStubInstance(GdprManager_1.GdprManager);
                    clientInfo = sinon.createStubInstance(ClientInfo_1.ClientInfo);
                    AdmobEventHandler_1.AdMobEventHandler.setLoadTimeout(testTimeout);
                    admobEventHandler = new AdmobEventHandler_1.AdMobEventHandler({
                        adUnit: adUnit,
                        nativeBridge: nativeBridge,
                        request: request,
                        thirdPartyEventManager: thirdPartyEventManager,
                        session: session,
                        adMobSignalFactory: adMobSignalFactory,
                        campaign: campaign,
                        clientInfo: clientInfo,
                        configuration: configuration,
                        gdprManager: gdprManager
                    });
                });
                describe('on close', function () {
                    it('should hide the ad unit', function () {
                        admobEventHandler.onClose();
                        sinon.assert.called(adUnit.hide);
                    });
                });
                describe('on open URL', function () {
                    var url = 'https://unityads.unity3d.com/open';
                    describe('on iOS', function () {
                        it('should open the UrlScheme', function () {
                            nativeBridge.getPlatform.returns(Platform_1.Platform.IOS);
                            request.followRedirectChain.returns(Promise.resolve(url));
                            admobEventHandler.onOpenURL(url);
                            return new Promise(function (resolve, reject) {
                                setTimeout(function () {
                                    try {
                                        sinon.assert.calledWith(nativeBridge.UrlScheme.open, url);
                                        resolve();
                                    }
                                    catch (e) {
                                        reject(e);
                                    }
                                });
                            });
                        });
                    });
                    describe('on Android', function () {
                        it('should open using the VIEW Intent', function () {
                            nativeBridge.getPlatform.returns(Platform_1.Platform.ANDROID);
                            admobEventHandler.onOpenURL(url);
                            sinon.assert.calledWith(nativeBridge.Intent.launch, {
                                action: 'android.intent.action.VIEW',
                                uri: url
                            });
                        });
                    });
                });
                // Note, since AdMob does timeout detection on their end, this isn't explicitly necessary.
                // describe('detecting a timeout', () => {
                //     xit('should hide and error the AdUnit if the video does not load', () => {
                //         admobEventHandler.onShow();
                //         return resolveAfter(testTimeout).then(() => {
                //             sinon.assert.calledWith(<sinon.SinonSpy>adUnit.setFinishState, FinishState.ERROR);
                //             sinon.assert.called(<sinon.SinonSpy>adUnit.hide);
                //         });
                //     });
                // });
                describe('on click', function () {
                    var startTime = Date.now();
                    var requestTime = startTime - 1000;
                    var clock;
                    var touch = {
                        start: {
                            x: 0,
                            y: 0
                        },
                        end: {
                            x: 1,
                            y: 1
                        },
                        diameter: 1,
                        pressure: 0.5,
                        duration: 5,
                        counts: {
                            up: 1,
                            down: 1,
                            cancel: 2,
                            move: 5
                        }
                    };
                    beforeEach(function () {
                        clock = sinon.useFakeTimers(requestTime);
                        SdkStats_1.SdkStats.setAdRequestTimestamp();
                        adMobSignalFactory.getClickSignal.returns(Promise.resolve(new AdMobSignal_1.AdMobSignal()));
                        adUnit.getTimeOnScreen.returns(42);
                        adUnit.getStartTime.returns(startTime);
                        adUnit.getRequestToViewTime.returns(42);
                        thirdPartyEventManager.sendEvent.returns(Promise.resolve());
                    });
                    afterEach(function () {
                        clock.restore();
                    });
                    xit('should append click signals', function () {
                        var url = 'http://unityads.unity3d.com';
                        return admobEventHandler.onAttribution(url, touch).then(function () {
                            var call = thirdPartyEventManager.sendEvent.getCall(0);
                            var calledUrl = call.args[2];
                            var param = Url_1.Url.getQueryParameter(calledUrl, 'ms');
                            if (!param) {
                                throw new Error('Expected param not to be null');
                            }
                            var buffer = new Uint8Array(protobuf.util.base64.length(param));
                            protobuf.util.base64.decode(param, buffer, 0);
                            var decodedProtoBuf = unity_proto_js_1.unity_proto.UnityProto.decode(buffer);
                            var decodedSignal = unity_proto_js_1.unity_proto.UnityInfo.decode(decodedProtoBuf.encryptedBlobs[0]);
                            chai_1.assert.equal(decodedSignal.field_36, adUnit.getTimeOnScreen());
                        });
                    });
                    it('should append the rvdt parameter', function () {
                        var url = 'http://unityads.unity3d.com';
                        return admobEventHandler.onAttribution(url, touch).then(function () {
                            var call = thirdPartyEventManager.sendEvent.getCall(0);
                            var calledUrl = call.args[2];
                            var param = Url_1.Url.getQueryParameter(calledUrl, 'rvdt');
                            if (!param) {
                                throw new Error('Expected param not to be null');
                            }
                            chai_1.assert.equal(param, adUnit.getRequestToViewTime().toString());
                        });
                    });
                });
                describe('tracking event', function () {
                    it('should forward the event to the ad unit', function () {
                        admobEventHandler.onTrackingEvent('foo');
                        adUnit.sendTrackingEvent.calledWith('foo');
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRNb2JFdmVudEhhbmRsZXJUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiQWRNb2JFdmVudEhhbmRsZXJUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBMEJNLFlBQVksR0FBRyxVQUFDLE9BQWU7Z0JBQ2pDLE9BQU8sSUFBSSxPQUFPLENBQUMsVUFBQyxPQUFPLEVBQUUsTUFBTSxJQUFLLE9BQUEsVUFBVSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsRUFBNUIsQ0FBNEIsQ0FBQyxDQUFDO1lBQzFFLENBQUMsQ0FBQztZQUVGLFFBQVEsQ0FBQyxtQkFBbUIsRUFBRTtnQkFDMUIsSUFBSSxpQkFBb0MsQ0FBQztnQkFDekMsSUFBSSxNQUFtQixDQUFDO2dCQUN4QixJQUFJLFlBQTBCLENBQUM7Z0JBQy9CLElBQUksT0FBZ0IsQ0FBQztnQkFDckIsSUFBSSxzQkFBOEMsQ0FBQztnQkFDbkQsSUFBSSxPQUFnQixDQUFDO2dCQUNyQixJQUFJLGtCQUFzQyxDQUFDO2dCQUMzQyxJQUFJLFFBQXVCLENBQUM7Z0JBQzVCLElBQUksVUFBc0IsQ0FBQztnQkFDM0IsSUFBTSxXQUFXLEdBQUcsR0FBRyxDQUFDO2dCQUN4QixJQUFJLGFBQWEsQ0FBQztnQkFDbEIsSUFBSSxXQUFXLENBQUM7Z0JBRWhCLFVBQVUsQ0FBQztvQkFDUCxNQUFNLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDLHlCQUFXLENBQUMsQ0FBQztvQkFDL0MsT0FBTyxHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxpQkFBTyxDQUFDLENBQUM7b0JBQzVDLHNCQUFzQixHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQywrQ0FBc0IsQ0FBQyxDQUFDO29CQUMxRSxPQUFPLEdBQUcsMkJBQVksQ0FBQyxVQUFVLEVBQUUsQ0FBQztvQkFDcEMsa0JBQWtC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