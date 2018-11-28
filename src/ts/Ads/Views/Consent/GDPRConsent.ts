import { View } from 'Core/Views/View';
import GDPRConsentTemplate from 'html/consent/gdpr-consent.html';
import { Template } from 'Core/Utilities/Template';
import { GDPRConsentSettings } from 'Ads/Views/Consent/GDPRConsentSettings';
import { Platform } from 'Core/Constants/Platform';
import { GdprManager } from 'Ads/Managers/GdprManager';
import { IGDPRConsentSettingsHandler } from 'Ads/Views/Consent/GDPRConsentSettings';
import { IConsent } from 'Ads/Views/Consent/IConsent';

export interface IGDPRConsentViewParameters {
    platform: Platform;
    gdprManager: GdprManager;
}

export interface IGDPRConsentHandler {
    onConsent(consent: IConsent): void;
}

export class GDPRConsent extends View<IGDPRConsentHandler> implements IGDPRConsentSettingsHandler {
    private _parameters: IGDPRConsentViewParameters;
    private _consentSettingsView: GDPRConsentSettings;
    private _doneCallback: () => void;

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
            this._consentSettingsView.removeEventHandler(this);
            this._consentSettingsView.hide();
            document.body.removeChild(this._consentSettingsView.container());
            delete this._consentSettingsView;
        }

    }

    // TODO: I feel this could be done neater
    public setDoneCallback(callback: () => void): void {
        this._doneCallback = callback;
    }

    private onAgreeEvent(event: Event) {
        event.preventDefault();
        this._handlers.forEach(handler => handler.onConsent({ all: true, ads: false, gameExp: false, external: false }));
        this.hide();
        this._doneCallback();
    }

    private onOptionsEvent(event: Event) {
        event.preventDefault();

        if (!this._consentSettingsView) {
            this._consentSettingsView = new GDPRConsentSettings(this._platform, this._parameters.gdprManager);
            this._consentSettingsView.addEventHandler(this);
            this._consentSettingsView.render();

            document.body.appendChild(this._consentSettingsView.container());
        }

        this._consentSettingsView.show();
    }

    // IGDPRConsentSettingsHandler
    public onConset(consent: IConsent): void {
        this._handlers.forEach(handler => handler.onConsent(consent));

        // todo: could make sense to create a controller class for showing and hiding GDPRConsent and GDPRConsentSettings views
        this.hide();
        this._doneCallback();
    }
}
