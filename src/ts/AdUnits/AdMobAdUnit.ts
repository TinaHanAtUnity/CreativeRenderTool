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
import { FocusManager } from 'Managers/FocusManager';

export interface IAdMobAdUnitParameters extends IAdUnitParameters<AdMobCampaign> {
    view: AdMobView;
}

const AdUnitActivities = ['com.unity3d.ads.adunit.AdUnitActivity', 'com.unity3d.ads.adunit.AdUnitTransparentActivity', 'com.unity3d.ads.adunit.AdUnitTransparentSoftwareActivity', 'com.unity3d.ads.adunit.AdUnitSoftwareActivity'];

export class AdMobAdUnit extends AbstractAdUnit {
    private _operativeEventManager: OperativeEventManager;
    private _view: AdMobView;
    private _thirdPartyEventManager: ThirdPartyEventManager;
    private _focusManager: FocusManager;
    private _options: any;
    private _onSystemKillObserver: any;
    private _keyDownListener: (kc: number) => void;
    private _campaign: AdMobCampaign;
    private _placement: Placement;
    private _timeOnScreen: number;
    private _foregroundTime: number;
    private _startTime: number;

    private _onAppForeground: () => void;
    private _onAppBackground: () => void;
    private _onActivityResumed: (activity: string) => void;
    private _onActivityPaused: (activity: string) => void;

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
        this._focusManager = parameters.focusManager;

        // TODO, we skip initial because the AFMA grantReward event tells us the video
        // has been completed. Is there a better way to do this with AFMA right now?
        this.setFinishState(this._placement.allowSkip() ? FinishState.COMPLETED : FinishState.SKIPPED);
    }

    public show(): Promise<void> {
        this.setShowing(true);
        this.onStart.trigger();

        Diagnostics.trigger('admob_ad_show', {
            placement: this._placement.getId()
        }, this._campaign.getSession());

        if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
            this._nativeBridge.AndroidAdUnit.onKeyDown.subscribe(this._keyDownListener);
        }

        this._onSystemKillObserver = this._container.onSystemKill.subscribe(() => this.onSystemKill());
        this.subscribeToLifecycle();

        return this._container.open(this, false, true, this._forceOrientation, true, false, true, false, this._options).then(() => {
            if (this._startTime === 0) {
                this._startTime = Date.now();
            }
            this._foregroundTime = Date.now();
            this.showView();
        });
    }

    public hide(): Promise<void> {
        this.onHide();
        this.hideView();
        this.unsubscribeFromLifecycle();
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
        this._operativeEventManager.sendStart(this._campaign.getSession(), this._placement, this._campaign);
    }

    public sendSkipEvent() {
        this.sendTrackingEvent('skip');
        this._operativeEventManager.sendSkip(this._campaign.getSession(), this._placement, this._campaign);
    }

    public sendCompleteEvent() {
        this.sendTrackingEvent('complete');
    }

    public sendRewardEvent() {
        this._operativeEventManager.sendThirdQuartile(this._campaign.getSession(), this._placement, this._campaign);
        this._operativeEventManager.sendView(this._campaign.getSession(), this._placement, this._campaign);
    }

    public getTimeOnScreen(): number {
        return (Date.now() - this._foregroundTime) + this._timeOnScreen;
    }

    public getStartTime(): number {
        return this._startTime;
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

    private subscribeToLifecycle() {
        this._onAppForeground = this._focusManager.onAppForeground.subscribe(() => this.onAppForeground());
        this._onAppBackground = this._focusManager.onAppBackground.subscribe(() => this.onAppBackground());
        this._onActivityResumed = this._focusManager.onActivityResumed.subscribe((activity) => this.onActivityResumed(activity));
        this._onActivityPaused = this._focusManager.onActivityPaused.subscribe((activity) => this.onActivityPaused(activity));
    }

    private unsubscribeFromLifecycle() {
        this._focusManager.onAppForeground.unsubscribe(this._onAppForeground);
        this._focusManager.onAppBackground.unsubscribe(this._onAppBackground);
        this._focusManager.onActivityResumed.unsubscribe(this._onActivityResumed);
        this._focusManager.onActivityPaused.unsubscribe(this._onActivityPaused);
    }

    private onAppForeground() {
        this._foregroundTime = Date.now();
    }

    private onAppBackground() {
        this._timeOnScreen = (Date.now() - this._foregroundTime) + this._timeOnScreen;
    }

    private onActivityResumed(activity: string) {
        if (AdUnitActivities.indexOf(activity) !== -1) {
            this.onAppForeground();
        }
    }

    private onActivityPaused(activity: string) {
        if (AdUnitActivities.indexOf(activity) !== -1) {
            this.onAppBackground();
        }
    }
}
