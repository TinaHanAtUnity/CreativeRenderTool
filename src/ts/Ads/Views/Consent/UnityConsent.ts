import { View } from 'Core/Views/View';
import { Template } from 'Core/Utilities/Template';
import { UnityConsentSettings } from 'Ads/Views/Consent/UnityConsentSettings';
import { Platform } from 'Core/Constants/Platform';
import { GDPREventSource, UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { IPermissions } from 'Ads/Models/Privacy';
import { ButtonSpinner } from 'Ads/Views/Consent/ButtonSpinner';
import { IConsentViewHandler } from 'Ads/Views/Consent/IConsentViewHandler';
import GDPRConsentTemplate from 'html/consent/gdpr-consent.html';

export interface IUnityConsentViewParameters {
    platform: Platform;
    privacyManager: UserPrivacyManager;
    consentSettingsView: UnityConsentSettings;
}

export class UnityConsent extends View<IConsentViewHandler> {
    private _privacyManager: UserPrivacyManager;
    private _consentSettingsView: UnityConsentSettings;

    constructor(parameters: IUnityConsentViewParameters) {
        super(parameters.platform, 'gdpr-consent');

        this._privacyManager = parameters.privacyManager;
        this._consentSettingsView = parameters.consentSettingsView;

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
            this._handlers.forEach(h => h.onClose());
        }, 1500);
    }

    private onOptionsEvent(event: Event) {
        event.preventDefault();

        this._consentSettingsView.show();
    }
}
