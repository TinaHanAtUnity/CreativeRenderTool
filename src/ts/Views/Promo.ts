import PromoTpl from 'html/Promo.html';

import { NativeBridge } from 'Native/NativeBridge';
import { View } from 'Views/View';
import { Template } from 'Utilities/Template';
import { Observable0, Observable1 } from 'Utilities/Observable';
import { Localization } from 'Utilities/Localization';
import { PromoCampaign } from 'Models/Campaigns/PromoCampaign';
import { PurchasingUtilities } from 'Utilities/PurchasingUtilities';

export class Promo extends View<{}> {

    public readonly onPromo = new Observable1<string>();
    public readonly onClose = new Observable0();

    private _promoCampaign: PromoCampaign;
    private _localization: Localization;
    private _iframe: HTMLIFrameElement | null;
    private _messageHandler: (e: Event) => void;

    constructor(nativeBridge: NativeBridge, campaign: PromoCampaign, language: string) {
        super(nativeBridge, 'promo');
        this._localization = new Localization(language, 'promo');

        this._template = new Template(PromoTpl);
        this._promoCampaign = campaign;

        this._messageHandler = (e: Event) => this.onMessage(<MessageEvent>e);

        if(campaign) {
            this._templateData = {
                'localizedPrice': PurchasingUtilities.getProductPrice(campaign.getIapProductId())
            };
        }

        this._bindings = [];
    }

    public render() {
        super.render();

        this._iframe = this._container.querySelector('iframe');

        this.getPromoMarkup().then((markup) => {
            const tpl = new Template(markup, this._localization);
            this._iframe!.setAttribute('srcdoc', tpl.render(this._templateData ? this._templateData : {}));
        });
    }

    public show(): void {
        super.show();
        window.addEventListener('message', this._messageHandler);
    }

    public hide(): void {
        super.hide();
        window.removeEventListener('message', this._messageHandler);
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
