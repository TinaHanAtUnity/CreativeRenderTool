import { AFMABridge, AFMAEvents, IAFMAHandler } from 'AdMob/Views/AFMABridge';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Backend } from 'Backend/Backend';
import { ICoreApi } from 'Core/ICore';
import { Platform } from 'Core/Constants/Platform';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('AFMABridge', () => {

        let handler: IAFMAHandler;
        let afmaBridge: AFMABridge;
        let iframe: HTMLIFrameElement;
        let backend: Backend;
        let nativeBridge: NativeBridge;
        let core: ICoreApi;

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
                onAFMAUserSeeked: sinon.spy()
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

        const sendEvent = (e: string, data?: any) => {
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
                verify: (data?: any) => sinon.assert.calledWith(<sinon.SinonSpy>handler.onAFMAOpenURL, data.url)
            }, {
                event: AFMAEvents.CLOSE,
                verify: (data?: any) => sinon.assert.called(<sinon.SinonSpy>handler.onAFMAClose)
            }, {
                event: AFMAEvents.FORCE_ORIENTATION,
                data: {
                    orientation: 'portrait'
                },
                verify: (data?: any) => sinon.assert.calledWith(<sinon.SinonSpy>handler.onAFMAForceOrientation, Orientation.PORTRAIT)
            }, {
                event: AFMAEvents.FORCE_ORIENTATION,
                data: {
                    orientation: 'landscape'
                },
                verify: (data?: any) => sinon.assert.calledWith(<sinon.SinonSpy>handler.onAFMAForceOrientation, Orientation.LANDSCAPE)
            }, {
                event: AFMAEvents.VIDEO_START,
                verify: (data?: any) => sinon.assert.called(<sinon.SinonSpy>handler.OnAFMAVideoStart)
            }, {
                event: AFMAEvents.CLICK,
                data: {
                    url: 'unityads.unity3d.com'
                },
                verify: (data?: any) => sinon.assert.calledWith(<sinon.SinonSpy>handler.onAFMAClick, data.url)
            }, {
                event: AFMAEvents.GRANT_REWARD,
                verify: () => sinon.assert.called(<sinon.SinonSpy>handler.onAFMAGrantReward)
            }, {
                event: AFMAEvents.DISABLE_BACK_BUTTON,
                data: {
                    disabled: true
                },
                verify: (data?: any) => sinon.assert.calledWith(<sinon.SinonSpy>handler.onAFMADisableBackButton, data.disabled)
            }, {
                event: AFMAEvents.OPEN_STORE_OVERLAY,
                data: {
                    url: 'itunes://com.unity3d.ads'
                },
                verify: (data?: any) => sinon.assert.calledWith(<sinon.SinonSpy>handler.onAFMAOpenStoreOverlay, data.url)
            }, {
                event: AFMAEvents.OPEN_IN_APP_STORE,
                data: {
                    productId: 'com.unity3d.ads',
                    url: 'itunes://com.unity3d.ads'
                },
                verify: (data?: any) => sinon.assert.calledWith(<sinon.SinonSpy>handler.onAFMAOpenInAppStore, data.productId, data.url)
            }, {
                event: AFMAEvents.FETCH_APP_STORE_OVERLAY,
                data: {
                    productId: 'com.unity3d.ads'
                },
                verify: (data?: any) => sinon.assert.calledWith(<sinon.SinonSpy>handler.onAFMAFetchAppStoreOverlay, data.productId)
            }, {
                event: AFMAEvents.OPEN_INTENTS_REQUEST,
                data: {
                    id: 1,
                    intents: [{
                        id: '1',
                        packageName: 'com.unity3d.ads.foo'
                    }]
                },
                verify: (data?: any) => sinon.assert.calledWith(<sinon.SinonSpy>handler.onAFMAResolveOpenableIntents, data)
            }, {
                event: AFMAEvents.TRACKING,
                data: {
                    event: 'foo'
                },
                verify: (data?: any) => sinon.assert.calledWith(<sinon.SinonSpy>handler.onAFMATrackingEvent, data.event)
            }, {
                event: AFMAEvents.GET_CLICK_SIGNAL,
                data: {
                    start: {x: 1, y: 1},
                    end: {x: 2, y: 2}
                },
                verify: (data?: any) => sinon.assert.calledWith(<sinon.SinonSpy>handler.onAFMAClickSignalRequest, data)
            }, {
                event: AFMAEvents.USER_SEEKED,
                verify: (data?: any) => sinon.assert.calledWith(<sinon.SinonSpy>handler.onAFMAUserSeeked)
            }];

            for(const test of tests) {
                describe(`${test.event} AFMA event`, () => {
                    beforeEach(sendEvent(test.event, test.data));
                    it(`should handle the ${test.event} event`, () => test.verify(test.data));
                });
            }
        });
    });
});
