import { EndScreenEventHandler, IEndScreenDownloadParameters } from 'EventHandlers/EndScreenEventHandler';
import { PerformanceCampaign } from 'Models/Campaigns/PerformanceCampaign';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';
import { NativeBridge } from 'Native/NativeBridge';
import { KeyCode } from 'Constants/Android/KeyCode';
import { OperativeEventManager } from 'Managers/OperativeEventManager';

export class PerformanceEndScreenEventHandler extends EndScreenEventHandler<PerformanceCampaign, PerformanceAdUnit> {
    private _performanceOperativeEventManager: OperativeEventManager;
    private _performanceAdUnit: PerformanceAdUnit;
    private _performanceCampaign: PerformanceCampaign;

    constructor(nativeBridge: NativeBridge, adUnit: PerformanceAdUnit, parameters: IPerformanceAdUnitParameters) {
        super(nativeBridge, adUnit, parameters);

        this._performanceAdUnit = adUnit;
        this._performanceOperativeEventManager = parameters.operativeEventManager;
        this._performanceCampaign = parameters.campaign;
    }

    public onKeyEvent(keyCode: number): void {
        if (keyCode === KeyCode.BACK && this._adUnit.isShowing() && !this._adUnit.isActive()) {
            this._adUnit.hide();
        }
    }

    public onEndScreenDownload(parameters: IEndScreenDownloadParameters): void {
        this._performanceOperativeEventManager.sendClick(this._performanceCampaign.getSession(), this._performanceCampaign, this.getAdditionalEventData());

        super.onEndScreenDownload(parameters);
    }

    private getAdditionalEventData(): { [id: string]: any } {
        const data: { [id: string]: any } = {};
        data.videoOrientation = this._performanceAdUnit.getVideoOrientation();

        return data;
    }
}
