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
import { IOpenableIntentsResponse } from 'Views/AFMABridge';
import { FocusManager } from 'Managers/FocusManager';
import { Double } from 'Utilities/Double';
import { SensorDelay } from 'Constants/Android/SensorDelay';
import { IClickSignalResponse } from 'Views/AFMABridge';
import { SdkStats } from 'Utilities/SdkStats';

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
    private _keyDownListener: (kc: number) => void;
    private _campaign: AdMobCampaign;
    private _placement: Placement;
    private _foregroundTime: number = 0;
    private _startTime: number = 0;
    private _requestToViewTime: number = 0;

    private _onSystemKillObserver: () => void;
    private _onPauseObserver: () => void;
    private _onResumeObserver: () => void;

    constructor(nativeBridge: NativeBridge, parameters: IAdMobAdUnitParameters) {
        super(nativeBridge, parameters);
        this._operativeEventManager = parameters.operativeEventManager;
        this._view = parameters.view;
        this._options = parameters.options;
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
        this._operativeEventManager = parameters.operativeEventManager;
        this._focusManager = parameters.focusManager;
        this._keyDownListener = (kc: number) => this.onKeyDown(kc);
        this._campaign = parameters.campaign;
        this._placement = parameters.placement;

        // TODO, we skip initial because the AFMA grantReward event tells us the video
        // has been completed. Is there a better way to do this with AFMA right now?
        this.setFinishState(this._placement.allowSkip() ? FinishState.COMPLETED : FinishState.SKIPPED);
    }

    public show(): Promise<void> {
        this._requestToViewTime = Date.now() - SdkStats.getAdRequestTimestamp();
        this.setShowing(true);
        this.onStart.trigger();

        this.sendTrackingEvent('show');
        Diagnostics.trigger('admob_ad_show', {
            placement: this._placement.getId()
        }, this._campaign.getSession());

        if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
            this._nativeBridge.AndroidAdUnit.onKeyDown.subscribe(this._keyDownListener);
        }
        this.subscribeToLifecycle();

        return this._container.open(this, ['webview'], true, this._forceOrientation, true, false, true, false, this._options).then(() => {
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

    public description(): string {
        return 'AdMob';
    }

    public sendImpressionEvent() {
        this.sendTrackingEvent('impression');
        Diagnostics.trigger('admob_ad_impression', {
            placement: this._placement.getId()
        }, this._campaign.getSession());
    }

    public sendClickEvent() {
        this.sendTrackingEvent('click');
        this._operativeEventManager.sendClick(this._placement);
    }

    public sendStartEvent() {
        this._nativeBridge.Listener.sendStartEvent(this._placement.getId());
        this.sendTrackingEvent('start');
        this._operativeEventManager.sendStart(this._placement);
    }

    public sendSkipEvent() {
        this.sendTrackingEvent('skip');
        this._operativeEventManager.sendSkip(this._placement);
    }

    public sendCompleteEvent() {
        this.sendTrackingEvent('complete');
    }

    public sendRewardEvent() {
        this._operativeEventManager.sendThirdQuartile(this._placement);
        this._operativeEventManager.sendView(this._placement);
    }

    public sendOpenableIntentsResponse(response: IOpenableIntentsResponse) {
        this._view.sendOpenableIntentsResponse(response);
    }

    public getTimeOnScreen(): number {
        return Date.now() - this._foregroundTime;
    }

    public getStartTime(): number {
        return this._startTime;
    }

    public sendTrackingEvent(event: string) {
        const urls = this._campaign.getTrackingUrlsForEvent(event);
        for (const url of urls) {
            this.sendThirdPartyEvent(`admob ${event}`, url);
        }
    }

    public sendClickSignalResponse(response: IClickSignalResponse) {
        this._view.sendClickSignalResponse(response);
    }

    public getRequestToViewTime(): number {
        return this._requestToViewTime;
    }

    private showView() {
        this._view.show();
        document.body.appendChild(this._view.container());
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

        this._nativeBridge.SensorInfo.stopAccelerometerUpdates();

        if(this._nativeBridge.getPlatform() === Platform.ANDROID) {
            this._nativeBridge.AndroidAdUnit.endMotionEventCapture();
            this._nativeBridge.AndroidAdUnit.clearMotionEventCapture();
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
        this._onSystemKillObserver = this._container.onSystemKill.subscribe(() => this.onSystemKill());
        if (this._nativeBridge.getPlatform() === Platform.IOS) {
            this._onResumeObserver = this._focusManager.onAppForeground.subscribe(() => this.onAppForeground());
            this._onPauseObserver = this._focusManager.onAppBackground.subscribe(() => this.onAppBackground());
        } else {
            this._onResumeObserver = this._container.onShow.subscribe(() => this.onAppForeground());
            this._onPauseObserver = this._container.onAndroidPause.subscribe(() => this.onAppBackground());
        }
    }

    private unsubscribeFromLifecycle() {
        this._container.onSystemKill.unsubscribe(this._onSystemKillObserver);
        if (this._nativeBridge.getPlatform() === Platform.IOS) {
            this._focusManager.onAppBackground.unsubscribe(this._onPauseObserver);
        } else {
            this._container.onShow.unsubscribe(this._onResumeObserver);
        }
    }

    private onAppForeground() {
        this._foregroundTime = Date.now();

        if(this._nativeBridge.getPlatform() === Platform.ANDROID) {
            this._nativeBridge.SensorInfo.Android.startAccelerometerUpdates(SensorDelay.SENSOR_DELAY_FASTEST);
            this._nativeBridge.AndroidAdUnit.startMotionEventCapture(10000);
        } else {
            this._nativeBridge.SensorInfo.Ios.startAccelerometerUpdates(new Double(0.01));
        }
    }

    private onAppBackground() {
        this._nativeBridge.SensorInfo.stopAccelerometerUpdates();
    }
}
