import { View } from 'Core/Views/View';
import GDPRConsentTemplate from 'html/consent/gdpr-consent.html';
import { Template } from 'Core/Utilities/Template';
import { GDPRConsentSettings, IGDPRConsentSettingsHandler } from 'Ads/Views/Consent/GDPRConsentSettings';
import { Platform } from 'Core/Constants/Platform';
import { GDPREventSource, UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { IPermissions } from 'Ads/Models/Privacy';
import { ButtonSpinner } from 'Ads/Views/Consent/ButtonSpinner';

export interface IGDPRConsentViewParameters {
    platform: Platform;
    privacyManager: UserPrivacyManager;
}

export interface IGDPRConsentHandler {
    onConsent(consent: IPermissions, source: GDPREventSource): void;
    onConsentHide(): void;
    onPrivacy(url: string): void;
}

export class GDPRConsent extends View<IGDPRConsentHandler> implements IGDPRConsentSettingsHandler {
    private _privacyManager: UserPrivacyManager;
    private _consentSettingsView: GDPRConsentSettings;

    constructor(parameters: IGDPRConsentViewParameters) {
        super(parameters.platform, 'gdpr-consent');

        this._privacyManager = parameters.privacyManager;
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
        this._handlers.forEach(handler => handler.onConsent(permissions, GDPREventSource.NO_REVIEW));
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
            this._consentSettingsView = new GDPRConsentSettings(this._platform, this._privacyManager);
            this._consentSettingsView.addEventHandler(this);
            this._consentSettingsView.render();

            document.body.appendChild(this._consentSettingsView.container());
        }

        this._consentSettingsView.show();
    }

    // IGDPRConsentSettingsHandler
    public onPersonalizedConsent(permissions: IPermissions): void {
        this._handlers.forEach(handler => handler.onConsent(permissions, GDPREventSource.USER));
    }

    // IGDPRConsentSettingsHandler
    public onClose(): void {
        this.hide();
    }

    // IGDPRConsentSettingsHandler
    public onPrivacy(url: string): void {
        this._handlers.forEach(handler => handler.onPrivacy(url));
    }
}
