import * as sinon from 'sinon';
import { Platform } from 'Core/Constants/Platform';
import { Placement } from 'Ads/Models/Placement';
import { OpenMeasurementManager } from 'Ads/Views/OpenMeasurement/OpenMeasurementManager';
import { OpenMeasurement } from 'Ads/Views/OpenMeasurement/OpenMeasurement';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { OMIDEventBridge, MediaType, IVastProperties, VideoPosition } from 'Ads/Views/OpenMeasurement/OMIDEventBridge';
import { IImpressionValues } from 'Ads/Views/OpenMeasurement/AdMobOmidEventBridge';
import { Video } from 'Ads/Models/Assets/Video';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe(`${platform} OpenMeasurementManager`, () => {
        const sandbox = sinon.createSandbox();
        let placement: Placement;

        const initOMManager = (om: OpenMeasurement[]) => {
            placement = TestFixtures.getPlacement();
            return new OpenMeasurementManager(om, placement);
        };

        describe('DOM Hierarchy', () => {
            let omManager: OpenMeasurementManager;
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

            it('loaded', () => {
                const vastProps: IVastProperties = {
                    isSkippable: false,
                    skipOffset: 10,
                    isAutoplay: true,                   // Always autoplay for video
                    position: VideoPosition.STANDALONE  // Always standalone video
                };
                omManager.loaded(vastProps);
                sinon.assert.calledWith(<sinon.SinonStub>openMeasurement.triggerVideoEvent, 'omidLoaded', vastProps);
                sinon.assert.calledTwice(<sinon.SinonStub>openMeasurement.triggerVideoEvent);
            });

            it('start', () => {
                //
            });

            it('playerStateChanged', () => {
                //
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

            it('completed', () => {
                //
            });
            it('pause', () => {
                //
            });
            it('resume', () => {
                //
            });
            it('skipped', () => {
                //
            });
            it('volumeChange', () => {
                //
            });
            it('adUserInteraction', () => {
                //
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
            it('geometryChange', () => {
                //
            });
        });
    });
});
