import { AbstractPrivacy, IPrivacyHandler } from 'Ads/Views/AbstractPrivacy';
import { Platform } from 'Core/Constants/Platform';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Localization } from 'Core/Utilities/Localization';
import { Observable0, Observable1 } from 'Core/Utilities/Observable';
import { Template } from 'Core/Utilities/Template';
import { XHRequest } from 'Core/Utilities/XHRequest';
import { View } from 'Core/Views/View';
import PromoTpl from 'html/Promo.html';
import { PromoCampaign } from 'Promo/Models/PromoCampaign';
import { PurchasingUtilities } from 'Promo/Utilities/PurchasingUtilities';
import { Placement } from 'Ads/Models/Placement';

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

    constructor(nativeBridge: NativeBridge, campaign: PromoCampaign, language: string, privacy: AbstractPrivacy, showGDPRBanner: boolean, placement: Placement) {
        super(nativeBridge, 'promo');
        this._localization = new Localization(language, 'promo');

        this._privacy = privacy;
        this._showGDPRBanner = showGDPRBanner;

        this._template = new Template(PromoTpl);
        this._promoCampaign = campaign;

        this._messageHandler = (e: Event) => this.onMessage(<MessageEvent>e);

        if(campaign) {
            this._templateData = {
                'localizedPrice': PurchasingUtilities.getProductPrice(campaign.getIapProductId()),
                'isRewardedPromo': placement.allowSkip()
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
                listener: (event: Event) => this.onPrivacyEvent(event),
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

        this._iframe = this._container.querySelector('iframe');

        this.getPromoMarkup().then((markup) => {
            if (markup) {
                const tpl = new Template(markup, this._localization);
                this._iframe!.setAttribute('srcdoc', tpl.render(this._templateData ? this._templateData : {}));
            }
        });
        this._GDPRPopupElement = <HTMLElement>this._container.querySelector('.gdpr-pop-up');
        this._privacyButtonElement = <HTMLElement>this._container.querySelector('.privacy-button');
    }

    public show(): void {
        super.show();
        window.addEventListener('message', this._messageHandler);
        this.choosePrivacyShown();
    }

    public hide(): void {
        super.hide();
        window.removeEventListener('message', this._messageHandler);

        if (this._privacy) {
            this._privacy.removeEventHandler(this);
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

    private choosePrivacyShown() {
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

    private onMessage(e: MessageEvent): void {
        const data: any = e.data;
        switch (data.type) {
            case 'close':
                this.onCloseEvent(e);
                break;
            case 'promo':
                this.onPromoEvent(e);
                break;
            default:
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

    private onPrivacyEvent(event: Event) {
        event.preventDefault();

        if (this._showGDPRBanner) {
            this._gdprPopupClicked = true;
            this.choosePrivacyShown();
        }

        this._privacy.show();
    }

    private getPromoMarkup(): Promise<string> {
        return this.getStaticMarkup().then((markup) => {
            return this.replaceDynamicMarkupPlaceholder(markup);
        }).catch((e) => {
            this._nativeBridge.Sdk.logError('failed to get promo markup: ' + e);
            return '';
        });
    }

    private getStaticMarkup(): Promise<string> {
        const resourceUrl = this._promoCampaign.getCreativeResource();
        if(resourceUrl) {
            if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
                return XHRequest.get(resourceUrl.getUrl());
            } else {
                const fileId = resourceUrl.getFileId();
                if (fileId) {
                    return this._nativeBridge.Cache.getFileContent(fileId, 'UTF-8');
                } else {
                    return XHRequest.get(resourceUrl.getOriginalUrl());
                }
            }
        }
        return Promise.reject(new Error('No creative resource found for campaign'));
    }

    private replaceDynamicMarkupPlaceholder(markup: string): string {
        const dynamicMarkup = this._promoCampaign.getDynamicMarkup();
        return dynamicMarkup ? markup.replace('{UNITY_DYNAMIC_MARKUP}', dynamicMarkup) : markup;
    }
}
