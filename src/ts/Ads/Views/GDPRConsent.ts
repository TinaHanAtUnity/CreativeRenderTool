import { View } from 'Core/Views/View';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import GDPRConsentTemplate from 'html/consent/gdpr-consent.html';
import { Template } from 'Core/Utilities/Template';

export interface IGDPRConsentViewParameters {
    nativeBridge: NativeBridge;
}

export interface IGDPRConsentHandler {
    onConsent(consent: boolean): void;
}

export class GDPRConsent extends View<IGDPRConsentHandler> {

    constructor(parameters: IGDPRConsentViewParameters) {
        super(parameters.nativeBridge, 'gdpr-consent');

        this._template = new Template(GDPRConsentTemplate);

        this._bindings = [
            {
                event: 'click',
                listener: (event: Event) => this.onAgreeEvent(event),
                selector: '.agree'
            }
        ];
    }

    private onAgreeEvent(event: Event) {
        event.preventDefault();
        this._handlers.forEach(handler => handler.onConsent(true));
        this.hide();
    }
}
