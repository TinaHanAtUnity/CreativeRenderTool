import { View } from 'Core/Views/View';
import GDPRConsentTemplate from 'html/consent/gdpr-consent.html';
import { Template } from 'Core/Utilities/Template';
import { GDPRConsentSettings } from 'Ads/Views/Consent/GDPRConsentSettings';
import { Platform } from 'Core/Constants/Platform';

export interface IGDPRConsentViewParameters {
    platform: Platform;
}

export interface IGDPRConsentHandler {
    onConsent(consent: boolean): void;
    onShowOptions(): void;
}

export class GDPRConsent extends View<IGDPRConsentHandler> {

    private _parameters: IGDPRConsentViewParameters;
    private _consentSettingsView: GDPRConsentSettings;

    constructor(parameters: IGDPRConsentViewParameters) {
        super(parameters.platform, 'gdpr-consent');

        this._parameters = parameters;
        this._template = new Template(GDPRConsentTemplate);

        this._bindings = [
            {
                event: 'click',
                listener: (event: Event) => this.onAgreeEvent(event),
                selector: '.agree'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onOptionsEvent(event),
                selector: '.show-options'
            }
        ];
    }

    public hide(): void {
        super.hide();

        if (this._consentSettingsView) {
            this._consentSettingsView.hide();
            document.body.removeChild(this._consentSettingsView.container());
            delete this._consentSettingsView;
        }

    }

    private onAgreeEvent(event: Event) {
        event.preventDefault();
        this._handlers.forEach(handler => handler.onConsent(true));
        this.hide();
    }

    private onOptionsEvent(event: Event) {
        event.preventDefault();

        if (!this._consentSettingsView) {
            this._consentSettingsView = new GDPRConsentSettings(this._platform);
            this._consentSettingsView.render();

            document.body.appendChild(this._consentSettingsView.container());
        }

        this._consentSettingsView.show();
    }
}
