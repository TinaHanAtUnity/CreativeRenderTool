import PromoTpl from 'html/Promo.html';

import { NativeBridge } from 'Native/NativeBridge';
import { View } from 'Views/View';
import { Template } from 'Utilities/Template';
import { Observable0, Observable1 } from 'Utilities/Observable';
import { Localization } from 'Utilities/Localization';
import { PromoCampaign } from 'Models/Campaigns/PromoCampaign';
import { PurchasingUtilities } from 'Utilities/PurchasingUtilities';
import { IPrivacyHandler, AbstractPrivacy } from 'Views/AbstractPrivacy';
import { GDPRPrivacy } from 'Views/GDPRPrivacy';

export class Promo extends View<{}> implements IPrivacyHandler {

    public readonly onPromo = new Observable1<string>();
    public readonly onClose = new Observable0();
    public readonly onGDPRPopupSkipped = new Observable0();

    private _promoCampaign: PromoCampaign;
    private _localization: Localization;
    private _iframe: HTMLIFrameElement | null;
    private _messageHandler: (e: Event) => void;

    private _GDPRPopupElement: HTMLElement;
    private _privacyButtonElement: HTMLElement;
    private _privacy: AbstractPrivacy;
    private _showGDPRBanner: boolean = false;
    private _gdprPopupClicked: boolean = false;

    constructor(nativeBridge: NativeBridge, campaign: PromoCampaign, language: string, privacy: AbstractPrivacy, showGDPRBanner: boolean) {
        super(nativeBridge, 'promo');
        this._localization = new Localization(language, 'promo');

        this._privacy = privacy;
        this._showGDPRBanner = showGDPRBanner;

        this._template = new Template(PromoTpl);
        this._promoCampaign = campaign;

        this._messageHandler = (e: Event) => this.onMessage(<MessageEvent>e);

        if(campaign) {
            this._templateData = {
                'localizedPrice': PurchasingUtilities.productPrice(campaign.getIapProductId())
            };
        }

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
                selector: '.icon-info'
            }
        ];

        this._privacy.render();
        this._privacy.hide();
        document.body.appendChild(this._privacy.container());
        this._privacy.addEventHandler(this);
    }

    public render() {
        super.render();

        this._iframe = this._container.querySelector('iframe');

        this.getPromoMarkup().then((markup) => {
            const tpl = new Template(markup, this._localization);
            this._iframe!.setAttribute('srcdoc', tpl.render(this._templateData ? this._templateData : {}));
        });
        this._GDPRPopupElement = <HTMLElement>this._container.querySelector('.gdpr-pop-up');
        this._privacyButtonElement = <HTMLElement>this._container.querySelector('.privacy-button');
    }

    public show(): void {
        super.show();
        window.addEventListener('message', this._messageHandler);

        if (this._showGDPRBanner && this._privacy instanceof GDPRPrivacy) {
            this._GDPRPopupElement.style.opacity = '1';
            this._privacyButtonElement.style.pointerEvents = '1';
            this._privacyButtonElement.style.visibility = 'hidden';
        } else {
            this._GDPRPopupElement.style.pointerEvents = '1';
            this._GDPRPopupElement.style.visibility = 'hidden';
            this._iframe!.style.height = '100vh';
        }
    }

    public hide(): void {
        super.hide();
        window.removeEventListener('message', this._messageHandler);

        if (this._privacy) {
            this._privacy.removeEventHandler(this);
            this._privacy.hide();
            this._privacy.container().parentElement!.removeChild(this._privacy.container());
        }

        if (this._showGDPRBanner && !this._gdprPopupClicked) {
            this.onGDPRPopupSkipped.trigger();
        }
    }

    public onPrivacy(url: string): void {
        // do nothing
    }

    public onPrivacyClose(): void {
        if (this._privacy) {
            this._privacy.hide();
        }
    }

    public onGDPROptOut(optOutEnabled: boolean): void {
        // do nothing
    }

    private onMessage(e: MessageEvent): void {
        const data: any = e.data;
        switch (data.type) {
            case 'close':
                this.onCloseEvent(e);
                break;
            case 'promo':
                this.onPromoEvent(e);
                break;
        }
    }

    private onPromoEvent(event: Event): void {
        event.preventDefault();
        this.onPromo.trigger(this._promoCampaign.getIapProductId());
    }

    private onCloseEvent(event: Event): void {
        event.preventDefault();
        this.onClose.trigger();
    }

    private onGDPRPopupEvent(event: Event) {
        event.preventDefault();

        this._gdprPopupClicked = true;
        this._privacy.show();
    }

    private onPrivacyEvent(event: Event) {
        event.preventDefault();
        this._privacy.show();
    }

    private getPromoMarkup(): Promise<string> {
        return this.getStaticMarkup().then((markup) => {
            return this.replaceDynamicMarkupPlaceholder(markup);
        });
    }

    private getStaticMarkup(): Promise<string> {
        const resourceUrl = this._promoCampaign.getCreativeResource();
        if(resourceUrl) {
            const fileId = resourceUrl.getFileId();
            if(fileId) {
                return this._nativeBridge.Cache.getFileContent(fileId, 'UTF-8');
            } else {
                return new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.addEventListener('load', () => {
                        resolve(xhr.responseText);
                    }, false);
                    xhr.open('GET', decodeURIComponent(resourceUrl.getOriginalUrl()));
                    xhr.send();
                });
            }
        } else {
            return Promise.reject(new Error('No creative resource found for campaign'));
        }
    }

    private replaceDynamicMarkupPlaceholder(markup: string): string {
        const dynamicMarkup = this._promoCampaign.getDynamicMarkup();
        if (dynamicMarkup) {
            markup = markup.replace('{UNITY_DYNAMIC_MARKUP}', dynamicMarkup);
        }
        return markup;
    }
}
