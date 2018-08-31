import { AbstractAdUnit, IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { NativeBridge } from 'Common/Native/NativeBridge';
import {
    AdUnitContainerSystemMessage,
    IAdUnitContainerListener,
    Orientation
} from 'Ads/AdUnits/Containers/AdUnitContainer';
import { Placement } from 'Ads/Models/Placement';
import { PromoCampaign } from 'Ads/Models/Campaigns/PromoCampaign';
import { Promo } from 'Ads/Views/Promo';
import { FinishState } from 'Common/Constants/FinishState';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Platform } from 'Common/Constants/Platform';
import { KeyCode } from 'Common/Constants/Android/KeyCode';
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';

export interface IPromoAdUnitParameters extends IAdUnitParameters<PromoCampaign> {
    view: Promo;
    privacy: AbstractPrivacy;
}

export class PromoAdUnit extends AbstractAdUnit implements IAdUnitContainerListener {
    private _thirdPartyEventManager: ThirdPartyEventManager;
    private _promoView: Promo;
    private _options: any;
    private _placement: Placement;
    private _campaign: PromoCampaign;
    private _privacy: AbstractPrivacy;

    private _keyDownListener: (kc: number) => void;
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
        this._privacy = parameters.privacy;
    }

    public show(): Promise<void> {
        this.setShowing(true);
        this._nativeBridge.Listener.sendStartEvent(this._placement.getId());
        this._promoView.show();
        this.sendTrackingEvent('impression');

        if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
            this._nativeBridge.AndroidAdUnit.onKeyDown.subscribe(this._keyDownListener);
        }

        this._container.addEventHandler(this);

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

        this._container.removeEventHandler(this);

        if (this._privacy) {
            this._privacy.hide();
            this._privacy.container().parentElement!.removeChild(this._privacy.container());
        }

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

    public onContainerShow(): void {
        // EMPTY
    }

    public onContainerDestroy(): void {
        if(this.isShowing()) {
            this.setFinishState(FinishState.SKIPPED);
            this.hide();
        }
    }

    public onContainerBackground(): void {
        // EMPTY
    }

    public onContainerForeground(): void {
        // EMPTY
    }

    public onContainerSystemMessage(message: AdUnitContainerSystemMessage): void {
        // EMPTY
    }

    private onKeyDown(key: number) {
        if (key === KeyCode.BACK) {
            this._promoView.onClose.trigger();
        }
    }

    private sendTrackingEvent(eventName: string): void {
        const sessionId = this._campaign.getSession().getId();
        if(this._additionalTrackingEvents) {
            const trackingEventUrls = this._additionalTrackingEvents[eventName];

            if(trackingEventUrls) {
                for (const url of trackingEventUrls) {
                    this._thirdPartyEventManager.sendEvent(eventName, sessionId, url);
                }
            }
        }
    }

    private unsetReferences() {
        delete this._promoView;
        delete this._privacy;
    }
}
