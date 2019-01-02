import { View } from 'Core/Views/View';
import { Template } from 'Core/Utilities/Template';
import { UnityConsentSettings } from 'Ads/Views/Consent/UnityConsentSettings';
import { Platform } from 'Core/Constants/Platform';
import { GDPREventSource, UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { IPermissions } from 'Ads/Models/Privacy';
import { ButtonSpinner } from 'Ads/Views/Consent/ButtonSpinner';
import { IConsentViewHandler } from 'Ads/Views/Consent/IConsentViewHandler';
import GDPRConsentTemplate from 'html/consent/gdpr-consent.html';
import { PrivacyTextParagraph } from 'Ads/Views/Consent/PrivacyRowItemContainer';

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
            },
            {
                event: 'click',
                listener: (event: Event) => this.onThirdPartiesLinkEvent(event),
                selector: '.third-parties-link'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onDataLinkEvent(event),
                selector: '.data-link'
            },            {
                event: 'click',
                listener: (event: Event) => this.onDemographicInfoLinkEvent(event),
                selector: '.demographic-link'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onMobileIdentifiersLinkEvent(event),
                selector: '.mobile-identifiers-link'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onPersonalizationLink(event),
                selector: '.personalization-link'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onMeasurementLinkEvent(event),
                selector: '.measurement-link'
            }
        ];
    }

    public testAutoConsent() {
        event = new Event('testAutoConsent');
        this.onAgreeEvent(event);
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

    private onThirdPartiesLinkEvent(event: Event): void {
        event.preventDefault();
        this._consentSettingsView.showParagraph(PrivacyTextParagraph.THIRD_PARTIES);
    }

    private onDataLinkEvent(event: Event): void {
        event.preventDefault();
        this._consentSettingsView.showParagraph(PrivacyTextParagraph.DATA);
    }

    private onDemographicInfoLinkEvent(event: Event): void {
        event.preventDefault();
        this._consentSettingsView.showParagraph(PrivacyTextParagraph.DEMOGRAPHIC_INFO);
    }

    private onMobileIdentifiersLinkEvent(event: Event): void {
        event.preventDefault();
        this._consentSettingsView.showParagraph(PrivacyTextParagraph.MOBILE_IDENTIFIERS);
    }

    private onPersonalizationLink(event: Event): void {
        event.preventDefault();
        this._consentSettingsView.showParagraph(PrivacyTextParagraph.PERSONALIZATION);
    }

    private onMeasurementLinkEvent(event: Event): void {
        event.preventDefault();
        this._consentSettingsView.showParagraph(PrivacyTextParagraph.MEASUREMENT);
    }
}
