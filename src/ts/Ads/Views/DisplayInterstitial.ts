import DisplayInterstitialTemplate from 'html/display/DisplayInterstitial.html';

import { View } from 'Ads/Views/View';
import { NativeBridge } from 'Common/Native/NativeBridge';
import { Placement } from 'Ads/Models/Placement';
import { DisplayInterstitialCampaign } from 'Ads/Models/Campaigns/DisplayInterstitialCampaign';
import { Platform } from 'Common/Constants/Platform';
import { Template } from 'Core/Utilities/Template';
import { AbstractPrivacy, IPrivacyHandler } from 'Ads/Views/AbstractPrivacy';
import { IGDPREventHandler } from 'Ads/EventHandlers/GDPREventHandler';
import { Observable0 } from 'Core/Utilities/Observable';

export interface IDisplayInterstitialHandler extends IGDPREventHandler {
    onDisplayInterstitialClose(): void;
}

export class DisplayInterstitial extends View<IDisplayInterstitialHandler> implements IPrivacyHandler {

    public readonly onPrivacyOpened: Observable0 = new Observable0();
    public readonly onPrivacyClosed: Observable0 = new Observable0();

    private _placement: Placement;
    private _campaign: DisplayInterstitialCampaign;

    private _closeElement: HTMLElement;
    private _GDPRPopupElement: HTMLElement;
    private _privacyButtonElement: HTMLElement;
    private _privacy: AbstractPrivacy;
    private _gdprPopupClicked: boolean = false;

    private _webPlayerPrepared = false;

    private _messageListener: EventListener;
    private _timers: number[] = [];
    private _showGDPRBanner: boolean;

    constructor(nativeBridge: NativeBridge, placement: Placement, campaign: DisplayInterstitialCampaign, privacy: AbstractPrivacy, showGDPRBanner: boolean) {
        super(nativeBridge, 'display-interstitial');

        this._placement = placement;
        this._campaign = campaign;
        this._template = new Template(DisplayInterstitialTemplate);
        this._privacy = privacy;
        this._showGDPRBanner = showGDPRBanner;

        this._messageListener = (e: Event) => this.onMessage(<MessageEvent>e);

        this._bindings = [
            {
                event: 'click',
                listener: (event: Event) => this.onCloseEvent(event),
                selector: '.close'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onGDPRPopupEvent(event),
                selector: '.gdpr-link'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onPrivacyEvent(event),
                selector: '.icon-gdpr'
            }
        ];

        this._privacy.render();
        this._privacy.hide();
        document.body.appendChild(this._privacy.container());
        this._privacy.addEventHandler(this);
    }

    public render() {
        super.render();

        this._closeElement = <HTMLElement>this._container.querySelector('.close-region');
        this._GDPRPopupElement = <HTMLElement>this._container.querySelector('.gdpr-pop-up');
        this._privacyButtonElement = <HTMLElement>this._container.querySelector('.privacy-button');
    }

    public show(): void {
        super.show();

        this.choosePrivacyShown();

        window.addEventListener('message', this._messageListener);
        this._closeElement.style.opacity = '1';
        this.updateProgressCircle(this._closeElement, 1);
    }

    public hide() {
        window.removeEventListener('message', this._messageListener);
        super.hide();

        if (this._privacy.container().parentElement) {
            document.body.removeChild(this._privacy.container());
        }

        for (const timer of this._timers) {
            window.clearInterval(timer);
        }
        this._timers = [];

        if (this._showGDPRBanner && !this._gdprPopupClicked) {
            this._handlers.forEach(handler => handler.onGDPRPopupSkipped());
        }

        this.onPrivacyClosed.unsubscribe();
        this.onPrivacyOpened.unsubscribe();
    }

    public onPrivacy(url: string): void {
        // do nothing
    }

    public onPrivacyClose(): void {
        if (this._privacy) {
            this._privacy.hide();
        }

        this.onPrivacyClosed.trigger();
    }

    public onGDPROptOut(optOutEnabled: boolean): void {
        // do nothing
    }

    private choosePrivacyShown(): void {
        if (!this._gdprPopupClicked && this._showGDPRBanner) {
            this._GDPRPopupElement.style.visibility = 'visible';
            this._privacyButtonElement.style.pointerEvents = '1';
            this._privacyButtonElement.style.visibility = 'hidden';
        } else {
            this._privacyButtonElement.style.visibility = 'visible';
            this._GDPRPopupElement.style.pointerEvents = '1';
            this._GDPRPopupElement.style.visibility = 'hidden';
        }
    }

    private updateProgressCircle(container: HTMLElement, progress: number) {
        const wrapperElement = <HTMLElement>container.querySelector('.progress-wrapper');

        if(this._nativeBridge.getPlatform() === Platform.ANDROID && this._nativeBridge.getApiLevel() < 15) {
            wrapperElement.style.display = 'none';
            this._container.style.display = 'none';
            /* tslint:disable:no-unused-expression */
            this._container.offsetHeight;
            /* tslint:enable:no-unused-expression */
            this._container.style.display = 'block';
            return;
        }

        const leftCircleElement = <HTMLElement>container.querySelector('.circle-left');
        const rightCircleElement = <HTMLElement>container.querySelector('.circle-right');

        const degrees = progress * 360;
        leftCircleElement.style.webkitTransform = 'rotate(' + degrees + 'deg)';

        if(progress >= 0.5) {
            wrapperElement.style.webkitAnimationName = 'close-progress-wrapper';
            rightCircleElement.style.webkitAnimationName = 'right-spin';
        }
    }

    private onCloseEvent(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        this._handlers.forEach(handler => handler.onDisplayInterstitialClose());
    }

    private onGDPRPopupEvent(event: Event) {
        event.preventDefault();

        if (!this._gdprPopupClicked) {
            this._gdprPopupClicked = true;
            this.choosePrivacyShown();
        }
        this.onPrivacyOpened.trigger();
        this._privacy.show();
    }

    private onPrivacyEvent(event: Event) {
        event.preventDefault();

        this.onPrivacyOpened.trigger();
        this._privacy.show();
    }

    private onMessage(e: MessageEvent) {
        switch (e.data.type) {
            case 'redirect':
                // TODO: should we do something here?
                // this._handlers.forEach(handler => handler.onDisplayInterstitialClick(e.data.href));
                break;
            default:
                this._nativeBridge.Sdk.logWarning(`Unknown message: ${e.data.type}`);
        }
    }
}
