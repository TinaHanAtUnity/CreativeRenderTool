import * as sinon from 'sinon';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { Placement } from 'Ads/Models/Placement';
import { OpenMeasurement } from 'Ads/Views/OpenMeasurement/OpenMeasurement';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { OpenMeasurementManager, OMState } from 'Ads/Views/OpenMeasurement/OpenMeasurementManager';
import { IImpressionValues, MediaType, IVastProperties, VideoPosition, VideoPlayerState, InteractionType, IAdView } from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe(`${platform} OMManager`, () => {
        const sandbox = sinon.createSandbox();
        let placement: Placement;

        const initOMManager = (om: OpenMeasurement[]) => {
            placement = TestFixtures.getPlacement();
            return new OpenMeasurementManager(placement, om);
        };

        describe('session events', () => {
            let omManager: OpenMeasurementManager;
            let openMeasurement: OpenMeasurement;

            beforeEach(() => {
                openMeasurement = sandbox.createStubInstance(OpenMeasurement);
                omManager = initOMManager([openMeasurement, openMeasurement]);
            });
            afterEach(() => {
                sandbox.restore();
            });

            it('sessionStart should be called twice', () => {
                omManager.sessionStart();
                sinon.assert.calledTwice(<sinon.SinonStub>openMeasurement.sessionStart);
            });
            it('sessionFinish should be called twice', () => {
                omManager.sessionFinish();
                sinon.assert.calledTwice(<sinon.SinonStub>openMeasurement.sessionFinish);
            });
        });

        describe('adEvents', () => {
            let omManager: OpenMeasurementManager;
            let openMeasurement: OpenMeasurement;

            beforeEach(() => {
                openMeasurement = sandbox.createStubInstance(OpenMeasurement);
                omManager = initOMManager([openMeasurement, openMeasurement]);
            });
            afterEach(() => {
                sandbox.restore();
            });

            it('should fire multiple impression events regardless of state', () => {
                const impValues: IImpressionValues = {
                    mediaType: MediaType.VIDEO
                };
                omManager.impression(impValues);
                sinon.assert.calledWith(<sinon.SinonStub>openMeasurement.triggerAdEvent, 'omidImpression', impValues);
                sinon.assert.calledTwice(<sinon.SinonStub>openMeasurement.triggerAdEvent);
            });

            it('should fire multiple loaded events regardless of state', () => {
                const vastProperties: IVastProperties = {
                    isSkippable: false,
                    skipOffset: 10,
                    isAutoplay: true,                   // Always autoplay for video
                    position: VideoPosition.STANDALONE  // Always standalone video
                };
                omManager.loaded(vastProperties);
                sinon.assert.calledWith(<sinon.SinonStub>openMeasurement.triggerVideoEvent, 'omidLoaded', { vastProperties });
                sinon.assert.calledTwice(<sinon.SinonStub>openMeasurement.triggerVideoEvent);
            });

            it('start event with varying states', () => {
                assert.equal(omManager.getState(), OMState.STOPPED);
                omManager.start(10);

                assert.equal(omManager.getState(), OMState.PLAYING);
                sinon.assert.calledTwice(<sinon.SinonStub>openMeasurement.triggerVideoEvent);
            });

            it('should fire multiple playerStateChanged events regardless of state', () => {
                omManager.playerStateChanged(VideoPlayerState.NORMAL);
                sinon.assert.calledWith(<sinon.SinonStub>openMeasurement.triggerVideoEvent, 'omidPlayerStateChange', { state: 'normal' });
                sinon.assert.calledTwice(<sinon.SinonStub>openMeasurement.triggerVideoEvent);
            });

            it('should fire multiple sendFirstQuartile events regardless of state', () => {
                omManager.sendFirstQuartile();
                sinon.assert.calledWith(<sinon.SinonStub>openMeasurement.triggerVideoEvent, 'omidFirstQuartile');
                sinon.assert.calledTwice(<sinon.SinonStub>openMeasurement.triggerVideoEvent);
            });

            it('should fire multiple sendMidpoint events regardless of state', () => {
                omManager.sendMidpoint();
                sinon.assert.calledWith(<sinon.SinonStub>openMeasurement.triggerVideoEvent, 'omidMidpoint');
                sinon.assert.calledTwice(<sinon.SinonStub>openMeasurement.triggerVideoEvent);
            });

            it('should fire multiple sendThirdQuartile events regardless of state', () => {
                omManager.sendThirdQuartile();
                sinon.assert.calledWith(<sinon.SinonStub>openMeasurement.triggerVideoEvent, 'omidThirdQuartile');
                sinon.assert.calledTwice(<sinon.SinonStub>openMeasurement.triggerVideoEvent);
            });
            it('completed event with varying states', () => {
                omManager.start(10);
                assert.equal(omManager.getState(), OMState.PLAYING);

                omManager.completed();
                assert.equal(omManager.getState(), OMState.COMPLETED);

                assert.equal((<sinon.SinonStub>openMeasurement.triggerVideoEvent).callCount, 4);
                (<sinon.SinonStub>openMeasurement.triggerVideoEvent).getCall(2).calledWithExactly('omidComplete');
                (<sinon.SinonStub>openMeasurement.triggerVideoEvent).getCall(3).calledWithExactly('omidComplete');
            });
            describe('pause event with varying states', () => {
                it('should not call if not playing', () => {
                    omManager.pause();
                    assert.equal(omManager.getState(), OMState.STOPPED);
                    sinon.assert.notCalled(<sinon.SinonStub>openMeasurement.triggerVideoEvent);
                });
                it('should call if playing', () => {
                    omManager.start(10);
                    assert.equal(omManager.getState(), OMState.PLAYING);
                    omManager.pause();
                    assert.equal(omManager.getState(), OMState.PAUSED);

                    assert.equal((<sinon.SinonStub>openMeasurement.triggerVideoEvent).callCount, 4);
                    (<sinon.SinonStub>openMeasurement.triggerVideoEvent).getCall(2).calledWithExactly('omidPause');
                    (<sinon.SinonStub>openMeasurement.triggerVideoEvent).getCall(3).calledWithExactly('omidPause');
                });
            });
            describe('resume event with varying states', () => {
                it('should not call if not paused', () => {
                    omManager.resume();
                    assert.equal(omManager.getState(), OMState.STOPPED);
                    sinon.assert.notCalled(<sinon.SinonStub>openMeasurement.triggerVideoEvent);
                });
                it('should call if paused', () => {
                    omManager.start(10);
                    assert.equal(omManager.getState(), OMState.PLAYING);
                    omManager.pause();
                    assert.equal(omManager.getState(), OMState.PAUSED);
                    omManager.resume();
                    assert.equal(omManager.getState(), OMState.PLAYING);

                    assert.equal((<sinon.SinonStub>openMeasurement.triggerVideoEvent).callCount, 6);
                    (<sinon.SinonStub>openMeasurement.triggerVideoEvent).getCall(4).calledWithExactly('omidResume');
                    (<sinon.SinonStub>openMeasurement.triggerVideoEvent).getCall(5).calledWithExactly('omidResume');
                });
            });
            it('skipped event with varying states', () => {
                omManager.skipped();

                assert.equal(omManager.getState(), OMState.STOPPED);
                sinon.assert.calledTwice(<sinon.SinonStub>openMeasurement.triggerVideoEvent);
            });
            it('volumeChange event with varying states', () => {
                omManager.volumeChange(1);

                assert.equal(omManager.getState(), OMState.STOPPED);
                sinon.assert.calledTwice(<sinon.SinonStub>openMeasurement.triggerVideoEvent);
            });
            it('adUserInteraction', () => {
                omManager.adUserInteraction(InteractionType.CLICK);
                sinon.assert.calledWith(<sinon.SinonStub>openMeasurement.triggerVideoEvent, 'omidAdUserInteraction', 'click');
                sinon.assert.calledTwice(<sinon.SinonStub>openMeasurement.triggerVideoEvent);
            });
            it('should fire multiple bufferStart regardless of state', () => {
                omManager.bufferStart();
                sinon.assert.calledWith(<sinon.SinonStub>openMeasurement.triggerVideoEvent, 'omidBufferStart');
                sinon.assert.calledTwice(<sinon.SinonStub>openMeasurement.triggerVideoEvent);
            });
            it('should fire multiple bufferFinish regardless of state', () => {
                omManager.bufferFinish();
                sinon.assert.calledWith(<sinon.SinonStub>openMeasurement.triggerVideoEvent, 'omidBufferFinish');
                sinon.assert.calledTwice(<sinon.SinonStub>openMeasurement.triggerVideoEvent);
            });
            it('geometryChange event with varying states', () => {
                omManager.start(10);
                assert.equal(omManager.getState(), OMState.PLAYING);

                const viewport = {width: 1, height: 1};
                const rect = {x: 1, y: 1, width: 1, height: 1};
                const rect2 = {x: 1, y: 1, width: 1, height: 1, obstructions: []};
                const adview: IAdView = {percentageInView: 1, geometry: rect, onScreenGeometry: rect2, measuringElement: false, reasons: []};

                omManager.geometryChange(viewport, adview);
                assert.equal(omManager.getState(), OMState.PLAYING);

                assert.equal((<sinon.SinonStub>openMeasurement.triggerAdEvent).callCount, 2);
                (<sinon.SinonStub>openMeasurement.triggerAdEvent).getCall(0).calledWithExactly('omidGeometryChange', {viewport, adview});
                (<sinon.SinonStub>openMeasurement.triggerAdEvent).getCall(1).calledWithExactly('omidGeometryChange', {viewport, adview});
            });
        });
    });
});
