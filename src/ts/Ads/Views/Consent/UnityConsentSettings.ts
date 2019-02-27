import { View } from 'Core/Views/View';
import GDPRConsentSettingsTemplate from 'html/consent/gdpr-consent-settings.html';
import { Template } from 'Core/Utilities/Template';
import { PrivacyRowItemContainer,
    IPrivacyRowItemContainerHandler,
    PrivacyTextParagraph } from 'Ads/Views/Consent/PrivacyRowItemContainer';
import { Platform } from 'Core/Constants/Platform';
import { GDPREventSource, UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { IGranularPermissions, IPermissions } from 'Ads/Models/Privacy';
import { ButtonSpinner } from 'Ads/Views/Consent/ButtonSpinner';
import {
    IPersonalizationCheckboxGroupHandler,
    PersonalizationCheckboxGroup
} from 'Ads/Views/Consent/PersonalizationCheckboxGroup';
import { IConsentViewHandler } from 'Ads/Views/Consent/IConsentViewHandler';

export class UnityConsentSettings extends View<IConsentViewHandler> implements IPrivacyRowItemContainerHandler, IPersonalizationCheckboxGroupHandler {

    private _infoContainer: PrivacyRowItemContainer;
    private _checkboxGroup: PersonalizationCheckboxGroup;
    private _acceptAllButton: HTMLElement;
    private _saveMyChoicesButton: HTMLElement;

    constructor(platform: Platform, userPrivacyManager: UserPrivacyManager) {
        super(platform, 'gdpr-consent-settings', false);

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

        this._infoContainer = new PrivacyRowItemContainer(platform, userPrivacyManager, true);
        this._infoContainer.addEventHandler(this);
        this._checkboxGroup = new PersonalizationCheckboxGroup(platform, userPrivacyManager);
        this._checkboxGroup.addEventHandler(this);
    }

    public render(): void {
        super.render();

        this._infoContainer.render();
        (<HTMLElement>this._container.querySelector('.info-container')).appendChild(this._infoContainer.container());

        this._checkboxGroup.render();
        (<HTMLElement>this._container.querySelector('.checkbox-group-container')).appendChild(this._checkboxGroup.container());

        this._acceptAllButton = <HTMLElement>this._container.querySelector('.accept-all');
        this._saveMyChoicesButton = <HTMLElement>this._container.querySelector('.save-my-choices');
    }

    public show(): void {
        super.show();

        this._checkboxGroup.show();

        this.setConsentButtons();
    }

    public showParagraph(paragraph: PrivacyTextParagraph): void {
        this.show();
        this._checkboxGroup.show();
        this._infoContainer.showParagraphAndScrollToSection(paragraph);
    }

    public onPrivacy(url: string): void {
        this._handlers.forEach(handler => handler.onPrivacy(url));
    }

    public onCheckboxGroupSelectionChange(): void {
        this.setConsentButtons();
    }

    public testAutoConsent(consent: IPermissions): void {
        this.triggerOnPersonalizedConsent(consent);
        this._handlers.forEach(handler => handler.onClose());
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

        this.closeWithAnimation(this._acceptAllButton);

    }

    private onSaveMyChoicesEvent(event: Event) {
        event.preventDefault();

        const personalizedConsent: IGranularPermissions = {
            gameExp: this._checkboxGroup.isPersonalizedExperienceChecked(),
            ads: this._checkboxGroup.isPersonalizedAdsChecked(),
            external: this._checkboxGroup.isAds3rdPartyChecked()
        };

        this.triggerOnPersonalizedConsent(personalizedConsent);
        this.closeWithAnimation(this._saveMyChoicesButton);

    }

    private setConsentButtons() {
        if (this.shouldHighlightSaveMyChoices()) {
            this._acceptAllButton.classList.remove('blue');
            this._acceptAllButton.classList.add('white');

            this._saveMyChoicesButton.classList.remove('white');
            this._saveMyChoicesButton.classList.add('blue');
        } else {
            this._acceptAllButton.classList.remove('white');
            this._acceptAllButton.classList.add('blue');

            this._saveMyChoicesButton.classList.remove('blue');
            this._saveMyChoicesButton.classList.add('white');
        }
    }

    private shouldHighlightSaveMyChoices() {
        return this._checkboxGroup.isPersonalizedExperienceChecked() ||
            this._checkboxGroup.isPersonalizedAdsChecked() ||
            this._checkboxGroup.isAds3rdPartyChecked();
    }

    private closeWithAnimation(buttonElement: HTMLElement): void {
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

    private triggerOnPersonalizedConsent(consent: IPermissions) {
        this._handlers.forEach(handler => handler.onConsent(consent, GDPREventSource.USER));
    }
}
