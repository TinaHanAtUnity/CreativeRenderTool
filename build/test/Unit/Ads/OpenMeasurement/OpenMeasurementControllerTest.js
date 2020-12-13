import * as sinon from 'sinon';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { OpenMeasurement } from 'Ads/Views/OpenMeasurement/OpenMeasurement';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { OMState } from 'Ads/Views/OpenMeasurement/OpenMeasurementController';
import { MediaType, VideoPosition, VideoPlayerState, InteractionType } from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';
import { OpenMeasurementAdViewBuilder } from 'Ads/Views/OpenMeasurement/OpenMeasurementAdViewBuilder';
import { VastOpenMeasurementController } from 'Ads/Views/OpenMeasurement/VastOpenMeasurementController';
[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe(`${platform} OMController`, () => {
        const sandbox = sinon.createSandbox();
        let placement;
        let clientInfo;
        let deviceInfo;
        let core;
        let backend;
        let nativeBridge;
        const initOMManager = (om) => {
            placement = TestFixtures.getPlacement();
            clientInfo = TestFixtures.getClientInfo(platform);
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            if (platform === Platform.ANDROID) {
                deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
            }
            else {
                deviceInfo = TestFixtures.getIosDeviceInfo(core);
            }
            const adViewBuilder = sandbox.createStubInstance(OpenMeasurementAdViewBuilder);
            return new VastOpenMeasurementController(platform, placement, om, adViewBuilder, clientInfo, deviceInfo);
        };
        describe('session events', () => {
            let omManager;
            let openMeasurement;
            beforeEach(() => {
                openMeasurement = sandbox.createStubInstance(OpenMeasurement);
                omManager = initOMManager([openMeasurement, openMeasurement]);
            });
            afterEach(() => {
                sandbox.restore();
            });
            it('sessionFinish should be called twice', () => {
                omManager.sessionFinish();
                sinon.assert.calledTwice(openMeasurement.sessionFinish);
            });
        });
        describe('adEvents', () => {
            let omManager;
            let openMeasurement;
            beforeEach(() => {
                openMeasurement = sandbox.createStubInstance(OpenMeasurement);
                omManager = initOMManager([openMeasurement, openMeasurement]);
            });
            afterEach(() => {
                sandbox.restore();
            });
            it('should fire multiple impression events regardless of state', () => {
                const impValues = {
                    mediaType: MediaType.VIDEO
                };
                omManager.impression(impValues);
                sinon.assert.calledWith(openMeasurement.triggerAdEvent, 'omidImpression', impValues);
                sinon.assert.calledTwice(openMeasurement.triggerAdEvent);
            });
            it('should fire multiple loaded events regardless of state', () => {
                const vastProperties = {
                    skippable: false,
                    skipOffset: 10,
                    autoplay: true,
                    position: VideoPosition.STANDALONE // Always standalone video
                };
                omManager.loaded(vastProperties);
                sinon.assert.calledWith(openMeasurement.triggerVideoEvent, 'omidLoaded', vastProperties);
                sinon.assert.calledTwice(openMeasurement.triggerVideoEvent);
            });
            it('start event with varying states', () => {
                assert.equal(omManager.getState(), OMState.STOPPED);
                omManager.start(10);
                assert.equal(omManager.getState(), OMState.PLAYING);
                sinon.assert.calledTwice(openMeasurement.triggerVideoEvent);
            });
            it('should fire multiple playerStateChanged events regardless of state', () => {
                omManager.playerStateChanged(VideoPlayerState.NORMAL);
                sinon.assert.calledWith(openMeasurement.triggerVideoEvent, 'omidPlayerStateChange', { state: 'normal' });
                sinon.assert.calledTwice(openMeasurement.triggerVideoEvent);
            });
            it('should fire multiple sendFirstQuartile events regardless of state', () => {
                omManager.sendFirstQuartile();
                sinon.assert.calledWith(openMeasurement.triggerVideoEvent, 'omidFirstQuartile');
                sinon.assert.calledTwice(openMeasurement.triggerVideoEvent);
            });
            it('should fire multiple sendMidpoint events regardless of state', () => {
                omManager.sendMidpoint();
                sinon.assert.calledWith(openMeasurement.triggerVideoEvent, 'omidMidpoint');
                sinon.assert.calledTwice(openMeasurement.triggerVideoEvent);
            });
            it('should fire multiple sendThirdQuartile events regardless of state', () => {
                omManager.sendThirdQuartile();
                sinon.assert.calledWith(openMeasurement.triggerVideoEvent, 'omidThirdQuartile');
                sinon.assert.calledTwice(openMeasurement.triggerVideoEvent);
            });
            it('completed event with varying states', () => {
                omManager.start(10);
                assert.equal(omManager.getState(), OMState.PLAYING);
                omManager.completed();
                assert.equal(omManager.getState(), OMState.COMPLETED);
                assert.equal(openMeasurement.triggerVideoEvent.callCount, 4);
                openMeasurement.triggerVideoEvent.getCall(2).calledWithExactly('omidComplete');
                openMeasurement.triggerVideoEvent.getCall(3).calledWithExactly('omidComplete');
            });
            describe('pause event with varying states', () => {
                it('should not call if not playing', () => {
                    omManager.pause();
                    assert.equal(omManager.getState(), OMState.STOPPED);
                    sinon.assert.notCalled(openMeasurement.triggerVideoEvent);
                });
                it('should call if playing', () => {
                    omManager.start(10);
                    assert.equal(omManager.getState(), OMState.PLAYING);
                    omManager.pause();
                    assert.equal(omManager.getState(), OMState.PAUSED);
                    assert.equal(openMeasurement.triggerVideoEvent.callCount, 4);
                    openMeasurement.triggerVideoEvent.getCall(2).calledWithExactly('omidPause');
                    openMeasurement.triggerVideoEvent.getCall(3).calledWithExactly('omidPause');
                });
            });
            describe('resume event with varying states', () => {
                it('should not call if not paused', () => {
                    omManager.resume();
                    assert.equal(omManager.getState(), OMState.STOPPED);
                    sinon.assert.notCalled(openMeasurement.triggerVideoEvent);
                });
                it('should call if paused', () => {
                    omManager.start(10);
                    assert.equal(omManager.getState(), OMState.PLAYING);
                    omManager.pause();
                    assert.equal(omManager.getState(), OMState.PAUSED);
                    omManager.resume();
                    assert.equal(omManager.getState(), OMState.PLAYING);
                    assert.equal(openMeasurement.triggerVideoEvent.callCount, 6);
                    openMeasurement.triggerVideoEvent.getCall(4).calledWithExactly('omidResume');
                    openMeasurement.triggerVideoEvent.getCall(5).calledWithExactly('omidResume');
                });
            });
            it('skipped event with varying states', () => {
                omManager.skipped();
                assert.equal(omManager.getState(), OMState.STOPPED);
                sinon.assert.calledTwice(openMeasurement.triggerVideoEvent);
            });
            it('volumeChange event with varying states', () => {
                omManager.volumeChange(1);
                assert.equal(omManager.getState(), OMState.STOPPED);
                sinon.assert.calledTwice(openMeasurement.triggerVideoEvent);
            });
            it('adUserInteraction', () => {
                omManager.adUserInteraction(InteractionType.CLICK);
                sinon.assert.calledWith(openMeasurement.triggerVideoEvent, 'omidAdUserInteraction', { interactionType: InteractionType.CLICK });
                sinon.assert.calledTwice(openMeasurement.triggerVideoEvent);
            });
            it('should fire multiple bufferStart regardless of state', () => {
                omManager.bufferStart();
                sinon.assert.calledWith(openMeasurement.triggerVideoEvent, 'omidBufferStart');
                sinon.assert.calledTwice(openMeasurement.triggerVideoEvent);
            });
            it('should fire multiple bufferFinish regardless of state', () => {
                omManager.bufferFinish();
                sinon.assert.calledWith(openMeasurement.triggerVideoEvent, 'omidBufferFinish');
                sinon.assert.calledTwice(openMeasurement.triggerVideoEvent);
            });
            it('geometryChange event with varying states', () => {
                omManager.start(10);
                assert.equal(omManager.getState(), OMState.PLAYING);
                const viewport = { width: 1, height: 1 };
                const rect = { x: 1, y: 1, width: 1, height: 1 };
                const rect2 = { x: 1, y: 1, width: 1, height: 1, obstructions: [] };
                const adview = { percentageInView: 1, geometry: rect, onScreenGeometry: rect2, measuringElement: false, reasons: [] };
                omManager.geometryChange(viewport, adview);
                assert.equal(omManager.getState(), OMState.PLAYING);
                assert.equal(openMeasurement.triggerAdEvent.callCount, 2);
                openMeasurement.triggerAdEvent.getCall(0).calledWithExactly('omidGeometryChange', { viewport, adview });
                openMeasurement.triggerAdEvent.getCall(1).calledWithExactly('omidGeometryChange', { viewport, adview });
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3Blbk1lYXN1cmVtZW50Q29udHJvbGxlclRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi90ZXN0L1VuaXQvQWRzL09wZW5NZWFzdXJlbWVudC9PcGVuTWVhc3VyZW1lbnRDb250cm9sbGVyVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUMvQixPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzlCLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUVuRCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sMkNBQTJDLENBQUM7QUFDNUUsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ3hELE9BQU8sRUFBNkIsT0FBTyxFQUFFLE1BQU0scURBQXFELENBQUM7QUFDekcsT0FBTyxFQUFxQixTQUFTLEVBQW1CLGFBQWEsRUFBRSxnQkFBZ0IsRUFBRSxlQUFlLEVBQVcsTUFBTSxvREFBb0QsQ0FBQztBQUM5SyxPQUFPLEVBQUUsNEJBQTRCLEVBQUUsTUFBTSx3REFBd0QsQ0FBQztBQUN0RyxPQUFPLEVBQUUsNkJBQTZCLEVBQUUsTUFBTSx5REFBeUQsQ0FBQztBQVN4RyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTtJQUNoRCxRQUFRLENBQUMsR0FBRyxRQUFRLGVBQWUsRUFBRSxHQUFHLEVBQUU7UUFDdEMsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ3RDLElBQUksU0FBb0IsQ0FBQztRQUN6QixJQUFJLFVBQXNCLENBQUM7UUFDM0IsSUFBSSxVQUFzQixDQUFDO1FBQzNCLElBQUksSUFBYyxDQUFDO1FBQ25CLElBQUksT0FBZ0IsQ0FBQztRQUNyQixJQUFJLFlBQTBC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