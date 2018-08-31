import { AdMobCampaign } from 'AdMob/Models/AdMobCampaign';
import { AdMobView } from 'AdMob/Views/AdMobView';
import { AbstractAdUnit, IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { AdUnitContainerSystemMessage, IAdUnitContainerListener } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { IOperativeEventParams, OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Placement } from 'Ads/Models/Placement';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { SdkStats } from 'Ads/Utilities/SdkStats';
import { UserCountData } from 'Ads/Utilities/UserCountData';
import { IClickSignalResponse, IOpenableIntentsResponse } from 'Ads/Views/AFMABridge';
import { KeyCode } from 'Common/Constants/Android/KeyCode';
import { SensorDelay } from 'Common/Constants/Android/SensorDelay';
import { FinishState } from 'Common/Constants/FinishState';
import { Platform } from 'Common/Constants/Platform';
import { NativeBridge } from 'Common/Native/NativeBridge';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { Double } from 'Core/Utilities/Double';

export interface IAdMobAdUnitParameters extends IAdUnitParameters<AdMobCampaign> {
    view: AdMobView;
}

export class AdMobAdUnit extends AbstractAdUnit implements IAdUnitContainerListener {
    private _operativeEventManager: OperativeEventManager;
    private _view: AdMobView;
    private _thirdPartyEventManager: ThirdPartyEventManager;
    private _options: any;
    private _keyDownListener: (kc: number) => void;
    private _campaign: AdMobCampaign;
    private _placement: Placement;
    private _foregroundTime: number = 0;
    private _startTime: number = 0;
    private _requestToViewTime: number = 0;
    private _clientInfo: ClientInfo;

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
        this._clientInfo = parameters.clientInfo;

        // TODO, we skip initial because the AFMA grantReward event tells us the video
        // has been completed. Is there a better way to do this with AFMA right now?
        this.setFinishState(this._placement.allowSkip() ? FinishState.COMPLETED : FinishState.SKIPPED);
    }

    public show(): Promise<void> {
        this._requestToViewTime = Date.now() - SdkStats.getAdRequestTimestamp();
        this.setShowing(true);

        this.sendTrackingEvent('show');
        if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
            this._nativeBridge.AndroidAdUnit.onKeyDown.subscribe(this._keyDownListener);
        }

        this._container.addEventHandler(this);

        return this._container.open(this, ['webview'], true, this._forceOrientation, true, false, true, false, this._options).then(() => {
            this.onStart.trigger();
            if (this._startTime === 0) {
                this._startTime = Date.now();
            }
            this._foregroundTime = Date.now();
            this.startAccelerometerUpdates();
            this.showView();
        });
    }

    public hide(): Promise<void> {
        this.onHide();
        this.hideView();
        this._container.removeEventHandler(this);
        return this._container.close();
    }

    public description(): string {
        return 'AdMob';
    }

    public sendImpressionEvent() {
        this.sendTrackingEvent('impression');
    }

    public sendClickEvent() {
        this.sendTrackingEvent('click');
        this._operativeEventManager.sendClick(this.getOperativeEventParams());

        UserCountData.getClickCount(this._nativeBridge).then((clickCount) => {
            if (typeof clickCount === 'number') {
                UserCountData.setClickCount(clickCount + 1, this._nativeBridge);
            }
        }).catch(() => {
            Diagnostics.trigger('request_count_failure', {
                signal: 'requestCount'
            });
        });
    }

    public sendStartEvent() {
        this._nativeBridge.Listener.sendStartEvent(this._placement.getId());
        this.sendTrackingEvent('start');
        this._operativeEventManager.sendStart(this.getOperativeEventParams());
    }

    public sendSkipEvent() {
        this.sendTrackingEvent('skip');
        this._operativeEventManager.sendSkip(this.getOperativeEventParams());
    }

    public sendCompleteEvent() {
        this.sendTrackingEvent('complete');
    }

    public sendRewardEvent() {
        const params = this.getOperativeEventParams();
        this._operativeEventManager.sendThirdQuartile(params);
        this._operativeEventManager.sendView(params);
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
            this._thirdPartyEventManager.sendEvent(`admob ${event}`, this._campaign.getSession().getId(), url);
        }
    }

    public sendClickSignalResponse(response: IClickSignalResponse) {
        this._view.sendClickSignalResponse(response);
    }

    public getRequestToViewTime(): number {
        return this._requestToViewTime;
    }

    public onContainerShow(): void {
        if (this._nativeBridge.getPlatform() === Platform.IOS) {
            this._nativeBridge.SensorInfo.Ios.startAccelerometerUpdates(new Double(0.01));
        }
    }

    public onContainerForeground(): void {
        this._foregroundTime = Date.now();
        this.startAccelerometerUpdates();
    }

    public onContainerBackground(): void {
        this._nativeBridge.SensorInfo.stopAccelerometerUpdates();

        if (this.isShowing() && CustomFeatures.isSimejiJapaneseKeyboardApp(this._clientInfo.getGameId())) {
            this.setFinishState(FinishState.SKIPPED);
            this.hide();
        }
    }

    public onContainerDestroy(): void {
        if (this.isShowing()) {
            this.setFinishState(FinishState.SKIPPED);
            this.hide();
        }
    }

    public onContainerSystemMessage(message: AdUnitContainerSystemMessage): void {
        // EMPTY
    }

    private startAccelerometerUpdates(): void {
        if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
            this._nativeBridge.SensorInfo.Android.startAccelerometerUpdates(SensorDelay.SENSOR_DELAY_FASTEST);
            this._nativeBridge.AndroidAdUnit.startMotionEventCapture(10000);
        } else {
            this._nativeBridge.SensorInfo.Ios.startAccelerometerUpdates(new Double(0.01));
        }
    }

    private showView() {
        this._view.show();
        document.body.appendChild(this._view.container());
    }

    private onHide() {
        this.setShowing(false);
        this._nativeBridge.Listener.sendFinishEvent(this._placement.getId(), this.getFinishState());
        this.onClose.trigger();

        if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
            this._nativeBridge.AndroidAdUnit.onKeyDown.unsubscribe(this._keyDownListener);
        }

        this._nativeBridge.SensorInfo.stopAccelerometerUpdates();

        if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
            this._nativeBridge.AndroidAdUnit.endMotionEventCapture();
            this._nativeBridge.AndroidAdUnit.clearMotionEventCapture();
        }

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

    private onKeyDown(key: number) {
        if (key === KeyCode.BACK) {
            this._view.onBackPressed();
        }
    }

    private getOperativeEventParams(): IOperativeEventParams {
        return {
            placement: this._placement
        };
    }
}
