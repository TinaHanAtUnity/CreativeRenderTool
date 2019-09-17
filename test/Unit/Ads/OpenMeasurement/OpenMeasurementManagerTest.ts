import * as sinon from 'sinon';
import { Platform } from 'Core/Constants/Platform';
import { Placement } from 'Ads/Models/Placement';
import { VastOpenMeasurementManager } from 'Ads/Views/OpenMeasurement/OpenMeasurementManager';
import { OpenMeasurement } from 'Ads/Views/OpenMeasurement/OpenMeasurement';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { OMIDEventBridge, MediaType, IVastProperties, VideoPosition } from 'Ads/Views/OpenMeasurement/OMIDEventBridge';
import { IImpressionValues, VideoPlayerState, InteractionType } from 'Ads/Views/OpenMeasurement/AdMobOmidEventBridge';
import { Video } from 'Ads/Models/Assets/Video';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe(`${platform} OMManager`, () => {
        const sandbox = sinon.createSandbox();
        let placement: Placement;

        const initOMManager = (om: OpenMeasurement[]) => {
            placement = TestFixtures.getPlacement();
            return new VastOpenMeasurementManager(placement, om);
        };

        describe('DOM Hierarchy', () => {
            let omManager: VastOpenMeasurementManager;
            let openMeasurement: OpenMeasurement;

            beforeEach(() => {
                openMeasurement = sandbox.createStubInstance(OpenMeasurement);
                omManager = initOMManager([openMeasurement, openMeasurement]);
            });

            afterEach(() => {
                sandbox.restore();
            });

            describe('addToViewHierarchy', () => {
                it('should add every om to the hierarchy', () => {
                    omManager.addToViewHierarchy();
                    sinon.assert.calledTwice(<sinon.SinonStub>openMeasurement.addToViewHierarchy);
                });
            });
            describe('removeFromViewHieararchy', () => {
                it('should add every om to the hierarchy', () => {
                    omManager.removeFromViewHieararchy();
                    sinon.assert.calledTwice(<sinon.SinonStub>openMeasurement.removeFromViewHieararchy);
                });
            });
            describe('injectVerifications', () => {
                it('should add every om to the hierarchy', () => {
                    omManager.injectVerifications();
                    sinon.assert.calledTwice(<sinon.SinonStub>openMeasurement.injectAdVerifications);
                });
            });
        });

        describe('session events', () => {
            let omManager: VastOpenMeasurementManager;
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
            let omManager: VastOpenMeasurementManager;
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

            it('loaded', () => {
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

            describe('start event with varying states', () => {
                // TODO: DO
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
            describe('completed event with varying states', () => {
                // TODO: DO
            });
            describe('pause event with varying states', () => {
                // TODO: DO
            });
            describe('resume event with varying states', () => {
                // TODO: DO
            });
            describe('skipped event with varying states', () => {
                // TODO: DO
            });
            describe('volumeChange event with varying states', () => {
                // TODO: DO
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
            describe('geometryChange event with varying states', () => {
                // TODO: DO
            });
        });
    });
});
