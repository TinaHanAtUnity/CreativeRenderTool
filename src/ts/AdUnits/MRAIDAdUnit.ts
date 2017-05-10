import { NativeBridge } from 'Native/NativeBridge';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { MRAIDCampaign } from 'Models/MRAIDCampaign';
import { Placement } from 'Models/Placement';
import { FinishState } from 'Constants/FinishState';
import { IObserver0 } from 'Utilities/IObserver';
import { SessionManager } from 'Managers/SessionManager';
import { MRAID, IOrientationProperties } from 'Views/MRAID';
import { AdUnitContainer, ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';
import { Platform } from 'Constants/Platform';

export class MRAIDAdUnit extends AbstractAdUnit {

    private _sessionManager: SessionManager;
    private _mraid: MRAID;
    private _options: any;
    private _orientationProperties: IOrientationProperties;

    private _onShowObserver: IObserver0;
    private _onSystemKillObserver: IObserver0;
    private _additionalTrackingEvents: { [eventName: string]: string[] };

    constructor(nativeBridge: NativeBridge, container: AdUnitContainer, sessionManager: SessionManager, placement: Placement, campaign: MRAIDCampaign, mraid: MRAID, options: any) {
        super(nativeBridge, container, placement, campaign);
        this._sessionManager = sessionManager;
        this._mraid = mraid;
        this._additionalTrackingEvents = campaign.getTrackingEventUrls();

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
        this._mraid.show();
        this.onStart.trigger();
        this._nativeBridge.Listener.sendStartEvent(this._placement.getId());
        this._sessionManager.sendStart(this);
        this.sendTrackingEvent('impression');

        this._onShowObserver = this._container.onShow.subscribe(() => this.onShow());
        this._onSystemKillObserver = this._container.onSystemKill.subscribe(() => this.onSystemKill());

        return this._container.open(this, false, this._orientationProperties.allowOrientationChange, this._orientationProperties.forceOrientation, true, this._options);
    }

    public hide(): Promise<void> {
        if(!this.isShowing()) {
            return Promise.resolve();
        }
        this.setShowing(false);

        this._container.onShow.unsubscribe(this._onShowObserver);
        this._container.onSystemKill.unsubscribe(this._onSystemKillObserver);

        this._mraid.hide();

        const finishState = this.getFinishState();
        if(finishState === FinishState.COMPLETED) {
            this._sessionManager.sendThirdQuartile(this);
            this._sessionManager.sendView(this);
            this.sendTrackingEvent('complete');
        } else if(finishState === FinishState.SKIPPED) {
            this._sessionManager.sendSkip(this);
        }

        this.onFinish.trigger();
        this.onClose.trigger();
        this._mraid.container().parentElement!.removeChild(this._mraid.container());
        this.unsetReferences();

        this._nativeBridge.Listener.sendFinishEvent(this._placement.getId(), this.getFinishState());

        return this._container.close();
    }

    public description(): string {
        return 'mraid';
    }

    public sendClick(): void {
        this.sendTrackingEvent('click');
    }

    private onShow() {
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

    private unsetReferences() {
        delete this._mraid;
    }

    private sendTrackingEvent(eventName: string): void {
        const eventManager = this._sessionManager.getEventManager();
        const sdkVersion = this._sessionManager.getClientInfo().getSdkVersion();
        const placementId = this.getPlacement().getId();
        const sessionId = this._sessionManager.getSession().getId();
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
