import { View } from 'Core/Views/View';
import { Template } from 'Core/Utilities/Template';
import { Platform } from 'Core/Constants/Platform';
import { GDPREventAction, GDPREventSource } from 'Ads/Managers/UserPrivacyManager';
import { UserPrivacy } from 'Privacy/Privacy';
import { ButtonSpinner } from 'Ads/Views/Privacy/ButtonSpinner';
import ConsentTemplate from 'html/consent/Consent.html';
import { PersonalizationSwitchGroup } from 'Ads/Views/Privacy/PersonalizationSwitchGroup';
import { PrivacyRowItemContainer, PrivacyTextParagraph } from 'Ads/Views/Privacy/PrivacyRowItemContainer';
import { MiscellaneousMetric, SDKMetrics } from 'Ads/Utilities/SDKMetrics';
import { PrivacyLocalization } from 'Privacy/PrivacyLocalization';
export var ConsentPage;
(function (ConsentPage) {
    ConsentPage["MY_CHOICES"] = "mychoices";
    ConsentPage["HOMEPAGE"] = "homepage";
    ConsentPage["AGE_GATE"] = "agegate";
})(ConsentPage || (ConsentPage = {}));
export class Privacy extends View {
    constructor(parameters) {
        super(parameters.platform, 'consent');
        this._isABTest = false;
        this._localization = new PrivacyLocalization(parameters.language, 'consent', parameters.privacyManager.getLegalFramework());
        this._landingPage = parameters.landingPage;
        this._apiLevel = parameters.apiLevel;
        this._osVersion = parameters.osVersion;
        this._privacyManager = parameters.privacyManager;
        this._ageGateLimit = parameters.ageGateLimit;
        this._isABTest = parameters.consentABTest;
        this._template = new Template(ConsentTemplate, this._localization);
        this._templateData = {};
        this._bindings = [
            {
                event: 'click',
                listener: (event) => this.onAgreeEvent(event),
                selector: '.agree'
            },
            {
                event: 'click',
                listener: (event) => this.onDisagreeEvent(event),
                selector: '.disagree'
            },
            {
                event: 'click',
                listener: (event) => this.onSaveMyChoicesEvent(event),
                selector: '.save-my-choices'
            },
            {
                event: 'click',
                listener: (event) => this.onOptionsEvent(event),
                selector: '.show-choices'
            },
            {
                event: 'click',
                listener: (event) => this.onThirdPartiesLinkEvent(event),
                selector: '.third-parties-link'
            },
            {
                event: 'click',
                listener: (event) => this.onDataLinkEvent(event),
                selector: '.data-link'
            }, {
                event: 'click',
                listener: (event) => this.onDemographicInfoLinkEvent(event),
                selector: '.demographic-link'
            },
            {
                event: 'click',
                listener: (event) => this.onMobileIdentifiersLinkEvent(event),
                selector: '.mobile-identifiers-link'
            },
            {
                event: 'click',
                listener: (event) => this.onPersonalizationLink(event),
                selector: '.personalization-link'
            },
            {
                event: 'click',
                listener: (event) => this.onMeasurementLinkEvent(event),
                selector: '.measurement-link'
            },
            {
                event: 'click',
                listener: (event) => this.onBackButtonEvent(event),
                selector: '.back-button'
            },
            {
                event: 'click',
                listener: (event) => this.onHomepageAcceptAllEvent(event),
                selector: '.homepage-accept-all'
            },
            {
                event: 'click',
                listener: (event) => this.onAgeGateOverEvent(event),
                selector: '.age-gate-over'
            },
            {
                event: 'click',
                listener: (event) => this.onAgeGateUnderEvent(event),
                selector: '.age-gate-under'
            }
        ];
        this._switchGroup = new PersonalizationSwitchGroup(parameters.platform, parameters.privacyManager, parameters.language);
        this._switchGroup.addEventHandler(this);
        this._privacyRowItemContainer = new PrivacyRowItemContainer(parameters.platform, parameters.privacyManager, parameters.language, true);
        this._privacyRowItemContainer.addEventHandler(this);
    }
    testAutoAgeGate(ageGate) {
        const testEvent = new Event('testAutoAgeGate');
        if (ageGate) {
            this.onAgeGateOverEvent(testEvent);
        }
        else {
            this.onAgeGateUnderEvent(testEvent);
        }
    }
    testAutoConsent(consent) {
        this._handlers.forEach(handler => handler.onConsent(consent, GDPREventAction.TEST_AUTO_CONSENT, GDPREventSource.USER));
        this._handlers.forEach(handler => handler.onClose());
    }
    render() {
        super.render();
        this._switchGroup.render();
        this._container.querySelector('.switch-group-container').appendChild(this._switchGroup.container());
        this._privacyRowItemContainer.render();
        this._container.querySelector('.privacy-container').appendChild(this._privacyRowItemContainer.container());
        this._consentButtonContainer = this._container.querySelector('.consent-button-container');
        // Android <= 4.4.4
        if (this._platform === Platform.ANDROID && this._apiLevel && this._apiLevel <= 19) {
            this._container.classList.add('android4-ios7-ios8');
        }
        else if (this._platform === Platform.IOS && this._osVersion) {
            if (this._osVersion.match(/^8/) || this._osVersion.match(/^7/)) {
                this._container.classList.add('android4-ios7-ios8');
            }
        }
        if (this._ageGateLimit > 0) {
            const formatTranslation = (str, arr) => {
                return str.replace(/{(\d+)}/g, (match, number) => {
                    return typeof arr[number] !== 'undefined' ? arr[number] : match;
                });
            };
            const overLimitBtnText = formatTranslation(this._localization.translate('age-gate-over-age-limit-btn'), [this._ageGateLimit.toString()]);
            const underLimitBtnText = formatTranslation(this._localization.translate('age-gate-under-age-limit-btn'), [(this._ageGateLimit - 1).toString()]);
            this._container.querySelector('.age-gate-over').innerHTML = overLimitBtnText;
            this._container.querySelector('.age-gate-under').innerHTML = underLimitBtnText;
        }
        this.showPage(this._landingPage);
    }
    show() {
        super.show();
        this._switchGroup.show();
    }
    onSwitchGroupSelectionChange() {
        if (this._consentButtonContainer) {
            if (this.shouldShowSaveMyChoices()) {
                this._consentButtonContainer.classList.add('show-save-my-choices-button');
            }
            else {
                this._consentButtonContainer.classList.remove('show-save-my-choices-button');
            }
        }
    }
    onPrivacy(url) {
        this._handlers.forEach(handler => handler.onPrivacy(url));
    }
    showPage(page) {
        this._currentPage = page;
        const states = [ConsentPage.MY_CHOICES, ConsentPage.HOMEPAGE, ConsentPage.AGE_GATE];
        states.forEach(state => {
            if (state === page) {
                this.container().classList.add(page);
            }
            else {
                this.container().classList.remove(state);
            }
        });
    }
    closeAgeGateWithAgreeAnimation() {
        const element = this._container.querySelector('.age-gate-over');
        this.closeWithAnimation(element);
    }
    shouldShowSaveMyChoices() {
        return this._switchGroup.isPersonalizedExperienceChecked() ||
            this._switchGroup.isPersonalizedAdsChecked() ||
            this._switchGroup.isAds3rdPartyChecked();
    }
    closeWithAnimation(buttonElement) {
        this.container().classList.add('prevent-clicks');
        const buttonSpinner = new ButtonSpinner(this._platform);
        buttonSpinner.render();
        buttonElement.appendChild(buttonSpinner.container());
        buttonElement.classList.add('click-animation');
        setTimeout(() => {
            this._handlers.forEach(h => h.onClose());
        }, 1500);
    }
    onHomepageAcceptAllEvent(event) {
        event.preventDefault();
        this._handlers.forEach(handler => handler.onConsent(UserPrivacy.PERM_ALL_TRUE, GDPREventAction.CONSENT_AGREE_ALL, GDPREventSource.USER));
        const element = this._container.querySelector('.homepage-accept-all');
        this.closeWithAnimation(element);
    }
    onAgreeEvent(event) {
        event.preventDefault();
        this._switchGroup.checkCheckboxes(true);
        const permissions = {
            gameExp: true,
            ads: true,
            external: true
        };
        this._handlers.forEach(handler => handler.onConsent(permissions, GDPREventAction.CONSENT_AGREE, GDPREventSource.USER));
        const element = this._container.querySelector('.agree');
        this.closeWithAnimation(element);
    }
    onDisagreeEvent(event) {
        event.preventDefault();
        this._handlers.forEach(handler => handler.onConsent(UserPrivacy.PERM_ALL_FALSE, GDPREventAction.CONSENT_DISAGREE, GDPREventSource.USER));
        const element = this._container.querySelector('.disagree');
        this.closeWithAnimation(element);
    }
    onSaveMyChoicesEvent(event) {
        event.preventDefault();
        const permissions = {
            gameExp: this._switchGroup.isPersonalizedExperienceChecked(),
            ads: this._switchGroup.isPersonalizedAdsChecked(),
            external: this._switchGroup.isAds3rdPartyChecked()
        };
        this._handlers.forEach(handler => handler.onConsent(permissions, GDPREventAction.CONSENT_SAVE_CHOICES, GDPREventSource.USER));
        const element = this._container.querySelector('.save-my-choices');
        this.closeWithAnimation(element);
    }
    onOptionsEvent(event) {
        event.preventDefault();
        this.showPage(ConsentPage.MY_CHOICES);
    }
    onThirdPartiesLinkEvent(event) {
        event.preventDefault();
        this.showMyChoicesPageAndScrollToParagraph(PrivacyTextParagraph.THIRD_PARTIES);
    }
    onDataLinkEvent(event) {
        event.preventDefault();
        this.showMyChoicesPageAndScrollToParagraph(PrivacyTextParagraph.DATA);
    }
    onDemographicInfoLinkEvent(event) {
        event.preventDefault();
        this.showMyChoicesPageAndScrollToParagraph(PrivacyTextParagraph.DEMOGRAPHIC_INFO);
    }
    onMobileIdentifiersLinkEvent(event) {
        event.preventDefault();
        this.showMyChoicesPageAndScrollToParagraph(PrivacyTextParagraph.MOBILE_IDENTIFIERS);
    }
    onPersonalizationLink(event) {
        event.preventDefault();
        this.showMyChoicesPageAndScrollToParagraph(PrivacyTextParagraph.PERSONALIZATION);
    }
    onMeasurementLinkEvent(event) {
        event.preventDefault();
        this.showMyChoicesPageAndScrollToParagraph(PrivacyTextParagraph.MEASUREMENT);
    }
    onBackButtonEvent(event) {
        event.preventDefault();
        this.showPage(ConsentPage.HOMEPAGE);
    }
    showMyChoicesPageAndScrollToParagraph(paragraph) {
        // To get a rough estimate how often users click links on the homescreen
        SDKMetrics.reportMetricEvent(MiscellaneousMetric.ConsentParagraphLinkClicked);
        this.showPage(ConsentPage.MY_CHOICES);
        this._privacyRowItemContainer.showParagraphAndScrollToSection(paragraph);
    }
    onAgeGateOverEvent(event) {
        // todo: pass the next page/action to this view class
        this._handlers.forEach(handler => handler.onAgeGateAgree());
    }
    onAgeGateUnderEvent(event) {
        event.preventDefault();
        this._handlers.forEach(handler => handler.onAgeGateDisagree());
        const element = this._container.querySelector('.age-gate-under');
        this.closeWithAnimation(element);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJpdmFjeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy90cy9BZHMvVmlld3MvUHJpdmFjeS9Qcml2YWN5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUN2QyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDbkQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ25ELE9BQU8sRUFBRSxlQUFlLEVBQUUsZUFBZSxFQUFzQyxNQUFNLGlDQUFpQyxDQUFDO0FBQ3ZILE9BQU8sRUFBdUIsV0FBVyxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDbkUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBRWhFLE9BQU8sZUFBZSxNQUFNLDJCQUEyQixDQUFDO0FBQ3hELE9BQU8sRUFFSCwwQkFBMEIsRUFDN0IsTUFBTSw4Q0FBOEMsQ0FBQztBQUN0RCxPQUFPLEVBRUgsdUJBQXVCLEVBQ3ZCLG9CQUFvQixFQUN2QixNQUFNLDJDQUEyQyxDQUFDO0FBQ25ELE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxVQUFVLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUUzRSxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQWFsRSxNQUFNLENBQU4sSUFBWSxXQUlYO0FBSkQsV0FBWSxXQUFXO0lBQ25CLHVDQUF3QixDQUFBO0lBQ3hCLG9DQUFxQixDQUFBO0lBQ3JCLG1DQUFvQixDQUFBO0FBQ3hCLENBQUMsRUFKVyxXQUFXLEtBQVgsV0FBVyxRQUl0QjtBQUVELE1BQU0sT0FBTyxPQUFRLFNBQVEsSUFBeUI7SUFrQmxELFlBQVksVUFBa0M7UUFDMUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFMbEMsY0FBUyxHQUFZLEtBQUss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