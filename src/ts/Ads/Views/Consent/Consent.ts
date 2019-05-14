import { View } from 'Core/Views/View';
import { Template } from 'Core/Utilities/Template';
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
import {
    IPrivacyRowItemContainerHandler,
    PrivacyRowItemContainer,
    PrivacyTextParagraph
} from 'Ads/Views/Consent/PrivacyRowItemContainer';
import { ProgrammaticTrackingService, ProgrammaticTrackingMetricName } from 'Ads/Utilities/ProgrammaticTrackingService';
import { Localization } from 'Core/Utilities/Localization';

export interface IConsentViewParameters {
    platform: Platform;
    privacyManager: UserPrivacyManager;
    landingPage: ConsentPage;
    language: string;
    apiLevel?: number;
    osVersion?: string;
    pts: ProgrammaticTrackingService;
    ctaABTest: boolean;
}

export enum ConsentPage {
    HOMESCREEN = 'homescreen',
    MY_CHOICES = 'mychoices',
    HOMEPAGE = 'homepage'
}

export class Consent extends View<IConsentViewHandler> implements IPrivacyRowItemContainerHandler, IPersonalizationSwitchGroupHandler {

    private _apiLevel?: number;
    private _osVersion?: string;

    private _privacyManager: UserPrivacyManager;
    private _switchGroup: PersonalizationSwitchGroup;
    private _privacyRowItemContainer: PrivacyRowItemContainer;
    private _consentButtonContainer: HTMLElement;
    private _pts: ProgrammaticTrackingService;

    private _landingPage: ConsentPage;
    private _currentPage: ConsentPage;

    private _isCtaAbTest: boolean;

    constructor(parameters: IConsentViewParameters) {
        super(parameters.platform, 'consent');

        this._landingPage = parameters.landingPage;
        this._apiLevel = parameters.apiLevel;
        this._osVersion = parameters.osVersion;
        this._pts = parameters.pts;
        this._privacyManager = parameters.privacyManager;

        this._isCtaAbTest = parameters.ctaABTest;

        this._template = new Template(ConsentTemplate, new Localization(parameters.language, 'consent'));
        this._templateData = {
            myChoicesDisagreeCtaTest: parameters.ctaABTest
        };

        this._bindings = [
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
            },
            {
                event: 'click',
                listener: (event: Event) => this.onAcceptAllEvent(event),
                selector: '.accept-all'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onOptionsEvent(event),
                selector: '.show-choices'
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
            },
            {
                event: 'click',
                listener: (event: Event) => this.onBackButtonEvent(event),
                selector: '.back-button'
            }
        ];

        this._switchGroup = new PersonalizationSwitchGroup(parameters.platform, parameters.privacyManager, parameters.language);
        this._switchGroup.addEventHandler(this);
        this._privacyRowItemContainer = new PrivacyRowItemContainer(parameters.platform, parameters.privacyManager, parameters.language, true);
        this._privacyRowItemContainer.addEventHandler(this);
    }

    public testAutoConsentAll() {
        const testEvent = new Event('testAutoConsent');
        this.onAcceptAllEvent(testEvent);
    }

    public testAutoConsent(consent: IPermissions): void {
        this._handlers.forEach(handler => handler.onConsent(consent, GDPREventSource.USER));
        this._handlers.forEach(handler => handler.onClose());
    }

    public render(): void {
        super.render();

        this._switchGroup.render();
        (<HTMLElement>this._container.querySelector('.switch-group-container')).appendChild(this._switchGroup.container());

        this._privacyRowItemContainer.render();
        (<HTMLElement>this._container.querySelector('.privacy-container')).appendChild(this._privacyRowItemContainer.container());

        this._consentButtonContainer = (<HTMLElement>this._container.querySelector('.consent-button-container'));

        // Android <= 4.4.4
        if (this._platform === Platform.ANDROID && this._apiLevel && this._apiLevel <= 19) {
            this._container.classList.add('android4-ios7-ios8');
        } else if (this._platform === Platform.IOS && this._osVersion) {
            if (this._osVersion.match(/^8/) || this._osVersion.match(/^7/)) {
                this._container.classList.add('android4-ios7-ios8');
            }
        }

        if (this._landingPage === ConsentPage.HOMESCREEN || this._landingPage === ConsentPage.HOMEPAGE) {
            const myChoicesElement = (<HTMLElement>this._container.querySelector('#consent-my-choices'));
            myChoicesElement.classList.add('show-back-button');
        }

        this.showPage(this._landingPage);
    }

    public show(): void {
        super.show();
        this._switchGroup.show();
    }

    public onSwitchGroupSelectionChange(): void {
        if (this._consentButtonContainer) {
            if (this.shouldShowSaveMyChoices()) {
                this._consentButtonContainer.classList.add('show-save-my-choices-button');
            } else {
                this._consentButtonContainer.classList.remove('show-save-my-choices-button');
            }
        }
    }

    public onPrivacy(url: string): void {
        this._handlers.forEach(handler => handler.onPrivacy(url));
    }

    private shouldShowSaveMyChoices() {
        return this._switchGroup.isPersonalizedExperienceChecked() ||
            this._switchGroup.isPersonalizedAdsChecked() ||
            this._switchGroup.isAds3rdPartyChecked();
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

    private showPage(page: ConsentPage) {
        this._currentPage = page;

        const states = [ConsentPage.HOMESCREEN, ConsentPage.MY_CHOICES, ConsentPage.HOMEPAGE];
        states.forEach(state => {
            if (state === page) {
                this.container().classList.add(page);
            } else {
                this.container().classList.remove(state);
            }
        });
    }

    private onAcceptAllEvent(event: Event) {
        event.preventDefault();

        const permissions: IPermissions = {
            all: true
        };
        this._handlers.forEach(handler => handler.onConsent(permissions, GDPREventSource.NO_REVIEW));
        const element = (<HTMLElement>this._container.querySelector('.accept-all'));
        this.closeWithAnimation(element);
    }

    private onAgreeEvent(event: Event) {
        event.preventDefault();

        this._switchGroup.checkCheckboxes(true);

        const permissions: IPermissions = {
            gameExp: true,
            ads: true,
            external: true
        };
        this._handlers.forEach(handler => handler.onConsent(permissions, GDPREventSource.USER));
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
        this._handlers.forEach(handler => handler.onConsent(permissions, GDPREventSource.USER));
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
        this._handlers.forEach(handler => handler.onConsent(permissions, GDPREventSource.USER));
        const element = (<HTMLElement>this._container.querySelector('.save-my-choices'));
        this.closeWithAnimation(element);
    }

    private onOptionsEvent(event: Event) {
        event.preventDefault();

        this.showPage(ConsentPage.MY_CHOICES);
    }

    private onThirdPartiesLinkEvent(event: Event): void {
        event.preventDefault();
        this.showMyChoicesPageAndScrollToParagraph(PrivacyTextParagraph.THIRD_PARTIES);
    }

    private onDataLinkEvent(event: Event): void {
        event.preventDefault();
        this.showMyChoicesPageAndScrollToParagraph(PrivacyTextParagraph.DATA);
    }

    private onDemographicInfoLinkEvent(event: Event): void {
        event.preventDefault();
        this.showMyChoicesPageAndScrollToParagraph(PrivacyTextParagraph.DEMOGRAPHIC_INFO);
    }

    private onMobileIdentifiersLinkEvent(event: Event): void {
        event.preventDefault();
        this.showMyChoicesPageAndScrollToParagraph(PrivacyTextParagraph.MOBILE_IDENTIFIERS);
    }

    private onPersonalizationLink(event: Event): void {
        event.preventDefault();
        this.showMyChoicesPageAndScrollToParagraph(PrivacyTextParagraph.PERSONALIZATION);
    }

    private onMeasurementLinkEvent(event: Event): void {
        event.preventDefault();
        this.showMyChoicesPageAndScrollToParagraph(PrivacyTextParagraph.MEASUREMENT);
    }

    private onBackButtonEvent(event: Event): void {
        event.preventDefault();
        this.showPage(this._landingPage);
    }

    private showMyChoicesPageAndScrollToParagraph(paragraph: PrivacyTextParagraph): void {
        // To get a rough estimate how often users click links on the homescreen
        this._pts.reportMetric(ProgrammaticTrackingMetricName.ConsentParagraphLinkClicked);
        this.showPage(ConsentPage.MY_CHOICES);
        this._privacyRowItemContainer.showParagraphAndScrollToSection(paragraph);
    }
}
