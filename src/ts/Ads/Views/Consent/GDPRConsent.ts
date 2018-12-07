import { View } from 'Core/Views/View';
import GDPRConsentTemplate from 'html/consent/gdpr-consent.html';
import { Template } from 'Core/Utilities/Template';
import { GDPRConsentSettings, IGDPRConsentSettingsHandler } from 'Ads/Views/Consent/GDPRConsentSettings';
import { Platform } from 'Core/Constants/Platform';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { IPermissions, IPersonalizedConsent } from 'Ads/Views/Consent/IPermissions';
import { ButtonSpinner } from 'Ads/Views/Consent/ButtonSpinner';

export interface IGDPRConsentViewParameters {
    platform: Platform;
    gdprManager: UserPrivacyManager;
}

export interface IGDPRConsentHandler {
    onConsent(consent: IPermissions): void;
    onConsentHide(): void;
}

export class GDPRConsent extends View<IGDPRConsentHandler> implements IGDPRConsentSettingsHandler {
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
            this._consentSettingsView.removeEventHandler(this);
            this._consentSettingsView.hide();
            document.body.removeChild(this._consentSettingsView.container());
            delete this._consentSettingsView;
        }
        this._handlers.forEach(h => h.onConsentHide());
    }

    private onAgreeEvent(event: Event) {
        event.preventDefault();

        const permissions: IPermissions = {
            all: true
        };
        this._handlers.forEach(handler => handler.onConsent(permissions));
        this.runAnimation();
    }

    private runAnimation(): void {
        this.container().classList.add('prevent-clicks');

        const buttonSPinner = new ButtonSpinner(this._platform);
        buttonSPinner.render();
        const agreeButton = <HTMLElement>this._container.querySelector('.agree');
        if (agreeButton) {
            agreeButton.appendChild(buttonSPinner.container());
            agreeButton.classList.add('click-animation');

        }
        setTimeout(() => {
            this.hide();
        }, 1500);
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
    public onPersonalizedConsent(consent: IPersonalizedConsent): void {
        const permissions: IPermissions = {
            personalizedConsent: consent
        };

        this._handlers.forEach(handler => handler.onConsent(permissions));
    }

    // IGDPRConsentSettingsHandler
    public onClose(): void {
        this.hide();
    }
}
