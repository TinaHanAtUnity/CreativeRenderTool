import { View } from 'Core/Views/View';
import GDPRConsentSettingsTemplate from 'html/consent/gdpr-consent-settings.html';
import { Template } from 'Core/Utilities/Template';
import { PrivacyRowItemContainer } from 'Ads/Views/Consent/PrivacyRowItemContainer';
import { Platform } from 'Core/Constants/Platform';
import { GdprManager } from 'Ads/Managers/GdprManager';
import { IConsent } from 'Ads/Views/Consent/IConsent';
import { ButtonSpinner } from 'Ads/Views/Consent/ButtonSpinner';
import { PersonalizationCheckboxGroup } from 'Ads/Views/Consent/PersonalizationCheckboxGroup';

export interface IGDPRConsentSettingsHandler {
    onPersonalizedConsent(consent: IConsent): void;
    onClose(): void;
}

export class GDPRConsentSettings extends View<IGDPRConsentSettingsHandler> {

    private _infoContainer: PrivacyRowItemContainer;
    private _checkboxGroup: PersonalizationCheckboxGroup;

    constructor(platform: Platform, gdprManager: GdprManager) {
        super(platform, 'gdpr-consent-settings');
        this._template = new Template(GDPRConsentSettingsTemplate);

        this._bindings = [
            {
                event: 'click',
                listener: (event: Event) => this.onBackButtonEvent(event),
                selector: '.back-button'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onAcceptAllEvent(event),
                selector: '.accept-all'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onSaveMyChoicesEvent(event),
                selector: '.save-my-choices'
            }
        ];

        this._infoContainer = new PrivacyRowItemContainer({ platform: platform, gdprManager: gdprManager });
        this._checkboxGroup = new PersonalizationCheckboxGroup(platform);
    }

    public render(): void {
        super.render();

        this._infoContainer.render();
        (<HTMLElement>this._container.querySelector('.info-container')).appendChild(this._infoContainer.container());

        this._checkboxGroup.render();
        (<HTMLElement>this._container.querySelector('.checkbox-group-container')).appendChild(this._checkboxGroup.container());
    }

    public show(): void {
        super.show();

        this._checkboxGroup.show();
    }

    private onBackButtonEvent(event: Event): void {
        event.preventDefault();

        this.hide();
    }

    private onAcceptAllEvent(event: Event): void {
        event.preventDefault();

        const consent: IConsent = {
            gameExp: true,
            ads: true,
            external: true
        };

        this._handlers.forEach(handler => handler.onPersonalizedConsent(consent));

        this.runAnimation(<HTMLElement>this._container.querySelector('.accept-all'));

    }

    private onSaveMyChoicesEvent(event: Event) {
        event.preventDefault();

        const consent: IConsent = {
            gameExp: this._checkboxGroup.isPersonalizedExperienceChecked(),
            ads: this._checkboxGroup.isPersonalizedAdsChecked(),
            external: this._checkboxGroup.isAds3rdPartyChecked()
        };

        this._handlers.forEach(handler => handler.onPersonalizedConsent(consent));
        this.runAnimation(<HTMLElement>this._container.querySelector('.save-my-choices'));

    }
    private runAnimation(buttonElement: HTMLElement): void {
        const buttonSpinner = new ButtonSpinner(this._platform);
        buttonSpinner.render();
        if (buttonElement) {
            buttonElement.appendChild(buttonSpinner.container());
            buttonElement.classList.add('click-animation');

        }
        setTimeout(() => {
            this._handlers.forEach(handler => handler.onClose());
        }, 1500);
    }
}
