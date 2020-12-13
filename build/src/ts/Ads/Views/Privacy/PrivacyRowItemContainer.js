import { View } from 'Core/Views/View';
import PrivacyRowItemContainerTemplate from 'html/consent/privacy-row-item-container.html';
import { Template } from 'Core/Utilities/Template';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { PrivacyLocalization } from 'Privacy/PrivacyLocalization';
export var PrivacyTextParagraph;
(function (PrivacyTextParagraph) {
    PrivacyTextParagraph[PrivacyTextParagraph["THIRD_PARTIES"] = 0] = "THIRD_PARTIES";
    PrivacyTextParagraph[PrivacyTextParagraph["DATA"] = 1] = "DATA";
    PrivacyTextParagraph[PrivacyTextParagraph["DEMOGRAPHIC_INFO"] = 2] = "DEMOGRAPHIC_INFO";
    PrivacyTextParagraph[PrivacyTextParagraph["MOBILE_IDENTIFIERS"] = 3] = "MOBILE_IDENTIFIERS";
    PrivacyTextParagraph[PrivacyTextParagraph["PERSONALIZATION"] = 4] = "PERSONALIZATION";
    PrivacyTextParagraph[PrivacyTextParagraph["MEASUREMENT"] = 5] = "MEASUREMENT";
})(PrivacyTextParagraph || (PrivacyTextParagraph = {}));
export class PrivacyRowItemContainer extends View {
    constructor(platform, userPrivacyManager, language, showChangingPrivacyChoiceItem = false) {
        super(platform, 'privacy-row-item-container', false);
        this._userPrivacyManager = userPrivacyManager;
        this._localization = new PrivacyLocalization(language, 'consent', userPrivacyManager.getLegalFramework());
        this._template = new Template(PrivacyRowItemContainerTemplate, this._localization);
        this._templateData = {
            showChangingPrivacyChoiceItem: showChangingPrivacyChoiceItem
        };
        this._bindings = [
            {
                event: 'click',
                listener: (event) => this.onPrivacyEvent(event),
                selector: 'a'
            },
            {
                event: 'click',
                listener: (event) => this.onWhatWeCollectEvent(event),
                selector: '.what-we-collect'
            },
            {
                event: 'click',
                listener: (event) => this.onDataTransferEvent(event),
                selector: '.data-transfer'
            },
            {
                event: 'click',
                listener: (event) => this.onThirdPartyEvent(event),
                selector: '.third-party'
            },
            {
                event: 'click',
                listener: (event) => this.onChangingPrivacyChoiceEvent(event),
                selector: '.changing-privacy-choice'
            },
            {
                event: 'click',
                listener: (event) => this.onPrivacyPolicyEvent(event),
                selector: '.privacy-policy'
            }
        ];
    }
    showParagraphAndScrollToSection(paragraph) {
        let rowItemElement;
        let paragraphElement;
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
    fillPersonalInfoFields() {
        const formatTranslation = (str, arr) => {
            return str.replace(/{(\d+)}/g, (match, number) => {
                return typeof arr[number] !== 'undefined' ? arr[number] : match;
            });
        };
        this._userPrivacyManager.retrieveUserSummary().then((personalProperties) => {
            document.getElementById('phone-type').innerHTML = formatTranslation(this._localization.translate('privacy-using'), [personalProperties.deviceModel]);
            document.getElementById('country').innerHTML = formatTranslation(this._localization.translate('privacy-located-in'), [personalProperties.country]);
            document.getElementById('game-plays-this-week').innerHTML = formatTranslation(this._localization.translate('privacy-used-this-app'), [personalProperties.gamePlaysThisWeek.toString()]);
            document.getElementById('ads-seen-in-game').innerHTML = formatTranslation(this._localization.translate('privacy-seen-ads'), [personalProperties.adsSeenInGameThisWeek.toString()]);
            document.getElementById('games-installed-from-ads').innerHTML = formatTranslation(this._localization.translate('privacy-installed-based-on'), [personalProperties.installsFromAds.toString()]);
        }).catch(error => {
            Diagnostics.trigger('gdpr_personal_info_failed', error);
            const hyphen = ['-'];
            document.getElementById('phone-type').innerHTML = formatTranslation(this._localization.translate('privacy-using'), hyphen);
            document.getElementById('country').innerHTML = formatTranslation(this._localization.translate('privacy-located-in'), hyphen);
            document.getElementById('game-plays-this-week').innerHTML = formatTranslation(this._localization.translate('privacy-used-this-app'), hyphen);
            document.getElementById('ads-seen-in-game').innerHTML = formatTranslation(this._localization.translate('privacy-seen-ads'), hyphen);
            document.getElementById('games-installed-from-ads').innerHTML = formatTranslation(this._localization.translate('privacy-installed-based-on'), hyphen);
        });
    }
    onWhatWeCollectEvent(event) {
        event.preventDefault();
        this.fillPersonalInfoFields();
        const element = this._container.querySelector('.what-we-collect');
        this.toggleDescription(element);
    }
    onDataTransferEvent(event) {
        event.preventDefault();
        const element = this._container.querySelector('.data-transfer');
        this.toggleDescription(element);
    }
    onThirdPartyEvent(event) {
        event.preventDefault();
        const element = this._container.querySelector('.third-party');
        this.toggleDescription(element);
    }
    onChangingPrivacyChoiceEvent(event) {
        event.preventDefault();
        const element = this._container.querySelector('.changing-privacy-choice');
        this.toggleDescription(element);
    }
    onPrivacyPolicyEvent(event) {
        event.preventDefault();
        const element = this._container.querySelector('.privacy-policy');
        this.toggleDescription(element);
    }
    toggleDescription(element) {
        if (element && element.parentElement) {
            if (element.parentElement.classList.contains('show-description')) {
                element.parentElement.classList.remove('show-description');
            }
            else {
                element.parentElement.classList.add('show-description');
            }
        }
    }
    onPrivacyEvent(event) {
        event.preventDefault();
        this._handlers.forEach(handler => handler.onPrivacy(event.target.href));
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJpdmFjeVJvd0l0ZW1Db250YWluZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL1ZpZXdzL1ByaXZhY3kvUHJpdmFjeVJvd0l0ZW1Db250YWluZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ3ZDLE9BQU8sK0JBQStCLE1BQU0sOENBQThDLENBQUM7QUFDM0YsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRW5ELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUd6RCxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQU1sRSxNQUFNLENBQU4sSUFBWSxvQkFPWDtBQVBELFdBQVksb0JBQW9CO0lBQzVCLGlGQUFhLENBQUE7SUFDYiwrREFBSSxDQUFBO0lBQ0osdUZBQWdCLENBQUE7SUFDaEIsMkZBQWtCLENBQUE7SUFDbEIscUZBQWUsQ0FBQTtJQUNmLDZFQUFXLENBQUE7QUFDZixDQUFDLEVBUFcsb0JBQW9CLEtBQXBCLG9CQUFvQixRQU8vQjtBQUVELE1BQU0sT0FBTyx1QkFBd0IsU0FBUSxJQUFxQztJQUs5RSxZQUFZLFFBQWtCLEVBQUUsa0JBQXNDLEVBQUUsUUFBZ0IsRUFBRSxnQ0FBeUMsS0FBSztRQUNwSSxLQUFLLENBQUMsUUFBUSxFQUFFLDRCQUE0QixFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXJELElBQUksQ0FBQyxtQkFBbUIsR0FBRyxrQkFBa0IsQ0FBQztRQUM5QyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksbUJBQW1CLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxrQkFBa0IsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUM7UUFDMUcsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLFFBQVEsQ0FBQywrQkFBK0IsRUFBRSxJ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