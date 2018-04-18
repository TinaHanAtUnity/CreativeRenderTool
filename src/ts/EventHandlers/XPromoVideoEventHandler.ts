import { XPromoAdUnit } from 'AdUnits/XPromoAdUnit';
import { VideoEventHandler } from 'EventHandlers/VideoEventHandler';
import { IVideoEventHandlerParams } from 'EventHandlers/BaseVideoEventHandler';
import { XPromoCampaign } from 'Models/Campaigns/XPromoCampaign';
import { XPromoOperativeEventManager } from 'Managers/XPromoOperativeEventManager';
import { TestEnvironment } from 'Utilities/TestEnvironment';

export class XPromoVideoEventHandler extends VideoEventHandler {

    private _xpromoAdUnit: XPromoAdUnit;
    private _xpromoOperativeEventManager: XPromoOperativeEventManager;

    constructor(params: IVideoEventHandlerParams<XPromoAdUnit, XPromoCampaign, XPromoOperativeEventManager>) {
        super(params);
        this._xpromoAdUnit = params.adUnit;
        this._xpromoOperativeEventManager = params.operativeEventManager;
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
        this._xpromoOperativeEventManager.sendHttpKafkaEvent('ads.xpromo.operative.videostart.v1.json', 'start', this._placement, this.getVideoOrientation());
        if(this._campaign instanceof XPromoCampaign) {
            const clickTrackingUrls = this._campaign.getTrackingUrlsForEvent('start');
            for (const url of clickTrackingUrls) {
                this._thirdPartyEventManager.sendEvent('xpromo start', this._campaign.getSession().getId(), url);
            }
        }
        this._nativeBridge.Listener.sendStartEvent(this._placement.getId());
    }

    protected handleCompleteEvent(): void {
        this._xpromoOperativeEventManager.sendHttpKafkaEvent('ads.xpromo.operative.videoview.v1.json', 'view', this._placement, this.getVideoOrientation());
        if(this._campaign instanceof XPromoCampaign) {
            const clickTrackingUrls = this._campaign.getTrackingUrlsForEvent('view');
            for (const clickUrl of clickTrackingUrls) {
                this._thirdPartyEventManager.sendEvent('xpromo view', this._campaign.getSession().getId(), clickUrl);
            }
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
}
