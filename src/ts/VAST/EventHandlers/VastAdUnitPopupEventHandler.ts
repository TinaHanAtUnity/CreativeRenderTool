import { IVastAdUnitParameters, VastAdUnit } from 'VAST/AdUnits/VastAdUnit';
import { OpenMeasurementUtilities } from 'Ads/Views/OpenMeasurement/OpenMeasurementUtilities';
import { ObstructionReasons } from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';
import { VideoAdUnitPopupEventHandler } from 'Ads/EventHandlers/VideoAdUnitPopupEventHandler';
import { VastOpenMeasurementController } from 'Ads/Views/OpenMeasurement/VastOpenMeasurementController';
import { VastCampaign } from 'VAST/Models/VastCampaign';

export class VastAdUnitPopupEventHandler extends VideoAdUnitPopupEventHandler<VastCampaign> {

    private _vastAdUnit: VastAdUnit;
    private _vastOMController?: VastOpenMeasurementController;

    constructor(vastAdUnit: VastAdUnit, parameters: IVastAdUnitParameters) {
        super(vastAdUnit, parameters);

        this._vastAdUnit = vastAdUnit;
        this._vastOMController = parameters.om;
    }

    public onPopupClosed(): void {
        super.onPopupClosed();

        if (this._vastOMController) {
            const adViewBuilder = this._vastOMController.getOMAdViewBuilder();
            const viewPort = adViewBuilder.getViewPort();
            const adView = adViewBuilder.buildVastAdView([]);
            this._vastOMController.geometryChange(viewPort, adView);
        }
    }

    public onPopupVisible(): void {
        super.onPopupVisible();

        if (this._vastOMController) {
            const popup = <HTMLElement>document.querySelector('.view-container');
            const rect = popup.getBoundingClientRect();
            const x = rect.left;
            const y = rect.top;
            const width = rect.width;
            const height = rect.height;

            const obstructionRectangle = OpenMeasurementUtilities.createRectangle(x, y, width, height);
            const adViewBuilder = this._vastOMController.getOMAdViewBuilder();
            const viewPort = adViewBuilder.getViewPort();
            const adView = adViewBuilder.buildVastAdView([ObstructionReasons.OBSTRUCTED], obstructionRectangle);
            this._vastOMController.geometryChange(viewPort, adView);
        }
    }
}
