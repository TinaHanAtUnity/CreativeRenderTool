import { View } from 'Core/Views/View';
import GDPRConsentSettingsTemplate from 'html/consent/gdpr-consent-settings.html';
import { Template } from 'Core/Utilities/Template';
import { PrivacyRowItemContainer, IPrivacyRowItemContainerHandler } from 'Ads/Views/Consent/PrivacyRowItemContainer';
import { Platform } from 'Core/Constants/Platform';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { IPersonalizedConsent } from 'Ads/Models/Privacy';
import { ButtonSpinner } from 'Ads/Views/Consent/ButtonSpinner';
import { PersonalizationCheckboxGroup } from 'Ads/Views/Consent/PersonalizationCheckboxGroup';

export interface IGDPRConsentSettingsHandler {
    onPersonalizedConsent(consent: IPersonalizedConsent): void;
    onClose(): void;
}

export class GDPRConsentSettings extends View<IGDPRConsentSettingsHandler> implements IPrivacyRowItemContainerHandler {

    private _infoContainer: PrivacyRowItemContainer;
    private _checkboxGroup: PersonalizationCheckboxGroup;

    constructor(platform: Platform, gdprManager: UserPrivacyManager) {
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
        this._infoContainer.addEventHandler(this);
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

    // IPrivacyRowItemContainerHandler
    public onDataDeletion(): void {
        // todo: set all checkboxes to unchecked?
        this._checkboxGroup.checkCheckboxes(false);
    }

    private onBackButtonEvent(event: Event): void {
        event.preventDefault();

        this.hide();
    }

    private onAcceptAllEvent(event: Event): void {
        event.preventDefault();

        this._checkboxGroup.checkCheckboxes(true);

        const consent: IPersonalizedConsent = {
                gameExp: true,
                ads: true,
                external: true
        };

        this._handlers.forEach(handler => handler.onPersonalizedConsent(consent));

        this.runAnimation(<HTMLElement>this._container.querySelector('.accept-all'));

    }

    private onSaveMyChoicesEvent(event: Event) {
        event.preventDefault();

        const personalizedConsent: IPersonalizedConsent = {
            gameExp: this._checkboxGroup.isPersonalizedExperienceChecked(),
            ads: this._checkboxGroup.isPersonalizedAdsChecked(),
            external: this._checkboxGroup.isAds3rdPartyChecked()
        };

        this._handlers.forEach(handler => handler.onPersonalizedConsent(personalizedConsent));
        this.runAnimation(<HTMLElement>this._container.querySelector('.save-my-choices'));

    }

    private runAnimation(buttonElement: HTMLElement): void {
        this.container().classList.add('prevent-clicks');

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
