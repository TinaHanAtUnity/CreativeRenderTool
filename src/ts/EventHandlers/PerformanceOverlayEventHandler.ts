import { NativeBridge } from 'Native/NativeBridge';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';
import { OverlayEventHandler } from 'EventHandlers/OverlayEventHandler';
import { PerformanceCampaign } from 'Models/Campaigns/PerformanceCampaign';
import { ICometTrackingUrlEvents } from 'Parsers/CometCampaignParser';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { Url } from 'Utilities/Url';
import { Diagnostics } from 'Utilities/Diagnostics';

export class PerformanceOverlayEventHandler extends OverlayEventHandler<PerformanceCampaign> {

    private _performanceAdUnit: PerformanceAdUnit;
    private _trackingUrls: {[key: string]: string[]};
    private _thirdPartyEventManager: ThirdPartyEventManager;

    constructor(nativeBridge: NativeBridge, adUnit: PerformanceAdUnit, parameters: IPerformanceAdUnitParameters) {
        super(nativeBridge, adUnit, parameters, parameters.adUnitStyle);
        this._performanceAdUnit = adUnit;
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
        this._trackingUrls = parameters.campaign.getTrackingUrls();
    }

    public onOverlaySkip(position: number): void {
        super.onOverlaySkip(position);

        const endScreen = this._performanceAdUnit.getEndScreen();
        if (endScreen) {
            endScreen.show();
        }
        this._performanceAdUnit.onFinish.trigger();

        const urls = this._trackingUrls[ICometTrackingUrlEvents.SKIP];
        if (Object.keys(urls).length !== 0) {
            for (const url of urls) {
                if (url && Url.isValid(url)) {
                    this._thirdPartyEventManager.sendEvent(ICometTrackingUrlEvents.SKIP, this._campaign.getSession().getId(), url);
                } else {
                    const error = {
                        url: url,
                        event: ICometTrackingUrlEvents.SKIP
                    };
                    Diagnostics.trigger('invalid_tracking_url', error, this._campaign.getSession());
                }
            }
        }
    }
}
