import { View } from 'Core/Views/View';
import GDPRConsentSettingsTemplate from 'html/consent/gdpr-consent-settings.html';
import { Template } from 'Core/Utilities/Template';
import { PrivacyRowItemContainer, IPrivacyRowItemContainerHandler } from 'Ads/Views/Consent/PrivacyRowItemContainer';
import { Platform } from 'Core/Constants/Platform';
import { GDPREventSource, UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { IGranularPermissions } from 'Ads/Models/Privacy';
import { ButtonSpinner } from 'Ads/Views/Consent/ButtonSpinner';
import { PersonalizationCheckboxGroup } from 'Ads/Views/Consent/PersonalizationCheckboxGroup';
import { IConsentViewHandler } from 'Ads/Views/Consent/IConsentViewHandler';

export class UnityConsentSettings extends View<IConsentViewHandler> implements IPrivacyRowItemContainerHandler {

    private _infoContainer: PrivacyRowItemContainer;
    private _checkboxGroup: PersonalizationCheckboxGroup;

    constructor(platform: Platform, userPrivacyManager: UserPrivacyManager) {
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

        this._infoContainer = new PrivacyRowItemContainer(platform, userPrivacyManager);
        this._infoContainer.addEventHandler(this);
        this._checkboxGroup = new PersonalizationCheckboxGroup(platform, userPrivacyManager);
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

    // IPrivacyRowItemContainerHandler
    public onPrivacy(url: string): void {
        this._handlers.forEach(handler => handler.onPrivacy(url));
    }

    private onBackButtonEvent(event: Event): void {
        event.preventDefault();

        this.hide();
    }

    private onAcceptAllEvent(event: Event): void {
        event.preventDefault();

        this._checkboxGroup.checkCheckboxes(true);

        const consent: IGranularPermissions = {
                gameExp: true,
                ads: true,
                external: true
        };

        this._handlers.forEach(handler => handler.onConsent(consent, GDPREventSource.USER));

        this.runAnimation(<HTMLElement>this._container.querySelector('.accept-all'));

    }

    private onSaveMyChoicesEvent(event: Event) {
        event.preventDefault();

        const personalizedConsent: IGranularPermissions = {
            gameExp: this._checkboxGroup.isPersonalizedExperienceChecked(),
            ads: this._checkboxGroup.isPersonalizedAdsChecked(),
            external: this._checkboxGroup.isAds3rdPartyChecked()
        };

        this._handlers.forEach(handler => handler.onConsent(personalizedConsent, GDPREventSource.USER));
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
