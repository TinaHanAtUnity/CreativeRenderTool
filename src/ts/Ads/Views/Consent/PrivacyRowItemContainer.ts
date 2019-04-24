import { View } from 'Core/Views/View';
import PrivacyRowItemContainerTemplate from 'html/consent/privacy-row-item-container.html';
import { Template } from 'Core/Utilities/Template';
import { Platform } from 'Core/Constants/Platform';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { Localization } from 'Core/Utilities/Localization';

export interface IPrivacyRowItemContainerHandler {
    onPrivacy(url: string): void;
}

export enum PrivacyTextParagraph {
    THIRD_PARTIES,
    DATA,
    DEMOGRAPHIC_INFO,
    MOBILE_IDENTIFIERS,
    PERSONALIZATION,
    MEASUREMENT
}

export class PrivacyRowItemContainer extends View<IPrivacyRowItemContainerHandler> {

    private _userPrivacyManager: UserPrivacyManager;
    private _localization: Localization;

    constructor(platform: Platform, userPrivacyManager: UserPrivacyManager, language: string, showChangingPrivacyChoiceItem: boolean = false) {
        super(platform, 'privacy-row-item-container', false);

        this._userPrivacyManager = userPrivacyManager;
        this._localization = new Localization(language, 'consent');
        this._template = new Template(PrivacyRowItemContainerTemplate, this._localization);

        this._templateData = {
            showChangingPrivacyChoiceItem: showChangingPrivacyChoiceItem
        };

        this._bindings = [
            {
                event: 'click',
                listener: (event: Event) => this.onPrivacyEvent(event),
                selector: 'a'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onWhatWeCollectEvent(event),
                selector: '.what-we-collect'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onDataTransferEvent(event),
                selector: '.data-transfer'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onThirdPartyEvent(event),
                selector: '.third-party'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onChangingPrivacyChoiceEvent(event),
                selector: '.changing-privacy-choice'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onPrivacyPolicyEvent(event),
                selector: '.privacy-policy'
            }
        ];
    }

    public showParagraphAndScrollToSection(paragraph: PrivacyTextParagraph): void {
        let rowItemElement: Element | null;
        let paragraphElement: Element | null;

        switch (paragraph) {
            case PrivacyTextParagraph.THIRD_PARTIES:
                paragraphElement = rowItemElement = this._container.querySelector('.third-party');
                break;
            case PrivacyTextParagraph.DATA:
                paragraphElement = rowItemElement = this._container.querySelector('.what-we-collect');
                break;
            case PrivacyTextParagraph.DEMOGRAPHIC_INFO:
                rowItemElement = this._container.querySelector('.what-we-collect');
                paragraphElement = this._container.querySelector('.measurement-paragraph');
                break;
            case PrivacyTextParagraph.MOBILE_IDENTIFIERS:
                paragraphElement = rowItemElement = this._container.querySelector('.what-we-collect');
                break;
            case PrivacyTextParagraph.PERSONALIZATION:
                paragraphElement = rowItemElement = this._container.querySelector('.what-we-collect');
                break;
            case PrivacyTextParagraph.MEASUREMENT:
                rowItemElement = this._container.querySelector('.what-we-collect');
                paragraphElement = this._container.querySelector('.measurement-paragraph');
                break;
            default:
                rowItemElement = null;
                paragraphElement = null;
        }
        if (rowItemElement) {
            if (rowItemElement && rowItemElement.parentElement) {
                rowItemElement.parentElement.classList.add('show-description');
            }
        }
        if (paragraphElement) {
            paragraphElement.scrollIntoView(true);
        }
    }

    private fillPersonalInfoFields(): void {
        this._userPrivacyManager.retrieveUserSummary().then((personalProperties) => {

            const formatTranslation = (str: string, arr: string[]) => {
                return str.replace(/{(\d+)}/g, (match, number) => {
                    return typeof arr[number] !== 'undefined' ? arr[number] : match;
                });
            };

            document.getElementById('sorry-message')!.innerHTML = ''; // Clear sorry message on previous failed request
            document.getElementById('phone-type')!.innerHTML = formatTranslation(this._localization.translate('privacy-using'), [personalProperties.deviceModel]);
            document.getElementById('country')!.innerHTML = formatTranslation(this._localization.translate('privacy-located-in'), [personalProperties.country]);
            document.getElementById('game-plays-this-week')!.innerHTML = formatTranslation(this._localization.translate('privacy-used-this-app'), [personalProperties.gamePlaysThisWeek.toString()]);
            document.getElementById('ads-seen-in-game')!.innerHTML = formatTranslation(this._localization.translate('privacy-seen-ads'), [personalProperties.adsSeenInGameThisWeek.toString()]);
            document.getElementById('games-installed-from-ads')!.innerHTML = formatTranslation(this._localization.translate('privacy-installed-based-on'), [personalProperties.installsFromAds.toString()]);
        }).catch(error => {
            Diagnostics.trigger('gdpr_personal_info_failed', error);
            document.getElementById('sorry-message')!.innerHTML = 'Sorry. We were unable to deliver our collected information at this time.';
        });
    }

    private onWhatWeCollectEvent(event: Event): void {
        event.preventDefault();
        this.fillPersonalInfoFields();
        const element = this._container.querySelector('.what-we-collect');
        this.toggleDescription(element);
    }

    private onDataTransferEvent(event: Event): void {
        event.preventDefault();

        const element = this._container.querySelector('.data-transfer');
        this.toggleDescription(element);
    }

    private onThirdPartyEvent(event: Event): void {
        event.preventDefault();

        const element = this._container.querySelector('.third-party');
        this.toggleDescription(element);
    }

    private onChangingPrivacyChoiceEvent(event: Event): void {
        event.preventDefault();

        const element = this._container.querySelector('.changing-privacy-choice');
        this.toggleDescription(element);
    }

    private onPrivacyPolicyEvent(event: Event): void {
        event.preventDefault();

        const element = this._container.querySelector('.privacy-policy');
        this.toggleDescription(element);
    }

    private toggleDescription(element: Element | null) {
        if (element && element.parentElement) {
            if (element.parentElement.classList.contains('show-description')) {
                element.parentElement.classList.remove('show-description');
            } else {
                element.parentElement.classList.add('show-description');
            }
        }
    }

    private onPrivacyEvent(event: Event): void {
        event.preventDefault();
        this._handlers.forEach(handler => handler.onPrivacy((<HTMLLinkElement>event.target).href));
    }
}
