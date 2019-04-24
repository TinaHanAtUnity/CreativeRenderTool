import { IVideoEventHandlerParams } from 'Ads/EventHandlers/BaseVideoEventHandler';
import { VideoEventHandler } from 'Ads/EventHandlers/VideoEventHandler';
import { TestEnvironment } from 'Core/Utilities/TestEnvironment';
import { PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
import { TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';

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
        if (overlay) {
            overlay.setCallButtonVisible(true);

            if (TestEnvironment.get('debugOverlayEnabled')) {
                overlay.setDebugMessage('Performance Ad');
            }
        }
        this._performanceAdUnit.sendTrackingEvent(TrackingEvent.LOADED);
    }

    protected getVideoOrientation(): string | undefined {
        return this._performanceAdUnit.getVideoOrientation();
    }

    protected handleStartEvent(progress: number): void {
        super.handleStartEvent(progress);
        this._performanceAdUnit.sendTrackingEvent(TrackingEvent.START);
    }

    protected handleFirstQuartileEvent(progress: number): void {
        super.handleFirstQuartileEvent(progress);
        this._performanceAdUnit.sendTrackingEvent(TrackingEvent.FIRST_QUARTILE);
    }

    protected handleMidPointEvent(progress: number): void {
        super.handleMidPointEvent(progress);
        this._performanceAdUnit.sendTrackingEvent(TrackingEvent.MIDPOINT);
    }

    protected handleThirdQuartileEvent(progress: number): void {
        super.handleThirdQuartileEvent(progress);
        this._performanceAdUnit.sendTrackingEvent(TrackingEvent.THIRD_QUARTILE);
    }

    protected handleCompleteEvent(url: string): void {
        super.handleCompleteEvent(url);
        this._performanceAdUnit.sendTrackingEvent(TrackingEvent.COMPLETE);
    }
}
