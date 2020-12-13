import { AFMABridge, AFMAEvents } from 'AdMob/Views/AFMABridge';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { Platform } from 'Core/Constants/Platform';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('AFMABridge', () => {
        let handler;
        let afmaBridge;
        let iframe;
        let backend;
        let nativeBridge;
        let core;
        beforeEach(() => {
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
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
                onAFMAUserSeeked: sinon.spy(),
                onVolumeChange: sinon.spy()
            };
            afmaBridge = new AFMABridge(core, handler);
            iframe = document.createElement('iframe');
            document.body.appendChild(iframe);
            afmaBridge.connect(iframe);
        });
        afterEach(() => {
            document.body.removeChild(iframe);
            afmaBridge.disconnect();
        });
        const sendEvent = (e, data) => {
            return () => {
                return new Promise((res) => {
                    window.postMessage({
                        type: 'afma',
                        event: e,
                        data: data
                    }, '*');
                    setTimeout(res);
                });
            };
        };
        describe('receiving AFMA events', () => {
            const tests = [{
                    event: AFMAEvents.OPEN_URL,
                    data: {
                        url: 'unityads.unity3d.com'
                    },
                    verify: (data) => sinon.assert.calledWith(handler.onAFMAOpenURL, data.url)
                }, {
                    event: AFMAEvents.CLOSE,
                    verify: (data) => sinon.assert.called(handler.onAFMAClose)
                }, {
                    event: AFMAEvents.FORCE_ORIENTATION,
                    data: {
                        orientation: 'portrait'
                    },
                    verify: (data) => sinon.assert.calledWith(handler.onAFMAForceOrientation, Orientation.PORTRAIT)
                }, {
                    event: AFMAEvents.FORCE_ORIENTATION,
                    data: {
                        orientation: 'landscape'
                    },
                    verify: (data) => sinon.assert.calledWith(handler.onAFMAForceOrientation, Orientation.LANDSCAPE)
                }, {
                    event: AFMAEvents.VIDEO_START,
                    verify: (data) => sinon.assert.called(handler.OnAFMAVideoStart)
                }, {
                    event: AFMAEvents.CLICK,
                    data: {
                        url: 'unityads.unity3d.com'
                    },
                    verify: (data) => sinon.assert.calledWith(handler.onAFMAClick, data.url)
                }, {
                    event: AFMAEvents.GRANT_REWARD,
                    verify: () => sinon.assert.called(handler.onAFMAGrantReward)
                }, {
                    event: AFMAEvents.DISABLE_BACK_BUTTON,
                    data: {
                        disabled: true
                    },
                    verify: (data) => sinon.assert.calledWith(handler.onAFMADisableBackButton, data.disabled)
                }, {
                    event: AFMAEvents.OPEN_STORE_OVERLAY,
                    data: {
                        url: 'itunes://com.unity3d.ads'
                    },
                    verify: (data) => sinon.assert.calledWith(handler.onAFMAOpenStoreOverlay, data.url)
                }, {
                    event: AFMAEvents.OPEN_IN_APP_STORE,
                    data: {
                        productId: 'com.unity3d.ads',
                        url: 'itunes://com.unity3d.ads'
                    },
                    verify: (data) => sinon.assert.calledWith(handler.onAFMAOpenInAppStore, data.productId, data.url)
                }, {
                    event: AFMAEvents.FETCH_APP_STORE_OVERLAY,
                    data: {
                        productId: 'com.unity3d.ads'
                    },
                    verify: (data) => sinon.assert.calledWith(handler.onAFMAFetchAppStoreOverlay, data.productId)
                }, {
                    event: AFMAEvents.OPEN_INTENTS_REQUEST,
                    data: {
                        id: 1,
                        intents: [{
                                id: '1',
                                packageName: 'com.unity3d.ads.foo'
                            }]
                    },
                    verify: (data) => sinon.assert.calledWith(handler.onAFMAResolveOpenableIntents, data)
                }, {
                    event: AFMAEvents.TRACKING,
                    data: {
                        event: 'foo'
                    },
                    verify: (data) => sinon.assert.calledWith(handler.onAFMATrackingEvent, data.event)
                }, {
                    event: AFMAEvents.GET_CLICK_SIGNAL,
                    data: {
                        start: { x: 1, y: 1 },
                        end: { x: 2, y: 2 }
                    },
                    verify: (data) => sinon.assert.calledWith(handler.onAFMAClickSignalRequest, data)
                }, {
                    event: AFMAEvents.USER_SEEKED,
                    verify: (data) => sinon.assert.calledWith(handler.onAFMAUserSeeked)
                }, {
                    event: AFMAEvents.VOLUME_CHANGE,
                    data: {
                        volume: 1
                    },
                    verify: (data) => sinon.assert.calledWith(handler.onVolumeChange, data.volume)
                }];
            for (const test of tests) {
                describe(`${test.event} AFMA event`, () => {
                    beforeEach(sendEvent(test.event, test.data));
                    it(`should handle the ${test.event} event`, () => test.verify(test.data));
                });
            }
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQUZNQUJyaWRnZVRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90ZXN0L1VuaXQvQWRNb2IvQUZNQUJyaWRnZVRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQWdCLE1BQU0sd0JBQXdCLENBQUM7QUFDOUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBRXJFLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUduRCxPQUFPLE9BQU8sQ0FBQztBQUNmLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFDO0FBQy9CLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUV4RCxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTtJQUNoRCxRQUFRLENBQUMsWUFBWSxFQUFFLEdBQUcsRUFBRTtRQUV4QixJQUFJLE9BQXFCLENBQUM7UUFDMUIsSUFBSSxVQUFzQixDQUFDO1FBQzNCLElBQUksTUFBeUIsQ0FBQztRQUM5QixJQUFJLE9BQWdCLENBQUM7UUFDckIsSUFBSSxZQUEwQixDQUFDO1FBQy9CLElBQUksSUFBYyxDQUFDO1FBRW5CLFVBQVUsQ0FBQyxHQUFHLEVBQUU7WUFDWixPQUFPLEdBQUcsWUFBWSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUM1QyxZQUFZLEdBQUcsWUFBWSxDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDL0QsSUFBSSxHQUFHLFlBQVksQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDN0MsT0FBTyxHQUFHO2dCQUNOLFdBQVcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFO2dCQUN4QixhQUFhLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFB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