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
                omManager = initOMManager([openMeasurement]);
            });
            afterEach(() => {
                sandbox.restore();
            });
            describe('addToViewHierarchy', () => {
                it('should add every om to the hierarchy', () => {
                    sinon.assert.calledOnce(<sinon.SinonStub>openMeasurement.addToViewHierarchy);
                });
            });
            describe('removeFromViewHieararchy', () => {
                it('should add every om to the hierarchy', () => {
                    sinon.assert.calledOnce(<sinon.SinonStub>openMeasurement.removeFromViewHieararchy);
                });
            });
            describe('injectVerifications', () => {
                it('should add every om to the hierarchy', () => {
                    sinon.assert.calledOnce(<sinon.SinonStub>openMeasurement.injectAdVerifications);
                });
            });
        });
        describe('adEvents', () => {
            let omManager: OpenMeasurementManager;
            beforeEach(() => {
                //
            });
            afterEach(() => {
                sandbox.restore();
            });
            describe('impression', () => {
                //
            });
            describe('loaded', () => {
                //
            });
            describe('start', () => {
                //
            });
            describe('playerStateChanged', () => {
                //
            });
            describe('sendFirstQuartile', () => {
                //
            });
            describe('sendMidpoint', () => {
                //
            });
            describe('sendThirdQuartile', () => {
                //
            });
            describe('completed', () => {
                //
            });
            describe('pause', () => {
                //
            });
            describe('resume', () => {
                //
            });
            describe('skipped', () => {
                //
            });
            describe('volumeChange', () => {
                //
            });
            describe('adUserInteraction', () => {
                //
            });
            describe('bufferStart', () => {
                //
            });
            describe('bufferFinish', () => {
                //
            });
            describe('geometryChange', () => {
                //
            });
        });
        describe('session events', () => {
            let omManager: OpenMeasurementManager;
            beforeEach(() => {
                //
            });
            afterEach(() => {
                sandbox.restore();
            });
            describe('sessionStart', () => {
                //
            });
            describe('sessionFinish', () => {
                //
            });
        });
    });
});
