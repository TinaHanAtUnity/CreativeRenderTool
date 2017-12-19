import { NativeBridge } from 'Native/NativeBridge';
import { AbstractAdUnit, IAdUnitParameters } from 'AdUnits/AbstractAdUnit';
import { AdMobCampaign } from 'Models/Campaigns/AdMobCampaign';
import { AdMobView } from 'Views/AdMobView';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { FinishState } from 'Constants/FinishState';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { Diagnostics } from 'Utilities/Diagnostics';
import { Platform } from 'Constants/Platform';
import { KeyCode } from 'Constants/Android/KeyCode';
import { Placement } from 'Models/Placement';

export interface IAdMobAdUnitParameters extends IAdUnitParameters<AdMobCampaign> {
    view: AdMobView;
}
export class AdMobAdUnit extends AbstractAdUnit {
    private _operativeEventManager: OperativeEventManager;
    private _view: AdMobView;
    private _thirdPartyEventManager: ThirdPartyEventManager;
    private _options: any;
    private _onSystemKillObserver: any;
    private _keyDownListener: (kc: number) => void;
    private _campaign: AdMobCampaign;
    private _placement: Placement;

    constructor(nativeBridge: NativeBridge, parameters: IAdMobAdUnitParameters) {
        super(nativeBridge, parameters);
        this._operativeEventManager = parameters.operativeEventManager;
        this._view = parameters.view;
        this._options = parameters.options;
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
        this._operativeEventManager = parameters.operativeEventManager;
        this._keyDownListener = (kc: number) => this.onKeyDown(kc);
        this._campaign = parameters.campaign;
        this._placement = parameters.placement;

        // TODO, we skip initial because the AFMA grantReward event tells us the video
        // has been completed. Is there a better way to do this with AFMA right now?
        this.setFinishState(this._placement.allowSkip() ? FinishState.COMPLETED : FinishState.SKIPPED);
    }

    public show(): Promise<void> {
        this.setShowing(true);
        this.onStart.trigger();
        this._operativeEventManager.sendStart(this._campaign.getSession(), this._placement, this._campaign);

        Diagnostics.trigger('admob_ad_show', {
            placement: this._placement.getId()
        }, this._campaign.getSession());

        if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
            this._nativeBridge.AndroidAdUnit.onKeyDown.subscribe(this._keyDownListener);
        }

        this._onSystemKillObserver = this._container.onSystemKill.subscribe(() => this.onSystemKill());

        return this._container.open(this, ['webview'], true, this._forceOrientation, true, false, true, false, this._options).then(() => {
            this.showView();
        });
    }

    public hide(): Promise<void> {
        this.onHide();
        this.hideView();
        return this._container.close();
    }

    public isCached(): boolean {
        return false;
    }

    public description(): string {
        return 'AdMob';
    }

    public sendImpressionEvent() {
        this.sendTrackingEvent('impression');
    }

    public sendClickEvent() {
        this.sendTrackingEvent('click');
        this._operativeEventManager.sendClick(this._campaign.getSession(), this._placement, this._campaign);
    }

    public sendStartEvent() {
        this.sendTrackingEvent('start');
    }

    public sendSkipEvent() {
        this.sendTrackingEvent('skip');
        this._operativeEventManager.sendSkip(this._campaign.getSession(), this._placement, this._campaign);
    }

    public sendCompleteEvent() {
        this.sendTrackingEvent('complete');
    }

    private showView() {
        this._view.show();
        document.body.appendChild(this._view.container());
    }

    private sendTrackingEvent(event: string) {
        const urls = this._campaign.getTrackingUrlsForEvent(event);
        for (const url of urls) {
            this.sendThirdPartyEvent(`admob ${event}`, url);
        }
    }

    private sendThirdPartyEvent(eventType: string, url: string) {
        const sessionId = this._campaign.getSession().getId();
        const sdkVersion = this._operativeEventManager.getClientInfo().getSdkVersion();
        url = url.replace(/%ZONE%/, this._placement.getId());
        url = url.replace(/%SDK_VERSION%/, sdkVersion.toString());
        this._thirdPartyEventManager.sendEvent(eventType, sessionId, url);
    }

    private onHide() {
        this.setShowing(false);
        this._nativeBridge.Listener.sendFinishEvent(this._placement.getId(), this.getFinishState());
        this.onClose.trigger();
        this._operativeEventManager.sendThirdQuartile(this._campaign.getSession(), this._placement, this._campaign);
        this._operativeEventManager.sendView(this._campaign.getSession(), this._placement, this._campaign);

        if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
            this._nativeBridge.AndroidAdUnit.onKeyDown.unsubscribe(this._keyDownListener);
        }

        Diagnostics.trigger('admob_ad_close', {
            placement: this._placement.getId(),
            finishState: this.getFinishState()
        }, this._campaign.getSession());

        if (this.getFinishState() === FinishState.SKIPPED) {
            this.sendSkipEvent();
        } else if (this.getFinishState() === FinishState.COMPLETED) {
            this.sendCompleteEvent();
        }
    }

    private hideView() {
        this._view.hide();
        document.body.removeChild(this._view.container());
    }

    private onSystemKill() {
        if(this.isShowing()) {
            this.setFinishState(FinishState.SKIPPED);
            this.hide();
        }
    }

    private onKeyDown(key: number) {
        if (key === KeyCode.BACK) {
            this._view.onBackPressed();
        }
    }
}
