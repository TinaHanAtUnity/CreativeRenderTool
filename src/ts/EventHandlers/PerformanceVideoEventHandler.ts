import { PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';
import { IVideoEventHandlerParams } from 'EventHandlers/BaseVideoEventHandler';
import { VideoEventHandler } from 'EventHandlers/VideoEventHandler';
import { TestEnvironment } from 'Utilities/TestEnvironment';
import { PerformanceCampaign } from 'Models/Campaigns/PerformanceCampaign';
import { ICometTrackingUrlEvents } from 'Parsers/CometCampaignParser';
import { Url } from 'Utilities/Url';

export class PerformanceVideoEventHandler extends VideoEventHandler {

    private _performanceAdUnit: PerformanceAdUnit;
    private _sessionId: string;

    constructor(parameters: IVideoEventHandlerParams<PerformanceAdUnit>) {
        super(parameters);
        this._performanceAdUnit = parameters.adUnit;
        this._campaign = parameters.campaign;
        this._sessionId = parameters.campaign.getSession().getId();
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

    private sendTrackingEvent(event: string): void {
        if (this._campaign instanceof PerformanceCampaign) {
            const urls = this._campaign.getTrackingUrls()[event];
            urls.forEach(url => {
                if (url && Url.isValid(url)) {
                    this._thirdPartyEventManager.sendEvent(event, this._sessionId, url);
                }
            });
        }
    }
}
