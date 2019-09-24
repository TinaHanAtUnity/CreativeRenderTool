import { OpenMeasurement } from 'Ads/Views/OpenMeasurement/OpenMeasurement';
import { Placement } from 'Ads/Models/Placement';
import { OpenMeasurementController } from 'Ads/Views/OpenMeasurement/OpenMeasurementController';

export class VastOpenMeasurementController extends OpenMeasurementController {

    constructor(placement: Placement, omInstances: OpenMeasurement[]) {
        super(placement, omInstances);
    }

    public addToViewHierarchy(): void {
        this._omInstances.forEach((om) => {
            om.addToViewHierarchy();
        });
    }

    public removeFromViewHieararchy(): void {
        this._omInstances.forEach((om) => {
            om.removeFromViewHieararchy();
        });
    }

    public injectVerifications(): void {
        this._omInstances.forEach((om) => {
            om.injectAdVerifications();
        });
    }
}
