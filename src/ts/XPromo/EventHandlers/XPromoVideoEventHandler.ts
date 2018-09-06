import { IVideoEventHandlerParams } from 'Ads/EventHandlers/BaseVideoEventHandler';
import { VideoEventHandler } from 'Ads/EventHandlers/VideoEventHandler';
import { IOperativeEventParams } from 'Ads/Managers/OperativeEventManager';
import { TestEnvironment } from 'Core/Utilities/TestEnvironment';
import { XPromoAdUnit } from 'XPromo/AdUnits/XPromoAdUnit';
import { XPromoOperativeEventManager } from 'XPromo/Managers/XPromoOperativeEventManager';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';

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
        if(TestEnvironment.get('debugOverlayEnabled') && overlay) {
            overlay.setDebugMessage('XPromo');
        }
    }

    protected handleStartEvent(progress: number): void {
        this._xpromoOperativeEventManager.sendStart(this.getXPromoOperativeEventParams()).then(() => {
            this._adUnit.onStartProcessed.trigger();
        });

        const trackingUrls = this._xpromoCampaign.getTrackingUrlsForEvent('start');
        for (const url of trackingUrls) {
            this._thirdPartyEventManager.sendEvent('xpromo start', this._xpromoCampaign.getSession().getId(), url);
        }

        this._nativeBridge.Listener.sendStartEvent(this._placement.getId());
    }

    protected handleFirstQuartileEvent(progress: number): void {
        // Not sent for Xpromos
    }

    protected handleMidPointEvent(progress: number): void {
        // Not sent for Xpromos
    }

    protected handleCompleteEvent(): void {
        this._xpromoOperativeEventManager.sendView(this.getXPromoOperativeEventParams());
        const clickTrackingUrls = this._xpromoCampaign.getTrackingUrlsForEvent('view');
        for (const clickUrl of clickTrackingUrls) {
            this._thirdPartyEventManager.sendEvent('xpromo view', this._xpromoCampaign.getSession().getId(), clickUrl);
        }
    }

    protected handleVideoError(errorType?: string, errorData?: any): void {
        super.handleVideoError(errorType, errorData);

        const endScreen = this._xpromoAdUnit.getEndScreen();
        if (endScreen) {
            endScreen.show();
        }
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
}
