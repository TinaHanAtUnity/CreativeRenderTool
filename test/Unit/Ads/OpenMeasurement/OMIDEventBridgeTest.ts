import * as sinon from 'sinon';
import { OpenMeasurement } from 'Ads/Views/OpenMeasurement';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Backend } from 'Backend/Backend';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { Placement } from 'Ads/Models/Placement';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { RequestManager } from 'Core/Managers/RequestManager';
import { OMIDEventBridge, IOMIDHandler, OMEvents, MediaType, VideoPosition, VideoPlayerState, InteractionType, SESSIONEvents, OMID3pEvents } from 'Ads/Views/OMIDEventBridge';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    const sandbox = sinon.createSandbox();
    let omInstance: OpenMeasurement;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    let clientInformation: ClientInfo;
    let campaign: VastCampaign;
    let placement: Placement;
    let deviceInfo: DeviceInfo;
    let request: RequestManager;
    let iframe: HTMLIFrameElement;
    let handler: IOMIDHandler;
    let omidEventBridge: OMIDEventBridge;

    describe(`${platform} OMIDEventBridge`, () => {

        beforeEach(() => {
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            clientInformation = TestFixtures.getClientInfo(platform);
            campaign = TestFixtures.getAdVerificationsVastCampaign();
            placement = TestFixtures.getPlacement();
            if (platform === Platform.ANDROID) {
                deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
            } else {
                deviceInfo = TestFixtures.getIosDeviceInfo(core);
            }

            omInstance = sinon.createStubInstance(OpenMeasurement);
            request = sinon.createStubInstance(RequestManager);

            iframe = document.createElement('iframe');
            document.body.appendChild(iframe);

            handler =  {
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
                onPopulateVendorKey: sinon.spy(),
                onEventProcessed: sinon.spy()
            };

            omidEventBridge = new OMIDEventBridge(core, handler, iframe, campaign.getSession().getId());
            omidEventBridge.connect();
        });

        afterEach(() => {
            document.body.removeChild(iframe);
            omidEventBridge.disconnect();
            sandbox.restore();
        });

        const sendEvent = (e: string, data?: any) => {
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
                    event: OMEvents.IMPRESSION_OCCURED,
                    data: {
                        mediaType: MediaType.VIDEO,
                        videoEventAdaptorType: 'test',
                        videoEventAdaptorVersion: 'test'
                    },
                    verify: (data?: any) => sinon.assert.calledWith(<sinon.SinonSpy>handler.onImpression, data)
                },
                {
                    event: OMEvents.LOADED,
                    data: {
                        isSkippable: true,
                        skipOffset: 5,
                        isAutoplay: true,
                        position: VideoPosition.STANDALONE
                    },
                    verify: (data?: any) => sinon.assert.calledWith(<sinon.SinonSpy>handler.onLoaded, data)
                },
                {
                    event: OMEvents.START,
                    data: {
                        duration: 1,
                        videoPlayerVolume: 1
                    },
                    verify: (data?: any) => sinon.assert.calledWith(<sinon.SinonSpy>handler.onStart, data.duration, data.videoPlayerVolume)
                },
                {
                    event: OMEvents.FIRST_QUARTILE,
                    verify: (data?: any) => sinon.assert.calledWith(<sinon.SinonSpy>handler.onSendFirstQuartile)
                },
                {
                    event: OMEvents.MIDPOINT,
                    verify: (data?: any) => sinon.assert.calledWith(<sinon.SinonSpy>handler.onSendMidpoint)
                },
                {
                    event: OMEvents.THIRD_QUARTILE,
                    verify: (data?: any) => sinon.assert.calledWith(<sinon.SinonSpy>handler.onSendThirdQuartile)
                },
                {
                    event: OMEvents.COMPLETE,
                    verify: (data?: any) => sinon.assert.calledWith(<sinon.SinonSpy>handler.onCompleted)
                },
                {
                    event: OMEvents.PAUSE,
                    verify: (data?: any) => sinon.assert.calledWith(<sinon.SinonSpy>handler.onPause)
                },
                {
                    event: OMEvents.RESUME,
                    verify: (data?: any) => sinon.assert.calledWith(<sinon.SinonSpy>handler.onResume)
                },
                {
                    event: OMEvents.BUFFER_START,
                    verify: (data?: any) => sinon.assert.calledWith(<sinon.SinonSpy>handler.onBufferStart)
                },
                {
                    event: OMEvents.BUFFER_FINISH,
                    verify: (data?: any) => sinon.assert.calledWith(<sinon.SinonSpy>handler.onBufferFinish)
                },
                {
                    event: OMEvents.SKIPPED,
                    verify: (data?: any) => sinon.assert.calledWith(<sinon.SinonSpy>handler.onSkipped)
                },
                {
                    event: OMEvents.VOLUME_CHANGE,
                    data: {
                        videoPlayerVolume: 1
                    },
                    verify: (data?: any) => sinon.assert.calledWith(<sinon.SinonSpy>handler.onVolumeChange, data.videoPlayerVolume)
                },
                {
                    event: OMEvents.PLAYER_STATE_CHANGE,
                    data: {
                        playerState: VideoPlayerState.FULLSCREEN
                    },
                    verify: (data?: any) => sinon.assert.calledWith(<sinon.SinonSpy>handler.onPlayerStateChange, data.playerState)
                },
                {
                    event: OMEvents.AD_USER_INTERACTION,
                    data: {
                        interactionType: InteractionType.CLICK
                    },
                    verify: (data?: any) => sinon.assert.calledWith(<sinon.SinonSpy>handler.onAdUserInteraction, data.interactionType)
                },
                {
                    event: SESSIONEvents.SESSION_START,
                    data: {
                        adSessionId: 'testid',
                        timestamp: 'date',
                        type: 'sessionStart',
                        data: {}
                    },
                    verify: (data?: any) => sinon.assert.calledWith(<sinon.SinonSpy>handler.onSessionStart, data)
                },
                {
                    event: SESSIONEvents.SESSION_FINISH,
                    data: {
                        adSessionId: 'testid',
                        timestamp: 'date',
                        type: 'sessionFinish',
                        data: {}
                    },
                    verify: (data?: any) => sinon.assert.calledWith(<sinon.SinonSpy>handler.onSessionFinish, data)
                },
                {
                    event: SESSIONEvents.SESSION_ERROR,
                    data: {
                        adSessionId: 'testid',
                        timestamp: 'date',
                        type: 'sessionError',
                        data: {}
                    },
                    verify: (data?: any) => sinon.assert.calledWith(<sinon.SinonSpy>handler.onSessionError, data)
                },
                {
                    event: OMID3pEvents.VERIFICATION_RESOURCES,
                    data: {
                        resourceUrl: 'test.js',
                        vendorKey: 'test-vendor-key',
                        verificationParameters: 'verificationParams'
                    },
                    verify: (data?: any) => sinon.assert.calledWith(<sinon.SinonSpy>handler.onInjectVerificationResources, data)
                },
                {
                    event: OMID3pEvents.POPULATE_VENDOR_KEY,
                    data: {
                        vendorkey: 'test-vendor-key'
                    },
                    verify: (data?: any) => sinon.assert.calledWith(<sinon.SinonSpy>handler.onPopulateVendorKey, data.vendorkey)
                },
                {
                    event: OMID3pEvents.ON_EVENT_PROCESSED,
                    data: {
                        eventType: 'sessionStart'
                    },
                    verify: (data?: any) => sinon.assert.calledWith(<sinon.SinonSpy>handler.onEventProcessed, data.eventType)
                }
            ];
            for(const test of tests) {
                describe(`${test.event} OMID event`, () => {
                    beforeEach(sendEvent(test.event, test.data));
                    it(`should handle the ${test.event} event`, () => test.verify(test.data));
                });
            }
        });
    });
});
