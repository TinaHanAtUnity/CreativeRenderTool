import { View } from 'Core/Views/View';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import GDPRConsentTemplate from 'html/consent/gdpr-consent.html';
import { Template } from 'Core/Utilities/Template';

export interface IGDPRConsentViewParameters {
    nativeBridge: NativeBridge;
}

export interface IConsentSettings {
    personalized: boolean;
}

export interface IGDPRConsentSettingsHandler {
    onConsent(): void;
    onConsetSettings(consent: IConsentSettings): void;
}

export class GDPRConsentSettings extends View<IGDPRConsentSettingsHandler> {

    constructor(parameters: IGDPRConsentViewParameters) {
        super(parameters.nativeBridge, 'gdpr-consent-settings');

        this._template = new Template(GDPRConsentTemplate);

        this._bindings = [];
    }
}
