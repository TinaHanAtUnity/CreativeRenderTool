import { NativeBridge } from 'Native/NativeBridge';
import { AbstractAdUnit, IAdUnitParameters } from 'AdUnits/AbstractAdUnit';
import { MRAIDCampaign } from 'Models/Campaigns/MRAIDCampaign';
import { FinishState } from 'Constants/FinishState';
import { IObserver0 } from 'Utilities/IObserver';
import { MRAIDView, IOrientationProperties, IMRAIDViewHandler } from 'Views/MRAIDView';
import { Orientation } from 'AdUnits/Containers/AdUnitContainer';
import { EndScreen } from 'Views/EndScreen';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { ClientInfo } from 'Models/ClientInfo';
import { EventType } from 'Models/Session';
import { Placement } from 'Models/Placement';
import { GameSessionCounters } from 'Utilities/GameSessionCounters';

export interface IMRAIDAdUnitParameters extends IAdUnitParameters<MRAIDCampaign> {
    mraid: MRAIDView<IMRAIDViewHandler>;
    endScreen?: EndScreen;
}

export class MRAIDAdUnit extends AbstractAdUnit {

    private _operativeEventManager: OperativeEventManager;
    private _thirdPartyEventManager: ThirdPartyEventManager;
    private _mraid: MRAIDView<IMRAIDViewHandler>;
    private _options: any;
    private _orientationProperties: IOrientationProperties;
    private _endScreen?: EndScreen;
    private _showingMRAID: boolean;
    private _clientInfo: ClientInfo;
    private _placement: Placement;
    private _campaign: MRAIDCampaign;

    private _onShowObserver: IObserver0;
    private _onSystemKillObserver: IObserver0;
    private _onSystemInterruptObserver: any;
    private _onPauseObserver: any;
    private _additionalTrackingEvents: { [eventName: string]: string[] } | undefined;

    constructor(nativeBridge: NativeBridge, parameters: IMRAIDAdUnitParameters) {
        super(nativeBridge, parameters);

        this._operativeEventManager = parameters.operativeEventManager;
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
        this._mraid = parameters.mraid;
        this._additionalTrackingEvents = parameters.campaign.getTrackingUrls();
        this._endScreen = parameters.endScreen;
        this._clientInfo = parameters.clientInfo;
        this._placement = parameters.placement;
        this._campaign = parameters.campaign;

        this._mraid.render();
        document.body.appendChild(this._mraid.container());

        if(this._endScreen) {
            this._endScreen.render();
            this._endScreen.hide();
            document.body.appendChild(this._endScreen.container());
        }

        this._orientationProperties = {
            allowOrientationChange: true,
            forceOrientation: Orientation.NONE
        };

        this._options = parameters.options;
        this.setShowing(false);
    }

    public show(): Promise<void> {
        this.setShowing(true);
        this.setShowingMRAID(true);
        this._mraid.show();
        this._nativeBridge.Listener.sendStartEvent(this._placement.getId());
        this._operativeEventManager.sendStart(this._placement).then(() => {
            this.onStartProcessed.trigger();
        });
        this.sendTrackingEvent('impression');

        this._onShowObserver = this._container.onShow.subscribe(() => this.onShow());
        this._onSystemKillObserver = this._container.onSystemKill.subscribe(() => this.onSystemKill());
        this._onSystemInterruptObserver = this._container.onSystemInterrupt.subscribe((interruptStarted) => this.onSystemInterrupt(interruptStarted));
        this._onPauseObserver = this._container.onAndroidPause.subscribe(() => this.onSystemPause());

        return this._container.open(this, ['webview'], this._orientationProperties.allowOrientationChange, this._orientationProperties.forceOrientation, true, false, true, false, this._options).then(() => {
            this.onStart.trigger();
        });
    }

    public hide(): Promise<void> {
        if(!this.isShowing()) {
            return Promise.resolve();
        }
        this.setShowing(false);
        this.setShowingMRAID(false);

        this._container.onShow.unsubscribe(this._onShowObserver);
        this._container.onSystemKill.unsubscribe(this._onSystemKillObserver);
        this._container.onSystemInterrupt.unsubscribe(this._onSystemInterruptObserver);
        this._container.onAndroidPause.unsubscribe(this._onPauseObserver);

        this._mraid.hide();
        if(this._endScreen) {
            this._endScreen.hide();
            this._endScreen.container().parentElement!.removeChild(this._endScreen.container());
        }

        const finishState = this.getFinishState();
        if(finishState === FinishState.COMPLETED) {
            GameSessionCounters.addView(this._campaign);

            if(!this._campaign.getSession().getEventSent(EventType.THIRD_QUARTILE)) {
                this._operativeEventManager.sendThirdQuartile(this._placement);
            }
            if(!this._campaign.getSession().getEventSent(EventType.VIEW)) {
                this._operativeEventManager.sendView(this._placement);
            }
            this.sendTrackingEvent('complete');
        } else if(finishState === FinishState.SKIPPED) {
            this._operativeEventManager.sendSkip(this._placement);
        }

        this.onFinish.trigger();
        this._mraid.container().parentElement!.removeChild(this._mraid.container());
        this.unsetReferences();

        this._nativeBridge.Listener.sendFinishEvent(this._placement.getId(), this.getFinishState());

        return this._container.close().then(() => {
            this.onClose.trigger();
        });
    }

    public setOrientationProperties(properties: IOrientationProperties): void {
        this._orientationProperties = properties;
    }

    public description(): string {
        return 'mraid';
    }

    public sendClick(): void {
        this.sendTrackingEvent('click');
    }

    public getEndScreen(): EndScreen | undefined {
        return this._endScreen;
    }

    public getMRAIDView(): MRAIDView<IMRAIDViewHandler> {
        return this._mraid;
    }

    public setShowingMRAID(showing: boolean) {
        this._showingMRAID = showing;
    }

    public isShowingMRAID(): boolean {
        return this._showingMRAID;
    }

    private onShow() {
        this._mraid.setViewableState(true);

        if(AbstractAdUnit.getAutoClose()) {
            setTimeout(() => {
                this.setFinishState(FinishState.COMPLETED);
                this.hide();
            }, AbstractAdUnit.getAutoCloseDelay());
        }
    }

    private onSystemKill() {
        if(this.isShowing()) {
            this.setFinishState(FinishState.SKIPPED);
            this.hide();
        }
    }

    private onSystemInterrupt(interruptStarted: boolean): void {
        if(this.isShowing()) {
            if(interruptStarted) {
                this._mraid.setViewableState(false);
            } else {
                this._mraid.setViewableState(true);
            }
        }
    }

    private onSystemPause(): void {
        if(this.isShowing()) {
            this._mraid.setViewableState(false);
        }
    }

    private unsetReferences() {
        delete this._mraid;
        delete this._endScreen;
    }

    private sendTrackingEvent(eventName: string): void {
        const sdkVersion = this._clientInfo.getSdkVersion();
        const placementId = this._placement.getId();
        const sessionId = this._campaign.getSession().getId();

        if(this._additionalTrackingEvents && this._additionalTrackingEvents[eventName]) {
            const trackingEventUrls = this._additionalTrackingEvents[eventName];

            if(trackingEventUrls) {
                for (let url of trackingEventUrls) {
                    url = url.replace(/%ZONE%/, placementId);
                    url = url.replace(/%SDK_VERSION%/, sdkVersion.toString());
                    this._thirdPartyEventManager.sendEvent(`mraid ${eventName}`, sessionId, url, this._campaign.getUseWebViewUserAgentForTracking());
                }
            }
        }
    }
}
