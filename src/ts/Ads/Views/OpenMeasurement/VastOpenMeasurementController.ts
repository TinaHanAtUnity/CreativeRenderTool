import { OpenMeasurement } from 'Ads/Views/OpenMeasurement/OpenMeasurement';
import { Placement } from 'Ads/Models/Placement';
import { OpenMeasurementController } from 'Ads/Views/OpenMeasurement/OpenMeasurementController';
import { OpenMeasurementAdViewBuilder } from 'Ads/Views/OpenMeasurement/OpenMeasurementAdViewBuilder';

export class VastOpenMeasurementController extends OpenMeasurementController {

    constructor(placement: Placement, omInstances: OpenMeasurement[], omAdViewBuilder: OpenMeasurementAdViewBuilder) {
        super(placement, omAdViewBuilder, omInstances);
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
