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

        const init = () => {
            placement = TestFixtures.getPlacement();
            const openMeasurement: OpenMeasurement = sandbox.createStubInstance(OpenMeasurement);

            return new OpenMeasurementManager([openMeasurement], placement);
        };
    });
});
