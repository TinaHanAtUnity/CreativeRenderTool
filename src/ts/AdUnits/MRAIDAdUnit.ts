import { NativeBridge } from 'Native/NativeBridge';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { MRAIDCampaign } from 'Models/Campaigns/MRAIDCampaign';
import { Placement } from 'Models/Placement';
import { FinishState } from 'Constants/FinishState';
import { IObserver0 } from 'Utilities/IObserver';
import { SessionManager } from 'Managers/SessionManager';
import { MRAIDView, IOrientationProperties } from 'Views/MRAIDView';
import { AdUnitContainer, ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';
import { Platform } from 'Constants/Platform';
import { HTML } from 'Models/Assets/HTML';
import { EndScreen } from 'Views/EndScreen';

export class MRAIDAdUnit extends AbstractAdUnit {

    private _sessionManager: SessionManager;
    private _mraid: MRAIDView;
    private _options: any;
    private _orientationProperties: IOrientationProperties;
    private _endScreen?: EndScreen;
    private _showingMRAID: boolean;

    private _onShowObserver: IObserver0;
    private _onSystemKillObserver: IObserver0;
    private _onSystemInterruptObserver: any;
    private _onPauseObserver: any;
    private _additionalTrackingEvents: { [eventName: string]: string[] };

    constructor(nativeBridge: NativeBridge, container: AdUnitContainer, sessionManager: SessionManager, placement: Placement, campaign: MRAIDCampaign, mraid: MRAIDView, options: any, endScreen?: EndScreen) {
        super(nativeBridge, ForceOrientation.NONE, container, placement, campaign);
        this._sessionManager = sessionManager;
        this._mraid = mraid;
        this._additionalTrackingEvents = campaign.getTrackingEventUrls();
        this._endScreen = endScreen;

        this._orientationProperties = {
            allowOrientationChange: true,
            forceOrientation: ForceOrientation.NONE
        };

        mraid.onOrientationProperties.subscribe((properties) => {
            if(this.isShowing()) {
                if(nativeBridge.getPlatform() === Platform.IOS) {
                    container.reorient(true, properties.forceOrientation);
                } else {
                    container.reorient(properties.allowOrientationChange, properties.forceOrientation);
                }
            } else {
                this._orientationProperties = properties;
            }
        });

        this._options = options;
        this.setShowing(false);
    }

    public show(): Promise<void> {
        this.setShowing(true);
        this.setShowingMRAID(true);
        this._mraid.show();
        this.onStart.trigger();
        this._nativeBridge.Listener.sendStartEvent(this._placement.getId());
        this._sessionManager.sendStart(this);
        this.sendTrackingEvent('impression');

        this._onShowObserver = this._container.onShow.subscribe(() => this.onShow());
        this._onSystemKillObserver = this._container.onSystemKill.subscribe(() => this.onSystemKill());
        this._onSystemInterruptObserver = this._container.onSystemInterrupt.subscribe((interruptStarted) => this.onSystemInterrupt(interruptStarted));
        this._onPauseObserver = this._container.onAndroidPause.subscribe(() => this.onSystemPause());

        return this._container.open(this, false, this._orientationProperties.allowOrientationChange, this._orientationProperties.forceOrientation, true, false, true, false, this._options);
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
        }

        const finishState = this.getFinishState();
        if(finishState === FinishState.COMPLETED) {
            this._sessionManager.sendThirdQuartile(this);
            this._sessionManager.sendView(this);
            this.sendTrackingEvent('complete');
        } else if(finishState === FinishState.SKIPPED) {
            this._sessionManager.sendSkip(this);
        }

        this.onFinish.trigger();
        this._mraid.container().parentElement!.removeChild(this._mraid.container());
        this.unsetReferences();

        this._nativeBridge.Listener.sendFinishEvent(this._placement.getId(), this.getFinishState());

        return this._container.close().then(() => {
            this.onClose.trigger();
        });
    }

    public isCached(): boolean {
        const asset: HTML | undefined = (<MRAIDCampaign>this.getCampaign()).getResourceUrl();
        if(asset) {
            return asset.isCached();
        }

        return false;
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

    public getMRAIDView(): MRAIDView {
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
        const eventManager = this._sessionManager.getEventManager();
        const sdkVersion = this._sessionManager.getClientInfo().getSdkVersion();
        const placementId = this.getPlacement().getId();
        const sessionId = this.getCampaign().getSession().getId();
        const trackingEventUrls = this._additionalTrackingEvents[eventName];

        if(trackingEventUrls) {
            for (let url of trackingEventUrls) {
                url = url.replace(/%ZONE%/, placementId);
                url = url.replace(/%SDK_VERSION%/, sdkVersion.toString());
                eventManager.thirdPartyEvent(`mraid ${eventName}`, sessionId, url);
            }
        }
    }
}
