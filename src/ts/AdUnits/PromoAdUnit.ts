import { AbstractAdUnit, IAdUnitParameters } from 'AdUnits/AbstractAdUnit';
import { NativeBridge } from 'Native/NativeBridge';
import { Orientation } from 'AdUnits/Containers/AdUnitContainer';
import { Placement } from 'Models/Placement';
import { PromoCampaign } from 'Models/Campaigns/PromoCampaign';
import { Promo } from 'Views/Promo';
import { IObserver0 } from 'Utilities/IObserver';
import { FinishState } from 'Constants/FinishState';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { Platform } from 'Constants/Platform';
import { KeyCode } from 'Constants/Android/KeyCode';

export interface IPromoAdUnitParameters extends IAdUnitParameters<PromoCampaign> {
    view: Promo;
}

export class PromoAdUnit extends AbstractAdUnit {
    private _thirdPartyEventManager: ThirdPartyEventManager;
    private _promoView: Promo;
    private _options: any;
    private _placement: Placement;
    private _campaign: PromoCampaign;

    private _keyDownListener: (kc: number) => void;
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
        this._keyDownListener = (kc: number) => this.onKeyDown(kc);
    }

    public show(): Promise<void> {
        this.setShowing(true);
        this._nativeBridge.Listener.sendStartEvent(this._placement.getId());
        this._promoView.show();
        this.sendTrackingEvent('impression');

        if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
            this._nativeBridge.AndroidAdUnit.onKeyDown.subscribe(this._keyDownListener);
        }

        this._onSystemKillObserver = this._container.onSystemKill.subscribe(() => this.onSystemKill());

        return this._container.open(this, ['webview'], false, Orientation.NONE, true, true, false, true, this._options).then(() => {
            this.onStart.trigger();
        });
    }

    public hide(): Promise<void> {
        if(!this.isShowing()) {
            return Promise.resolve();
        }
        this.setShowing(false);

        if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
            this._nativeBridge.AndroidAdUnit.onKeyDown.unsubscribe(this._keyDownListener);
        }

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
        this._nativeBridge.Listener.sendClickEvent(this._placement.getId());
        this.sendTrackingEvent('click');
    }

    public description(): string {
        return 'promo';
    }

    private onKeyDown(key: number) {
        if (key === KeyCode.BACK) {
            this._promoView.onClose.trigger();
        }
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
