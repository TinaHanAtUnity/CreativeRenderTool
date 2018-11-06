import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
import { ICometTrackingUrlEvents } from 'Performance/Parsers/CometCampaignParser';
import { AbstractVideoOverlay } from 'Ads/Views/AbstractVideoOverlay';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { OverlayEventHandler } from 'Ads/EventHandlers/OverlayEventHandler';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { IAppStoreDownloadHelper, IAppStoreDownloadParameters } from 'Ads/Utilities/AppStoreDownloadHelper';
import { OverlayEventHandlerWithDownload } from 'Ads/EventHandlers/OverlayEventHandlerWithDownload';

export class PerformanceOverlayEventHandler extends OverlayEventHandlerWithDownload<PerformanceCampaign> {

    protected _performanceAdUnit: PerformanceAdUnit;
    protected _thirdPartyEventManager: ThirdPartyEventManager;

    constructor(nativeBridge: NativeBridge, adUnit: PerformanceAdUnit, parameters: IPerformanceAdUnitParameters, downloadHelper: IAppStoreDownloadHelper) {
        super(nativeBridge, adUnit, parameters, downloadHelper, parameters.adUnitStyle);
        this._performanceAdUnit = adUnit;
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
    }

    public onOverlaySkip(position: number): void {
        super.onOverlaySkip(position);

        const endScreen = this._performanceAdUnit.getEndScreen();
        if (endScreen) {
            endScreen.show();
        }
        this._performanceAdUnit.onFinish.trigger();

        this._thirdPartyEventManager.sendPerformanceTrackingEvent(this._campaign, ICometTrackingUrlEvents.SKIP);
    }
}
