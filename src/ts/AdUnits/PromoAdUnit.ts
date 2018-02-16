import { AbstractAdUnit, IAdUnitParameters } from "AdUnits/AbstractAdUnit";
import { NativeBridge } from "Native/NativeBridge";
import { AdUnitContainer, ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';
import { Placement } from "Models/Placement";
import { PromoCampaign } from "Models/Campaigns/PromoCampaign";
import { Promo } from 'Views/Promo';
import { IObserver0 } from 'Utilities/IObserver';
import { FinishState } from 'Constants/FinishState';
import { SessionManager } from 'Managers/SessionManager';
import { ThirdPartyEventManager } from "Managers/ThirdPartyEventManager";
import { PurchasingApi } from 'Native/Api/Purchasing';

export interface IPromoAdUnitParameters extends IAdUnitParameters<PromoCampaign> {
    view: Promo;
}

export class PromoAdUnit extends AbstractAdUnit {
    private _sessionManager: SessionManager;
    private _thirdPartyEventManager: ThirdPartyEventManager;
    private _promoView: Promo;
    private _options: any;
    private _placement: Placement;
    private _campaign: PromoCampaign;

    private _onSystemKillObserver: IObserver0;
    private _additionalTrackingEvents: { [eventName: string]: string[] } | undefined;

    constructor(nativeBridge: NativeBridge, parameters: IPromoAdUnitParameters) {
        super(nativeBridge, parameters);

        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
        this._additionalTrackingEvents = parameters.campaign.getTrackingEventUrls();
        this._promoView = parameters.view;
        this._options = parameters.options;
        this._placement = parameters.placement;
        this._campaign = parameters.campaign;
    }
    public show(): Promise<void> {
        // Always set to complete to avoid errors.
        this.setFinishState(FinishState.COMPLETED);
        this.setShowing(true);
        this.onStart.trigger();
        this._promoView.show();
        this.sendTrackingEvent('impression');

        this._onSystemKillObserver = this._container.onSystemKill.subscribe(() => this.onSystemKill());

        return this._container.open(this, false, false, ForceOrientation.NONE, true, true, false, true, this._options);
    }

    public hide(): Promise<void> {
        if(!this.isShowing()) {
            return Promise.resolve();
        }
        this.setShowing(false);

        this._container.onSystemKill.unsubscribe(this._onSystemKillObserver);

        this.sendTrackingEvent('complete');
        this._promoView.hide();
        this._promoView.container().parentElement!.removeChild(this._promoView.container());
        this.unsetReferences();

        this._nativeBridge.Listener.sendFinishEvent(this._placement.getId(), this.getFinishState());

        this.onFinish.trigger();
        this.onClose.trigger();
        return this._container.close();
    }

    public sendClick(): void {
        this.sendTrackingEvent('click');
    }

    public isCached(): boolean {
        return true;
    }

    public description(): string {
        return 'promo';
    }

    private sendTrackingEvent(eventName: string): void {
        const placementId = this._placement.getId();
        const sessionId = this._campaign.getSession().getId();
        if(this._additionalTrackingEvents) {
            const trackingEventUrls = this._additionalTrackingEvents[eventName];

            if(trackingEventUrls) {
                for (let url of trackingEventUrls) {
                    url = url.replace(/%ZONE%/, placementId);
                    this._thirdPartyEventManager.sendEvent(eventName, sessionId, url);
                }
            }
        }
    }

    private unsetReferences() {
        delete this._promoView;
    }

    private onSystemKill() {
        if(this.isShowing()) {
            this.setFinishState(FinishState.SKIPPED);
            this.hide();
        }
    }
}
