import { AdMobCampaign } from 'AdMob/Models/AdMobCampaign';
import { AdMobView } from 'AdMob/Views/AdMobView';
import { IClickSignalResponse, IOpenableIntentsResponse } from 'AdMob/Views/AFMABridge';
import { AbstractAdUnit, IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { AdUnitContainerSystemMessage, IAdUnitContainerListener } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { IOperativeEventParams, OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { ThirdPartyEventManager, TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';
import { Placement } from 'Ads/Models/Placement';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { SdkStats } from 'Ads/Utilities/SdkStats';
import { UserCountData } from 'Ads/Utilities/UserCountData';
import { KeyCode } from 'Core/Constants/Android/KeyCode';
import { SensorDelay } from 'Core/Constants/Android/SensorDelay';
import { FinishState } from 'Core/Constants/FinishState';
import { Platform } from 'Core/Constants/Platform';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { Double } from 'Core/Utilities/Double';
import { AdMobSignalFactory } from 'AdMob/Utilities/AdMobSignalFactory';
import { ProgrammaticTrackingService, AdmobMetric } from 'Ads/Utilities/ProgrammaticTrackingService';

export interface IAdMobAdUnitParameters extends IAdUnitParameters<AdMobCampaign> {
    view: AdMobView;
    adMobSignalFactory: AdMobSignalFactory;
}

export class AdMobAdUnit extends AbstractAdUnit implements IAdUnitContainerListener {

    private _operativeEventManager: OperativeEventManager;
    private _view: AdMobView;
    private _thirdPartyEventManager: ThirdPartyEventManager;
    private _options: unknown;
    private _keyDownListener: (kc: number) => void;
    private _campaign: AdMobCampaign;
    private _placement: Placement;
    private _foregroundTime: number = 0;
    private _startTime: number = 0;
    private _requestToViewTime: number = 0;
    private _clientInfo: ClientInfo;
    private _pts: ProgrammaticTrackingService;
    private _isRewardedPlacement: boolean;

    constructor(parameters: IAdMobAdUnitParameters) {
        super(parameters);
        this._operativeEventManager = parameters.operativeEventManager;
        this._view = parameters.view;
        this._options = parameters.options;
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
        this._operativeEventManager = parameters.operativeEventManager;
        this._keyDownListener = (kc: number) => this.onKeyDown(kc);
        this._campaign = parameters.campaign;
        this._placement = parameters.placement;
        this._clientInfo = parameters.clientInfo;
        this._pts = parameters.programmaticTrackingService;
        this._isRewardedPlacement = !parameters.placement.allowSkip();

        // TODO, we skip initial because the AFMA grantReward event tells us the video
        // has been completed. Is there a better way to do this with AFMA right now?
        this.setFinishState(this._isRewardedPlacement ? FinishState.SKIPPED : FinishState.COMPLETED);
    }

    public show(): Promise<void> {
        this._requestToViewTime = Date.now() - SdkStats.getAdRequestTimestamp();
        this.setShowing(true);

        if (this._isRewardedPlacement) {
            this._pts.reportMetric(AdmobMetric.AdmobRewardedVideoStart);
        }

        this.sendTrackingEvent(TrackingEvent.SHOW);
        if (this._platform === Platform.ANDROID) {
            this._ads.Android!.AdUnit.onKeyDown.subscribe(this._keyDownListener);
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

    public sendClickEvent() {
        this.sendTrackingEvent(TrackingEvent.CLICK);
        this._operativeEventManager.sendClick(this.getOperativeEventParams());

        UserCountData.getClickCount(this._core).then((clickCount) => {
            if (typeof clickCount === 'number') {
                UserCountData.setClickCount(clickCount + 1, this._core);
            }
        }).catch(() => {
            Diagnostics.trigger('request_count_failure', {
                signal: 'requestCount'
            });
        });
    }

    public sendStartEvent() {
        this._ads.Listener.sendStartEvent(this._placement.getId());
        this.sendTrackingEvent(TrackingEvent.START);
        this._operativeEventManager.sendStart(this.getOperativeEventParams()).then(() => {
            this.onStartProcessed.trigger();
        });
    }

    public sendSkipEvent() {
        if (this._isRewardedPlacement) {
            this._pts.reportMetric(AdmobMetric.AdmobUserSkippedRewardedVideo);
        }
        this.sendTrackingEvent(TrackingEvent.SKIP);
        this._operativeEventManager.sendSkip(this.getOperativeEventParams());
    }

    public sendCompleteEvent() {
        this.sendTrackingEvent(TrackingEvent.COMPLETE);
    }

    public sendRewardEvent() {
        const params = this.getOperativeEventParams();
        this._operativeEventManager.sendThirdQuartile(params);
        this._operativeEventManager.sendView(params);
        if (this._isRewardedPlacement) {
            this._pts.reportMetric(AdmobMetric.AdmobUserWasRewarded);
        }
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

    public sendTrackingEvent(event: TrackingEvent, useWebviewUserAgentForTracking?: boolean, headers?: [string, string][]) {
        return this._thirdPartyEventManager.sendTrackingEvents(this._campaign, event, 'admob', useWebviewUserAgentForTracking, headers);
    }

    public sendClickSignalResponse(response: IClickSignalResponse) {
        this._view.sendClickSignalResponse(response);
    }

    public getRequestToViewTime(): number {
        return this._requestToViewTime;
    }

    public onContainerShow(): void {
        if (this._platform === Platform.IOS) {
            this._core.SensorInfo.Ios!.startAccelerometerUpdates(new Double(0.01));
        }
    }

    public onContainerForeground(): void {
        this._foregroundTime = Date.now();
        this.startAccelerometerUpdates();
    }

    public onContainerBackground(): void {
        this._core.SensorInfo.stopAccelerometerUpdates();

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
        if (this._platform === Platform.ANDROID) {
            this._core.SensorInfo.Android!.startAccelerometerUpdates(SensorDelay.SENSOR_DELAY_FASTEST);
            this._ads.Android!.AdUnit.startMotionEventCapture(10000);
        } else {
            this._core.SensorInfo.Ios!.startAccelerometerUpdates(new Double(0.01));
        }
    }

    private showView() {
        this._view.show();
        document.body.appendChild(this._view.container());
    }

    private onHide() {
        this.setShowing(false);
        this._ads.Listener.sendFinishEvent(this._placement.getId(), this.getFinishState());
        this.onClose.trigger();

        if (this._platform === Platform.ANDROID) {
            this._ads.Android!.AdUnit.onKeyDown.unsubscribe(this._keyDownListener);
        }

        this._core.SensorInfo.stopAccelerometerUpdates();

        if (this._platform === Platform.ANDROID) {
            this._ads.Android!.AdUnit.endMotionEventCapture();
            this._ads.Android!.AdUnit.clearMotionEventCapture();
        }

        if (this.getFinishState() === FinishState.SKIPPED) {
            this.sendSkipEvent();
        } else if (this.getFinishState() === FinishState.COMPLETED) {
            this.sendCompleteEvent();
        }
    }

    private hideView() {
        this._view.hide();
        if (this._view.container()) {
            document.body.removeChild(this._view.container());
        }
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
