import PromoTemplate from 'html/Promo.html';

import { NativeBridge } from 'Native/NativeBridge';
import { View } from 'Views/View';
import { Template } from 'Utilities/Template';
import { Observable0, Observable1 } from 'Utilities/Observable';
import { Localization } from 'Utilities/Localization';
import { PromoCampaign } from 'Models/PromoCampaign';

export class Promo extends View {

    public readonly onPromo = new Observable1<string>();
    public readonly onClose = new Observable0();

    private _promoCampaign: PromoCampaign;
    private _localization: Localization;

    constructor(nativeBridge: NativeBridge, campaign: PromoCampaign, language: string) {
        super(nativeBridge, 'promo');
        this._localization = new Localization(language, 'promo');

        this._template = new Template(PromoTemplate, this._localization);
        this._promoCampaign = campaign;

        if(campaign) {
            this._templateData = {
                'landscapeImage': campaign.getLandscape().getUrl(),
                'portraitImage': campaign.getPortrait().getUrl(),
                'buttonImage': campaign.getButton().getUrl()
            };
        }

        this._bindings = [
            {
                event: 'click',
                listener: (event: Event) => this.onPromoEvent(event),
                selector: '.btn-promo'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onCloseEvent(event),
                selector: '.btn-close'
            }
        ];
    }

    public show(): void {
        super.show();
    }

    private onPromoEvent(event: Event): void {
        event.preventDefault();
        this.onPromo.trigger(this._promoCampaign.getIapProductId());
    }

    private onCloseEvent(event: Event): void {
        event.preventDefault();
        this.onClose.trigger();
    }
}
