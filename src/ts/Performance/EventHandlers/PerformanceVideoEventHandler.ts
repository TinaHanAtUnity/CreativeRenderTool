import { IVideoEventHandlerParams } from 'Ads/EventHandlers/BaseVideoEventHandler';
import { VideoEventHandler } from 'Ads/EventHandlers/VideoEventHandler';
import { TestEnvironment } from 'Core/Utilities/TestEnvironment';
import { PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
import { ICometTrackingUrlEvents } from 'Performance/Parsers/CometCampaignParser';
import { PerformanceVideoOverlayCTAButtonTest, ABGroup } from 'Core/Models/ABGroup';

export class PerformanceVideoEventHandler extends VideoEventHandler {

    private _performanceAdUnit: PerformanceAdUnit;
    private _abGroup: ABGroup;

    constructor(parameters: IVideoEventHandlerParams<PerformanceAdUnit>) {
        super(parameters);
        this._abGroup = parameters.configuration.getAbGroup();
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

        if (overlay && PerformanceVideoOverlayCTAButtonTest.isValid(this._abGroup)) {
            overlay.setCallButtonVisible(true);
        }

        if(TestEnvironment.get('debugOverlayEnabled') && overlay) {
            overlay.setDebugMessage('Performance Ad');
        }
        this._thirdPartyEventManager.sendPerformanceTrackingEvent(this._campaign, ICometTrackingUrlEvents.LOADED_IMPRESSION);
    }

    protected getVideoOrientation(): string | undefined {
        return this._performanceAdUnit.getVideoOrientation();
    }

    protected handleStartEvent(progress: number): void {
        super.handleStartEvent(progress);
        this._thirdPartyEventManager.sendPerformanceTrackingEvent(this._campaign, ICometTrackingUrlEvents.START);
    }

    protected handleFirstQuartileEvent(progress: number): void {
        super.handleFirstQuartileEvent(progress);
        this._thirdPartyEventManager.sendPerformanceTrackingEvent(this._campaign, ICometTrackingUrlEvents.FIRST_QUARTILE);
    }

    protected handleMidPointEvent(progress: number): void {
        super.handleMidPointEvent(progress);
        this._thirdPartyEventManager.sendPerformanceTrackingEvent(this._campaign, ICometTrackingUrlEvents.MIDPOINT);
    }

    protected handleThirdQuartileEvent(progress: number): void {
        super.handleThirdQuartileEvent(progress);
        this._thirdPartyEventManager.sendPerformanceTrackingEvent(this._campaign, ICometTrackingUrlEvents.THIRD_QUARTILE);
    }

    protected handleCompleteEvent(url: string): void {
        super.handleCompleteEvent(url);
        this._thirdPartyEventManager.sendPerformanceTrackingEvent(this._campaign, ICometTrackingUrlEvents.COMPLETE);
    }
}
