import { View } from 'Core/Views/View';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import GDPRConsentTemplate from 'html/consent/gdpr-consent.html';
import { Template } from 'Core/Utilities/Template';
import { PrivacyInfoContainer } from "./Consent/PrivacyInfoContainer";

export interface IGDPRConsentViewParameters {
    nativeBridge: NativeBridge;
}

export interface IGDPRConsentHandler {
    onConsent(consent: boolean): void;
    onShowOptions(): void;
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
            },
            {
                event: 'click',
                listener: (event: Event) => this.onAgreeEvent(event),
                selector: '.show-options'
            }
        ];
    }

    public render() {
        super.render();

        const testView = new PrivacyInfoContainer(this._nativeBridge);
        testView.render();
        (<HTMLElement>this._container.querySelector('.button-container')).appendChild(testView.container());
    }

    private onAgreeEvent(event: Event) {
        event.preventDefault();
        this._handlers.forEach(handler => handler.onConsent(true));
        this.hide();
    }

    private onOptionsEvent(event: Event) {
        event.preventDefault();
        this._handlers.forEach(handler => handler.onShowOptions());
        this.hide();
    }
}
