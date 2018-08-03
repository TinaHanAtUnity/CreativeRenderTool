System.register(["mocha", "sinon", "Views/AFMABridge", "AdUnits/Containers/AdUnitContainer", "Test/Unit/TestHelpers/TestFixtures"], function (exports_1, context_1) {
    "use strict";
    var sinon, AFMABridge_1, AdUnitContainer_1, TestFixtures_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
            },
            function (sinon_1) {
                sinon = sinon_1;
            },
            function (AFMABridge_1_1) {
                AFMABridge_1 = AFMABridge_1_1;
            },
            function (AdUnitContainer_1_1) {
                AdUnitContainer_1 = AdUnitContainer_1_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            }
        ],
        execute: function () {
            describe('AFMABridge', function () {
                var handler;
                var afmaBridge;
                var iframe;
                var nativeBridge;
                beforeEach(function () {
                    nativeBridge = TestFixtures_1.TestFixtures.getNativeBridge();
                    handler = {
                        onAFMAClose: sinon.spy(),
                        onAFMAOpenURL: sinon.spy(),
                        onAFMADisableBackButton: sinon.spy(),
                        onAFMAClick: sinon.spy(),
                        onAFMAFetchAppStoreOverlay: sinon.spy(),
                        onAFMAForceOrientation: sinon.spy(),
                        onAFMAGrantReward: sinon.spy(),
                        onAFMAOpenInAppStore: sinon.spy(),
                        onAFMAOpenStoreOverlay: sinon.spy(),
                        OnAFMAVideoStart: sinon.spy(),
                        onAFMAResolveOpenableIntents: sinon.spy(),
                        onAFMATrackingEvent: sinon.spy(),
                        onAFMAClickSignalRequest: sinon.spy(),
                        onAFMAUserSeeked: sinon.spy()
                    };
                    afmaBridge = new AFMABridge_1.AFMABridge(nativeBridge, handler);
                    iframe = document.createElement('iframe');
                    document.body.appendChild(iframe);
                    afmaBridge.connect(iframe);
                });
                afterEach(function () {
                    document.body.removeChild(iframe);
                    afmaBridge.disconnect();
                });
                var sendEvent = function (e, data) {
                    return function () {
                        return new Promise(function (res) {
                            window.postMessage({
                                type: 'afma',
                                event: e,
                                data: data
                            }, '*');
                            setTimeout(res);
                        });
                    };
                };
                describe('receiving AFMA events', function () {
                    var tests = [{
                            event: AFMABridge_1.AFMAEvents.OPEN_URL,
                            data: {
                                url: 'unityads.unity3d.com'
                            },
                            verify: function (data) { return sinon.assert.calledWith(handler.onAFMAOpenURL, data.url); }
                        }, {
                            event: AFMABridge_1.AFMAEvents.CLOSE,
                            verify: function (data) { return sinon.assert.called(handler.onAFMAClose); }
                        }, {
                            event: AFMABridge_1.AFMAEvents.FORCE_ORIENTATION,
                            data: {
                                orientation: 'portrait'
                            },
                            verify: function (data) { return sinon.assert.calledWith(handler.onAFMAForceOrientation, AdUnitContainer_1.Orientation.PORTRAIT); }
                        }, {
                            event: AFMABridge_1.AFMAEvents.FORCE_ORIENTATION,
                            data: {
                                orientation: 'landscape'
                            },
                            verify: function (data) { return sinon.assert.calledWith(handler.onAFMAForceOrientation, AdUnitContainer_1.Orientation.LANDSCAPE); }
                        }, {
                            event: AFMABridge_1.AFMAEvents.VIDEO_START,
                            verify: function (data) { return sinon.assert.called(handler.OnAFMAVideoStart); }
                        }, {
                            event: AFMABridge_1.AFMAEvents.CLICK,
                            data: {
                                url: 'unityads.unity3d.com'
                            },
                            verify: function (data) { return sinon.assert.calledWith(handler.onAFMAClick, data.url); }
                        }, {
                            event: AFMABridge_1.AFMAEvents.GRANT_REWARD,
                            verify: function () { return sinon.assert.called(handler.onAFMAGrantReward); }
                        }, {
                            event: AFMABridge_1.AFMAEvents.DISABLE_BACK_BUTTON,
                            data: {
                                disabled: true
                            },
                            verify: function (data) { return sinon.assert.calledWith(handler.onAFMADisableBackButton, data.disabled); }
                        }, {
                            event: AFMABridge_1.AFMAEvents.OPEN_STORE_OVERLAY,
                            data: {
                                url: 'itunes://com.unity3d.ads'
                            },
                            verify: function (data) { return sinon.assert.calledWith(handler.onAFMAOpenStoreOverlay, data.url); }
                        }, {
                            event: AFMABridge_1.AFMAEvents.OPEN_IN_APP_STORE,
                            data: {
                                productId: 'com.unity3d.ads',
                                url: 'itunes://com.unity3d.ads'
                            },
                            verify: function (data) { return sinon.assert.calledWith(handler.onAFMAOpenInAppStore, data.productId, data.url); }
                        }, {
                            event: AFMABridge_1.AFMAEvents.FETCH_APP_STORE_OVERLAY,
                            data: {
                                productId: 'com.unity3d.ads'
                            },
                            verify: function (data) { return sinon.assert.calledWith(handler.onAFMAFetchAppStoreOverlay, data.productId); }
                        }, {
                            event: AFMABridge_1.AFMAEvents.OPEN_INTENTS_REQUEST,
                            data: {
                                id: 1,
                                intents: [{
                                        id: '1',
                                        packageName: 'com.unity3d.ads.foo'
                                    }]
                            },
                            verify: function (data) { return sinon.assert.calledWith(handler.onAFMAResolveOpenableIntents, data); }
                        }, {
                            event: AFMABridge_1.AFMAEvents.TRACKING,
                            data: {
                                event: 'foo'
                            },
                            verify: function (data) { return sinon.assert.calledWith(handler.onAFMATrackingEvent, data.event); }
                        }, {
                            event: AFMABridge_1.AFMAEvents.GET_CLICK_SIGNAL,
                            data: {
                                start: { x: 1, y: 1 },
                                end: { x: 2, y: 2 }
                            },
                            verify: function (data) { return sinon.assert.calledWith(handler.onAFMAClickSignalRequest, data); }
                        }, {
                            event: AFMABridge_1.AFMAEvents.USER_SEEKED,
                            verify: function (data) { return sinon.assert.calledWith(handler.onAFMAUserSeeked); }
                        }];
                    var _loop_1 = function (test_1) {
                        describe(test_1.event + " AFMA event", function () {
                            beforeEach(sendEvent(test_1.event, test_1.data));
                            it("should handle the " + test_1.event + " event", function () { return test_1.verify(test_1.data); });
                        });
                    };
                    for (var _i = 0, tests_1 = tests; _i < tests_1.length; _i++) {
                        var test_1 = tests_1[_i];
                        _loop_1(test_1);
                    }
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQUZNQUJyaWRnZVRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJBRk1BQnJpZGdlVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBT0EsUUFBUSxDQUFDLFlBQVksRUFBRTtnQkFFbkIsSUFBSSxPQUFxQixDQUFDO2dCQUMxQixJQUFJLFVBQXNCLENBQUM7Z0JBQzNCLElBQUksTUFBeUIsQ0FBQztnQkFDOUIsSUFBSSxZQUEwQixDQUFDO2dCQUUvQixVQUFVLENBQUM7b0JBQ1AsWUFBWSxHQUFHLDJCQUFZLENBQUMsZUFBZSxFQUFFLENBQUM7b0JBQzlDLE9BQU8sR0FBRzt3QkFDTixXQUFXLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRTt3QkFDeEIsYUFBYSxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUU7d0JBQzFCLHVCQUF1QixFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUU7d0JBQ3BDLFdBQVcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFO3dCQUN4QiwwQkFBMEIsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFO3dCQUN2QyxzQkFBc0IsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFO3dCQUNuQyxpQkFBaUIsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFO3dCQUM5QixvQkFBb0IsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFO3dCQUNqQyxzQkFBc0IsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFO3dCQUNuQyxnQkFBZ0IsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFO3dCQUM3Qiw0QkFBNEIsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFO3dCQUN6QyxtQkFBbUIsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFO3dCQUNoQyx3QkFBd0IsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFO3dCQUNyQyxnQkFBZ0IsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFO3FCQUNoQyxDQUFDO29CQUNGLFVBQVUsR0FBRyxJQUFJLHVCQUFVLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxDQUFDO29CQUNuRCxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDMUMsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQ2xDLFVBQVUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQy9CLENBQUMsQ0FBQyxDQUFDO2dCQUVILFNBQVMsQ0FBQztvQkFDTixRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDbEMsVUFBVSxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUM1QixDQUFDLENBQUMsQ0FBQztnQkFFSCxJQUFNLFNBQVMsR0FBRyxVQUFDLENBQVMsRUFBRSxJQUFVO29CQUNwQyxPQUFPO3dCQUNILE9BQU8sSUFBSSxPQUFPLENBQUMsVUFBQyxHQUFHOzRCQUNuQixNQUFNLENBQUMsV0FBVyxDQUFDO2dDQUNmLElBQUksRUFBRSxNQUFNO2dDQUNaLEtBQUssRUFBRSxDQUFDO2dDQUNSLElBQUksRUFBRSxJQUFJOzZCQUNiLEVBQUUsR0FBRyxDQUFDLENBQUM7NEJBQ1IsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO3dCQUNwQixDQUFDLENBQUMsQ0FBQztvQkFDUCxDQUFDLENBQUM7Z0JBQ04sQ0FBQyxDQUFDO2dCQUVGLFFBQVEsQ0FBQyx1QkFBdUIsRUFBRTtvQkFDOUIsSUFBTSxLQUFLLEdBQUcsQ0FBQzs0QkFDWCxLQUFLLEVBQUUsdUJBQVUsQ0FBQyxRQUFROzRCQUMxQixJQUFJLEVBQUU7Z0NBQ0YsR0FBRyxFQUFFLHNCQUFzQjs2QkFDOUI7NEJBQ0QsTUFBTSxFQUFFLFVBQUMsSUFBVSxJQUFLLE9BQUEsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQWlCLE9BQU8sQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUF4RSxDQUF3RTt5QkFDbkcsRUFBRTs0QkFDQyxLQUFLLEVBQUUsdUJBQVUsQ0FBQyxLQUFLOzRCQUN2QixNQUFNLEVBQUUsVUFBQyxJQUFVLElBQUssT0FBQSxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBaUIsT0FBTyxDQUFDLFdBQVcsQ0FBQyxFQUF4RCxDQUF3RDt5QkFDbkYsRUFBRTs0QkFDQyxLQUFLLEVBQUUsdUJBQVUsQ0FBQyxpQkFBaUI7NEJBQ25DLElBQUksRUFBRTtnQ0FDRixXQUFXLEVBQUUsVUFBVTs2QkFDMUI7NEJBQ0QsTUFBTSxFQUFFLFVBQUMsSUFBVSxJQUFLLE9BQUEsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQWlCLE9BQU8sQ0FBQyxzQkFBc0IsRUFBRSw2QkFBVyxDQUFDLFFBQVEsQ0FBQyxFQUE3RixDQUE2Rjt5QkFDeEgsRUFBRTs0QkFDQyxLQUFLLEVBQUUsdUJBQVUsQ0FBQyxpQkFBaUI7NEJBQ25DLElBQUksRUFBRTtnQ0FDRixXQUFXLEVBQUUsV0FBVzs2QkFDM0I7NEJBQ0QsTUFBTSxFQUFFLFVBQUMsSUFBVSxJQUFLLE9BQUEsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQWlCLE9BQU8sQ0FBQyxzQkFBc0IsRUFBRSw2QkFBVyxDQUFDLFNBQVMsQ0FBQyxFQUE5RixDQUE4Rjt5QkFDekgsRUFBRTs0QkFDQyxLQUFLLEVBQUUsdUJBQVUsQ0FBQyxXQUFXOzRCQUM3QixNQUFNLEVBQUUsVUFBQyxJQUFVLElBQUssT0FBQSxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBaUIsT0FBTyxDQUFDLGdCQUFnQixDQUFDLEVBQTdELENBQTZEO3lCQUN4RixFQUFFOzRCQUNDLEtBQUssRUFBRSx1QkFBVSxDQUFDLEtBQUs7NEJBQ3ZCLElBQUksRUFBRTtnQ0FDRixHQUFHLEVBQUUsc0JBQXNCOzZCQUM5Qjs0QkFDRCxNQUFNLEVBQUUsVUFBQyxJQUFVLElBQUssT0FBQSxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBaUIsT0FBTyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQXRFLENBQXNFO3lCQUNqRyxFQUFFOzRCQUNDLEtBQUssRUFBRSx1QkFBVSxDQUFDLFlBQVk7NEJBQzlCLE1BQU0sRUFBRSxjQUFNLE9BQUEsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQWlCLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxFQUE5RCxDQUE4RDt5QkFDL0UsRUFBRTs0QkFDQyxLQUFLLEVBQUUsdUJBQVUsQ0FBQyxtQkFBbUI7NEJBQ3JDLElBQUksRUFBRTtnQ0FDRixRQUFRLEVBQUUsSUFBSTs2QkFDakI7NEJBQ0QsTUFBTSxFQUFFLFVBQUMsSUFBVSxJQUFLLE9BQUEsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQWlCLE9BQU8sQ0FBQyx1QkFBdUIsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQXZGLENBQXVGO3lCQUNsSCxFQUFFOzRCQUNDLEtBQUssRUFBRSx1QkFBVSxDQUFDLGtCQUFrQjs0QkFDcEMsSUFBSSxFQUFFO2dDQUNGLEdBQUcsRUFBRSwwQkFBMEI7NkJBQ2xDOzRCQUNELE1BQU0sRUFBRSxVQUFDLElBQVUsSUFBSyxPQUFBLEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFpQixPQUFPLENBQUMsc0JBQXNCLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFqRixDQUFpRjt5QkFDNUcsRUFBRTs0QkFDQyxLQUFLLEVBQUUsdUJBQVUsQ0FBQyxpQkFBaUI7NEJBQ25DLElBQUksRUFBRTtnQ0FDRixTQUFTLEVBQUUsaUJBQWlCO2dDQUM1QixHQUFHLEVBQUUsMEJBQTBCOzZCQUNsQzs0QkFDRCxNQUFNLEVBQUUsVUFBQyxJQUFVLElBQUssT0FBQSxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBaUIsT0FBTyxDQUFDLG9CQUFvQixFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUEvRixDQUErRjt5QkFDMUgsRUFBRTs0QkFDQyxLQUFLLEVBQUUsdUJBQVUsQ0FBQyx1QkFBdUI7NEJBQ3pDLElBQUksRUFBRTtnQ0FDRixTQUFTLEVBQUUsaUJBQWlCOzZCQUMvQjs0QkFDRCxNQUFNLEVBQUUsVUFBQyxJQUFVLElBQUssT0FBQSxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBaUIsT0FBTyxDQUFDLDBCQUEwQixFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBM0YsQ0FBMkY7eUJBQ3RILEVBQUU7NEJBQ0MsS0FBSyxFQUFFLHVCQUFVLENBQUMsb0JBQW9COzRCQUN0QyxJQUFJLEVBQUU7Z0NBQ0YsRUFBRSxFQUFFLENBQUM7Z0NBQ0wsT0FBTyxFQUFFLENBQUM7d0NBQ04sRUFBRSxFQUFFLEdBQUc7d0NBQ1AsV0FBVyxFQUFFLHFCQUFxQjtxQ0FDckMsQ0FBQzs2QkFDTDs0QkFDRCxNQUFNLEVBQUUsVUFBQyxJQUFVLElBQUssT0FBQSxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBaUIsT0FBTyxDQUFDLDRCQUE0QixFQUFFLElBQUksQ0FBQyxFQUFuRixDQUFtRjt5QkFDOUcsRUFBRTs0QkFDQyxLQUFLLEVBQUUsdUJBQVUsQ0FBQyxRQUFROzRCQUMxQixJQUFJLEVBQUU7Z0NBQ0YsS0FBSyxFQUFFLEtBQUs7NkJBQ2Y7NEJBQ0QsTUFBTSxFQUFFLFVBQUMsSUFBVSxJQUFLLE9BQUEsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQWlCLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQWhGLENBQWdGO3lCQUMzRyxFQUFFOzRCQUNDLEtBQUssRUFBRSx1QkFBVSxDQUFDLGdCQUFnQjs0QkFDbEMsSUFBSSxFQUFFO2dDQUNGLEtBQUssRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRTtnQ0FDckIsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFDOzZCQUNyQjs0QkFDRCxNQUFNLEVBQUUsVUFBQyxJQUFVLElBQUssT0FBQSxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBaUIsT0FBTyxDQUFDLHdCQUF3QixFQUFFLElBQUksQ0FBQyxFQUEvRSxDQUErRTt5QkFDMUcsRUFBRTs0QkFDQyxLQUFLLEVBQUUsdUJBQVUsQ0FBQyxXQUFXOzRCQUM3QixNQUFNLEVBQUUsVUFBQyxJQUFVLElBQUssT0FBQSxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBaUIsT0FBTyxDQUFDLGdCQUFnQixDQUFDLEVBQWpFLENBQWlFO3lCQUM1RixDQUFDLENBQUM7NENBRVEsTUFBSTt3QkFDWCxRQUFRLENBQUksTUFBSSxDQUFDLEtBQUssZ0JBQWEsRUFBRTs0QkFDakMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxNQUFJLENBQUMsS0FBSyxFQUFFLE1BQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDOzRCQUM3QyxFQUFFLENBQUMsdUJBQXFCLE1BQUksQ0FBQyxLQUFLLFdBQVEsRUFBRSxjQUFNLE9BQUEsTUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFJLENBQUMsSUFBSSxDQUFDLEVBQXRCLENBQXNCLENBQUMsQ0FBQzt3QkFDOUUsQ0FBQyxDQUFDLENBQUM7b0JBQ1AsQ0FBQztvQkFMRCxLQUFtQixVQUFLLEVBQUwsZUFBSyxFQUFMLG1CQUFLLEVBQUwsSUFBSzt3QkFBbkIsSUFBTSxNQUFJLGNBQUE7Z0NBQUosTUFBSTtxQkFLZDtnQkFDTCxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDIn0=