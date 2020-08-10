import { IVideoEventHandlerParams } from 'Ads/EventHandlers/BaseVideoEventHandler';
import { VideoEventHandler } from 'Ads/EventHandlers/VideoEventHandler';
import { IOperativeEventParams } from 'Ads/Managers/OperativeEventManager';
import { TestEnvironment } from 'Core/Utilities/TestEnvironment';
import { XPromoAdUnit } from 'XPromo/AdUnits/XPromoAdUnit';
import { XPromoOperativeEventManager } from 'XPromo/Managers/XPromoOperativeEventManager';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';
import { TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';

export class XPromoVideoEventHandler extends VideoEventHandler {

    private _xpromoAdUnit: XPromoAdUnit;
    private _xpromoOperativeEventManager: XPromoOperativeEventManager;
    private _xpromoCampaign: XPromoCampaign;

    constructor(params: IVideoEventHandlerParams<XPromoAdUnit, XPromoCampaign, XPromoOperativeEventManager>) {
        super(params);
        this._xpromoAdUnit = params.adUnit;
        this._xpromoOperativeEventManager = params.operativeEventManager;
        this._xpromoCampaign = params.campaign;
    }

    public onCompleted(url: string): void {
        super.onCompleted(url);

        const endScreen = this._xpromoAdUnit.getEndScreen();
        if (endScreen) {
            endScreen.show();
        }
    }

    public onPrepared(url: string, duration: number, width: number, height: number): void {
        super.onPrepared(url, duration, width, height);

        const overlay = this._adUnit.getOverlay();
        if (overlay) {
            overlay.setCallButtonVisible(true);

            if (TestEnvironment.get('debugOverlayEnabled')) {
                overlay.setDebugMessage('XPromo');
            }
        }
    }

    protected handleStartEvent(progress: number): void {
        this._xpromoOperativeEventManager.sendStart(this.getXPromoOperativeEventParams()).then(() => {
            this._adUnit.onStartProcessed.trigger();
        });

        this.sendTrackingEvent(TrackingEvent.START);
        this._ads.Listener.sendStartEvent(this._placement.getId());
    }

    protected handleFirstQuartileEvent(progress: number): void {
        // Not sent for Xpromos
    }

    protected handleMidPointEvent(progress: number): void {
        // Not sent for Xpromos
    }

    protected handleThirdQuartileEvent(progress: number): void {
        this.sendTrackingEvent(TrackingEvent.THIRD_QUARTILE);
    }

    protected handleCompleteEvent(): void {
        this._xpromoOperativeEventManager.sendView(this.getXPromoOperativeEventParams());
        this.sendTrackingEvent(TrackingEvent.COMPLETE);
    }

    protected getVideoOrientation(): string | undefined {
        return this._xpromoAdUnit.getVideoOrientation();
    }

    private getXPromoOperativeEventParams(): IOperativeEventParams {
        return {
            placement: this._placement,
            videoOrientation: this.getVideoOrientation()
        };
    }

    private sendTrackingEvent(event: TrackingEvent) {
        this._thirdPartyEventManager.sendTrackingEvents(this._campaign, event, 'xpromo');
    }
}
