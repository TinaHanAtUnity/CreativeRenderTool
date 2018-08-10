import { PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';
import { IVideoEventHandlerParams } from 'EventHandlers/BaseVideoEventHandler';
import { VideoEventHandler } from 'EventHandlers/VideoEventHandler';
import { TestEnvironment } from 'Utilities/TestEnvironment';
import { PerformanceCampaign } from 'Models/Campaigns/PerformanceCampaign';
import { ICometTrackingUrlEvents } from 'Parsers/CometCampaignParser';
import { Url } from 'Utilities/Url';
import { Diagnostics } from 'Utilities/Diagnostics';

export class PerformanceVideoEventHandler extends VideoEventHandler {

    private _performanceAdUnit: PerformanceAdUnit;

    constructor(parameters: IVideoEventHandlerParams<PerformanceAdUnit>) {
        super(parameters);
        this._performanceAdUnit = parameters.adUnit;
        this._campaign = parameters.campaign;
    }

    public onCompleted(url: string): void {
        super.onCompleted(url);

        const endScreen = this._performanceAdUnit.getEndScreen();

        if(endScreen) {
            endScreen.show();
        }
    }

    public onPrepared(url: string, duration: number, width: number, height: number): void {
        super.onPrepared(url, duration, width, height);

        const overlay = this._adUnit.getOverlay();
        if(TestEnvironment.get('debugOverlayEnabled') && overlay) {
            overlay.setDebugMessage('Performance Ad');
        }
        this.sendTrackingEvent(ICometTrackingUrlEvents.LOADED);
    }

    protected handleVideoError(errorType?: string, errorData?: any): void {
        super.handleVideoError(errorType, errorData);

        const endScreen = this._performanceAdUnit.getEndScreen();
        if(endScreen) {
            endScreen.show();
        }
        this.sendTrackingEvent(ICometTrackingUrlEvents.ERROR);
    }

    protected getVideoOrientation(): string | undefined {
        return this._performanceAdUnit.getVideoOrientation();
    }

    protected handleStartEvent(progress: number): void {
        super.handleStartEvent(progress);
        this.sendTrackingEvent(ICometTrackingUrlEvents.START);
    }

    protected handleFirstQuartileEvent(progress: number): void {
        super.handleFirstQuartileEvent(progress);
        this.sendTrackingEvent(ICometTrackingUrlEvents.FIRST_QUARTILE);
    }

    protected handleMidPointEvent(progress: number): void {
        super.handleMidPointEvent(progress);
        this.sendTrackingEvent(ICometTrackingUrlEvents.MIDPOINT);
    }

    protected handleThirdQuartileEvent(progress: number): void {
        super.handleThirdQuartileEvent(progress);
        this.sendTrackingEvent(ICometTrackingUrlEvents.THIRD_QUARTILE);
    }

    protected handleCompleteEvent(url: string): void {
        super.handleCompleteEvent(url);
        this.sendTrackingEvent(ICometTrackingUrlEvents.COMPLETE);
    }

    private sendTrackingEvent(event: ICometTrackingUrlEvents): void {
        if (this._campaign instanceof PerformanceCampaign) {
            const urls = this._campaign.getTrackingUrls()[event];
            if (urls && Object.keys(urls).length !== 0) {
                for (const url of urls) {
                    if (url && Url.isValid(url)) {
                        this._thirdPartyEventManager.sendEvent(event, this._campaign.getSession().getId(), url);
                    } else {
                        const error = {
                            url: url,
                            event: event
                        };
                        Diagnostics.trigger('invalid_tracking_url', error, this._campaign.getSession());
                    }
                }
            }
        }
    }
}
