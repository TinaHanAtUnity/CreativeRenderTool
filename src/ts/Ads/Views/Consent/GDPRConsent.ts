import { View } from 'Core/Views/View';
import GDPRConsentTemplate from 'html/consent/gdpr-consent.html';
import { Template } from 'Core/Utilities/Template';
import { GDPRConsentSettings, IGDPRConsentSettingsHandler } from 'Ads/Views/Consent/GDPRConsentSettings';
import { Platform } from 'Core/Constants/Platform';
import { GdprManager } from 'Ads/Managers/GdprManager';
import { AdUnitContainerSystemMessage } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { IConsent } from 'Ads/Views/Consent/IConsent';
import { ButtonSpinner } from 'Ads/Views/Consent/ButtonSpinner';

export interface IGDPRConsentViewParameters {
    platform: Platform;
    gdprManager: GdprManager;
}

export interface IGDPRConsentHandler {
    onConsent(consent: IConsent): void;
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
        this._handlers.forEach(handler => handler.onConsent({ all: true, ads: false, gameExp: false, external: false }));
        this.hide();
       //  this.runAnimation();
    }

    private runAnimation(): void {
        const buttonSPinner = new ButtonSpinner(this._platform);
        buttonSPinner.render();
        const button = <HTMLElement>this._container.querySelector('.agree');
        if (button) {
            // button.style.display = 'none';
            // button.appendChild(buttonSPinner.container());
        }
        const buttonContainer = <HTMLElement>this._container.querySelector('.button-container');
        if (buttonContainer) {
            // buttonContainer.appendChild(buttonSPinner.container());
            buttonContainer.replaceChild(buttonSPinner.container(), button);

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
    // todo: rename method
    public onConset(consent: IConsent): void {
        this._handlers.forEach(handler => handler.onConsent(consent));

        this.hide();
    }
}
