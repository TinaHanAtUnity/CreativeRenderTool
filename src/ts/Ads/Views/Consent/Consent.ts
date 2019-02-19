import { View } from 'Core/Views/View';
import { Template } from 'Core/Utilities/Template';
import { UnityConsentSettings } from 'Ads/Views/Consent/UnityConsentSettings';
import { Platform } from 'Core/Constants/Platform';
import { GDPREventSource, UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { IPermissions } from 'Ads/Models/Privacy';
import { ButtonSpinner } from 'Ads/Views/Consent/ButtonSpinner';
import { IConsentViewHandler } from 'Ads/Views/Consent/IConsentViewHandler';
import ConsentTemplate from 'html/consent/Consent.html';
import {
    IPersonalizationSwitchGroupHandler,
    PersonalizationSwitchGroup
} from 'Ads/Views/Consent/PersonalizationSwitchGroup';
import { PrivacyRowItemContainer } from 'Ads/Views/Consent/PrivacyRowItemContainer';

export interface IUnityConsentViewParameters {
    platform: Platform;
    privacyManager: UserPrivacyManager;
    consentSettingsView: UnityConsentSettings;
}

export class Consent extends View<IConsentViewHandler> implements IPersonalizationSwitchGroupHandler {

    private _privacyManager: UserPrivacyManager;
    private _switchGroup: PersonalizationSwitchGroup;
    private _privacyRowItemContainer: PrivacyRowItemContainer;
    private _consentButtonContainer: HTMLElement;

    constructor(parameters: IUnityConsentViewParameters) {
        super(parameters.platform, 'consent');

        this._privacyManager = parameters.privacyManager;

        this._template = new Template(ConsentTemplate);

        this._bindings = [
            {
                event: 'click',
                listener: (event: Event) => this.onContinueEvent(event),
                selector: '.continue-button'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onAgreeEvent(event),
                selector: '.agree'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onDisagreeEvent(event),
                selector: '.disagree'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onSaveMyChoicesEvent(event),
                selector: '.save-my-choices'
            }
        ];

        this._switchGroup = new PersonalizationSwitchGroup(parameters.platform, parameters.privacyManager);
        this._switchGroup.addEventHandler(this);
        this._privacyRowItemContainer = new PrivacyRowItemContainer(parameters.platform, parameters.privacyManager);
    }

    // public testAutoConsent(consent: IPermissions): void {
    //     this.triggerOnPersonalizedConsent(consent);
    //     this._handlers.forEach(handler => handler.onClose());
    // }

    public render(): void {
        super.render();

        this._switchGroup.render();
        (<HTMLElement>this._container.querySelector('.switch-group-container')).appendChild(this._switchGroup.container());

        this._privacyRowItemContainer.render();
        (<HTMLElement>this._container.querySelector('.privacy-container')).appendChild(this._privacyRowItemContainer.container());

        this._consentButtonContainer = (<HTMLElement>this._container.querySelector('.consent-button-container'));

        this.container().classList.add('intro');
    }

    public show(): void {
        super.show();
        this._switchGroup.show();
    }

    public onSwitchGroupSelectionChange(): void {
        if (this._consentButtonContainer && !this._consentButtonContainer.classList.contains('hide-agree-and-no-thanks-buttons')) {
            this._consentButtonContainer.classList.add('hide-agree-and-no-thanks-buttons');
            ['webkitTransitionEnd', 'transitionend'].forEach((e) => {
                const transitionEndCallback = (evt: Event) => {
                    this._consentButtonContainer.classList.add('show-save-my-choices-button');
                    this._consentButtonContainer.removeEventListener(e, transitionEndCallback);
                };
                this._consentButtonContainer.addEventListener(e, transitionEndCallback);
            });
        } else {
            this._consentButtonContainer.classList.remove('hide-agree-and-no-thanks-buttons');
        }
    }

    private onContinueEvent(event: Event) {
        event.preventDefault();

        this.container().classList.remove('intro');
    }

    private onAgreeEvent(event: Event) {
        event.preventDefault();

        this._switchGroup.checkCheckboxes(true);

        const permissions: IPermissions = {
            gameExp: true,
            ads: true,
            external: true
        };
        this._handlers.forEach(handler => handler.onConsent(permissions, GDPREventSource.NO_REVIEW));
        const element = (<HTMLElement>this._container.querySelector('.agree'));
        this.closeWithAnimation(element);
    }

    private onDisagreeEvent(event: Event) {
        event.preventDefault();

        const permissions: IPermissions = {
            gameExp: false,
            ads: false,
            external: false
        };
        this._handlers.forEach(handler => handler.onConsent(permissions, GDPREventSource.NO_REVIEW));
        const element = (<HTMLElement>this._container.querySelector('.disagree'));

        this.closeWithAnimation(element);
    }

    private onSaveMyChoicesEvent(event: Event) {
        event.preventDefault();

        const permissions: IPermissions = {
            gameExp: this._switchGroup.isPersonalizedExperienceChecked(),
            ads: this._switchGroup.isPersonalizedAdsChecked(),
            external: this._switchGroup.isAds3rdPartyChecked()
        };
        this._handlers.forEach(handler => handler.onConsent(permissions, GDPREventSource.NO_REVIEW));
        const element = (<HTMLElement>this._container.querySelector('.save-my-choices'));
        this.closeWithAnimation(element);
    }

    private closeWithAnimation(buttonElement: HTMLElement): void {
        this.container().classList.add('prevent-clicks');

        const buttonSpinner = new ButtonSpinner(this._platform);
        buttonSpinner.render();
        buttonElement.appendChild(buttonSpinner.container());
        buttonElement.classList.add('click-animation');

        setTimeout(() => {
            this._handlers.forEach(h => h.onClose());
        }, 1500);
    }
}
