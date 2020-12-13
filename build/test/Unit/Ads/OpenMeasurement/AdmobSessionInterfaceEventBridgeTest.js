import * as sinon from 'sinon';
import { OpenMeasurement } from 'Ads/Views/OpenMeasurement/OpenMeasurement';
import { Platform } from 'Core/Constants/Platform';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { RequestManager } from 'Core/Managers/RequestManager';
import { AdMobSessionInterfaceEventBridge, OMEvents, OMSessionInfo } from 'Ads/Views/OpenMeasurement/AdMobSessionInterfaceEventBridge';
import { VideoPosition, VideoPlayerState, InteractionType, SessionEvents, OMID3pEvents, MediaType } from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';
[Platform.ANDROID, Platform.IOS].forEach(platform => {
    const sandbox = sinon.createSandbox();
    let omInstance;
    let backend;
    let nativeBridge;
    let core;
    let clientInformation;
    let campaign;
    let placement;
    let deviceInfo;
    let request;
    let iframe;
    let handler;
    let omidEventBridge;
    describe(`${platform} AdmobSessionInterfaceEventBridge`, () => {
        beforeEach(() => {
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            clientInformation = TestFixtures.getClientInfo(platform);
            campaign = TestFixtures.getAdVerificationsVastCampaign();
            placement = TestFixtures.getPlacement();
            if (platform === Platform.ANDROID) {
                deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
            }
            else {
                deviceInfo = TestFixtures.getIosDeviceInfo(core);
            }
            omInstance = sinon.createStubInstance(OpenMeasurement);
            request = sinon.createStubInstance(RequestManager);
            iframe = document.createElement('iframe');
            document.body.appendChild(iframe);
            handler = {
                onImpression: sinon.spy(),
                onLoaded: sinon.spy(),
                onStart: sinon.spy(),
                onSendFirstQuartile: sinon.spy(),
                onSendMidpoint: sinon.spy(),
                onSendThirdQuartile: sinon.spy(),
                onCompleted: sinon.spy(),
                onPause: sinon.spy(),
                onResume: sinon.spy(),
                onBufferStart: sinon.spy(),
                onBufferFinish: sinon.spy(),
                onSkipped: sinon.spy(),
                onVolumeChange: sinon.spy(),
                onPlayerStateChange: sinon.spy(),
                onAdUserInteraction: sinon.spy(),
                onSessionStart: sinon.spy(),
                onSessionError: sinon.spy(),
                onSessionFinish: sinon.spy(),
                onInjectVerificationResources: sinon.spy(),
                onSlotElement: sinon.spy(),
                onVideoElement: sinon.spy(),
                onElementBounds: sinon.spy()
            };
            omidEventBridge = new AdMobSessionInterfaceEventBridge(core, handler, omInstance);
            omidEventBridge.connect();
        });
        afterEach(() => {
            document.body.removeChild(iframe);
            omidEventBridge.disconnect();
            sandbox.restore();
        });
        const sendEvent = (e, data) => {
            return () => {
                return new Promise((res) => {
                    window.postMessage({
                        type: 'omid',
                        event: e,
                        data: data
                    }, '*');
                    setTimeout(res);
                });
            };
        };
        describe('receiving OMID events', () => {
            const tests = [
                {
                    event: OMEvents.IMPRESSION_OCCURRED,
                    data: {
                        mediaType: MediaType.VIDEO,
                        videoEventAdaptorType: 'test',
                        videoEventAdaptorVersion: 'test'
                    },
                    verify: (data) => sinon.assert.calledWith(handler.onImpression, data)
                },
                {
                    event: OMEvents.LOADED,
                    data: {
                        skippable: true,
                        skipOffset: 5,
                        isAutoplay: true,
                        position: VideoPosition.STANDALONE
                    },
                    verify: (data) => sinon.assert.calledWith(handler.onLoaded, data)
                },
                {
                    event: OMEvents.START,
                    data: {
                        duration: 1,
                        videoPlayerVolume: 1
                    },
                    verify: (data) => sinon.assert.calledWith(handler.onStart, data.duration, data.videoPlayerVolume)
                },
                {
                    event: OMEvents.FIRST_QUARTILE,
                    verify: (data) => sinon.assert.calledWith(handler.onSendFirstQuartile)
                },
                {
                    event: OMEvents.MIDPOINT,
                    verify: (data) => sinon.assert.calledWith(handler.onSendMidpoint)
                },
                {
                    event: OMEvents.THIRD_QUARTILE,
                    verify: (data) => sinon.assert.calledWith(handler.onSendThirdQuartile)
                },
                {
                    event: OMEvents.COMPLETE,
                    verify: (data) => sinon.assert.calledWith(handler.onCompleted)
                },
                {
                    event: OMEvents.PAUSE,
                    verify: (data) => sinon.assert.calledWith(handler.onPause)
                },
                {
                    event: OMEvents.RESUME,
                    verify: (data) => sinon.assert.calledWith(handler.onResume)
                },
                {
                    event: OMEvents.BUFFER_START,
                    verify: (data) => sinon.assert.calledWith(handler.onBufferStart)
                },
                {
                    event: OMEvents.BUFFER_FINISH,
                    verify: (data) => sinon.assert.calledWith(handler.onBufferFinish)
                },
                {
                    event: OMEvents.SKIPPED,
                    verify: (data) => sinon.assert.calledWith(handler.onSkipped)
                },
                {
                    event: OMEvents.VOLUME_CHANGE,
                    data: {
                        videoPlayerVolume: 1
                    },
                    verify: (data) => sinon.assert.calledWith(handler.onVolumeChange, data.videoPlayerVolume)
                },
                {
                    event: OMEvents.PLAYER_STATE_CHANGE,
                    data: {
                        playerState: VideoPlayerState.FULLSCREEN
                    },
                    verify: (data) => sinon.assert.calledWith(handler.onPlayerStateChange, data.playerState)
                },
                {
                    event: OMEvents.AD_USER_INTERACTION,
                    data: {
                        interactionType: InteractionType.CLICK
                    },
                    verify: (data) => sinon.assert.calledWith(handler.onAdUserInteraction, data.interactionType)
                },
                {
                    event: SessionEvents.SESSION_START,
                    data: {
                        adSessionId: 'testid',
                        timestamp: 'date',
                        type: 'sessionStart',
                        data: {}
                    },
                    verify: (data) => sinon.assert.calledWith(handler.onSessionStart, data)
                },
                {
                    event: SessionEvents.SESSION_FINISH,
                    data: {
                        adSessionId: 'testid',
                        timestamp: 'date',
                        type: 'sessionFinish',
                        data: {}
                    },
                    verify: (data) => sinon.assert.calledWith(handler.onSessionFinish, data)
                },
                {
                    event: SessionEvents.SESSION_ERROR,
                    data: {
                        adSessionId: 'testid',
                        timestamp: 'date',
                        type: 'sessionError',
                        data: {}
                    },
                    verify: (data) => sinon.assert.calledWith(handler.onSessionError, data)
                },
                {
                    event: OMID3pEvents.VERIFICATION_RESOURCES,
                    data: {
                        resourceUrl: 'test.js',
                        vendorKey: 'test-vendor-key',
                        verificationParameters: 'verificationParams'
                    },
                    verify: (data) => sinon.assert.calledWith(handler.onInjectVerificationResources, data)
                },
                {
                    event: OMSessionInfo.VIDEO_ELEMENT,
                    data: {
                        videoElement: `${sinon.createStubInstance(HTMLElement)}`
                    },
                    verify: (data) => sinon.assert.calledWith(handler.onSlotElement, data.videoElement)
                },
                {
                    event: OMSessionInfo.SLOT_ELEMENT,
                    data: {
                        slotElement: `${sinon.createStubInstance(HTMLElement)}`
                    },
                    verify: (data) => sinon.assert.calledWith(handler.onVideoElement, data.slotElement)
                },
                {
                    event: OMSessionInfo.ELEMENT_BOUNDS,
                    data: {
                        elementBounds: {
                            x: 1,
                            y: 1,
                            width: 1,
                            height: 1
                        }
                    },
                    verify: (data) => {
                        sinon.assert.calledWith(handler.onElementBounds, data.elementBounds);
                    }
                }
            ];
            for (const test of tests) {
                describe(`${test.event} OMID event`, () => {
                    beforeEach(sendEvent(test.event, test.data));
                    it(`should handle the ${test.event} event`, () => test.verify(test.data));
                });
            }
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRtb2JTZXNzaW9uSW50ZXJmYWNlRXZlbnRCcmlkZ2VUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vdGVzdC9Vbml0L0Fkcy9PcGVuTWVhc3VyZW1lbnQvQWRtb2JTZXNzaW9uSW50ZXJmYWNlRXZlbnRCcmlkZ2VUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFDO0FBQy9CLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSwyQ0FBMkMsQ0FBQztBQUM1RSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFFbkQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBT3hELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUM5RCxPQUFPLEVBQWdCLGdDQUFnQyxFQUFFLFFBQVEsRUFBRSxhQUFhLEVBQUUsTUFBTSw0REFBNEQsQ0FBQztBQUVySixPQUFPLEVBQUUsYUFBYSxFQUFFLGdCQUFnQixFQUFFLGVBQWUsRUFBRSxhQUFhLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBYyxNQUFNLG9EQUFvRCxDQUFDO0FBRTFLLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFO0lBQ2hELE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUN0QyxJQUFJLFVBQTBDLENBQUM7SUFDL0MsSUFBSSxPQUFnQixDQUFDO0lBQ3JCLElBQUksWUFBMEIsQ0FBQztJQUMvQixJQUFJLElBQWMsQ0FBQztJQUNuQixJQUFJLGlCQUE2QixDQUFDO0lBQ2xDLElBQUksUUFBc0IsQ0FBQztJQUMzQixJQUFJLFNBQW9CLENBQUM7SUFDekIsSUFBSSxVQUFzQixDQUFDO0lBQzNCLElBQUksT0FBdUIsQ0FBQztJQUM1QixJ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