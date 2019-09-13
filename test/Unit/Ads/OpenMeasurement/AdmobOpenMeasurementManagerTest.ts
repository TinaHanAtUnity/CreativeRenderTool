import * as sinon from 'sinon';
import { Platform } from 'Core/Constants/Platform';
import { Placement } from 'Ads/Models/Placement';
import { OpenMeasurementManager } from 'Ads/Views/OpenMeasurement/OpenMeasurementManager';
import { OpenMeasurement } from 'Ads/Views/OpenMeasurement/OpenMeasurement';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { AdmobOpenMeasurementManager } from 'Ads/Views/OpenMeasurement/AdmobOpenMeasurementManager';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe(`${platform} AdmobOpenMeasurementManager`, () => {
        const sandbox = sinon.createSandbox();
        let placement: Placement;

        const init = () => {
            placement = TestFixtures.getPlacement();
            const openMeasurement: OpenMeasurement = sandbox.createStubInstance(OpenMeasurement);

            // return new AdmobOpenMeasurementManager(placement);
        };
    });
});
