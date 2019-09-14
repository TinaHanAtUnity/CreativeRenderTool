import * as sinon from 'sinon';
import { Platform } from 'Core/Constants/Platform';
import { Placement } from 'Ads/Models/Placement';
import { OpenMeasurementManager } from 'Ads/Views/OpenMeasurement/OpenMeasurementManager';
import { OpenMeasurement } from 'Ads/Views/OpenMeasurement/OpenMeasurement';
import { TestFixtures } from 'TestHelpers/TestFixtures';

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

        // describe('adEvents', () => {
        //     let omManager: OpenMeasurementManager;
        //     let openMeasurement: OpenMeasurement;
        //     let omidEventBridge: OMIDEventBridge;

        //     beforeEach(() => {
        //         openMeasurement = sandbox.createStubInstance(OpenMeasurement);
        //         omManager = initOMManager([openMeasurement, openMeasurement]);
        //     });
        //     afterEach(() => {
        //         sandbox.restore();
        //     });

        //     it('impression', () => {
        //         // omManager.impression();
        //     });
        //     it('loaded', () => {
        //         //
        //     });
        //     it('start', () => {
        //         //
        //     });
        //     it('playerStateChanged', () => {
        //         //
        //     });
        //     it('sendFirstQuartile', () => {
        //         omidEventBridge = sandbox.createStubInstance(OMIDEventBridge);
        //         sandbox.stub(openMeasurement, 'getOmidBridge').returns(omidEventBridge);
        //         sandbox.stub(openMeasurement.getOmidBridge(), 'triggerVideoEvent');
        //         omManager.sendFirstQuartile();
        //         sinon.assert.calledTwice(<sinon.SinonStub>openMeasurement.getOmidBridge().triggerVideoEvent);
        //     });
        //     it('sendMidpoint', () => {
        //         //
        //     });
        //     it('sendThirdQuartile', () => {
        //         //
        //     });
        //     it('completed', () => {
        //         //
        //     });
        //     it('pause', () => {
        //         //
        //     });
        //     it('resume', () => {
        //         //
        //     });
        //     it('skipped', () => {
        //         //
        //     });
        //     it('volumeChange', () => {
        //         //
        //     });
        //     it('adUserInteraction', () => {
        //         //
        //     });
        //     it('bufferStart', () => {
        //         //
        //     });
        //     it('bufferFinish', () => {
        //         //
        //     });
        //     it('geometryChange', () => {
        //         //
        //     });
        // });
    });
});
