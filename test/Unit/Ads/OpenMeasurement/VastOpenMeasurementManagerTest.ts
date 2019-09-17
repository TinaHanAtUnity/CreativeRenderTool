import * as sinon from 'sinon';
import { Platform } from 'Core/Constants/Platform';
import { Placement } from 'Ads/Models/Placement';
import { VastOpenMeasurementManager } from 'Ads/Views/OpenMeasurement/VastOpenMeasurementManager';
import { OpenMeasurement } from 'Ads/Views/OpenMeasurement/OpenMeasurement';
import { TestFixtures } from 'TestHelpers/TestFixtures';

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
    });
});
