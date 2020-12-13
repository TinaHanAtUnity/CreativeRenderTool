import { AbstractPrivacy, ReportReason } from 'Ads/Views/AbstractPrivacy';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { Template } from 'Core/Utilities/Template';
import PrivacyTemplate from 'html/Privacy.html';
import { PrivacyDataRequest } from 'Ads/Views/Privacy/PrivacyDataRequest';
import { PrivacyLocalization } from 'Privacy/PrivacyLocalization';
var ToolViewState;
(function (ToolViewState) {
    ToolViewState[ToolViewState["REPORT"] = 0] = "REPORT";
    ToolViewState[ToolViewState["BUILD_INFO"] = 1] = "BUILD_INFO";
})(ToolViewState || (ToolViewState = {}));
export class Privacy extends AbstractPrivacy {
    constructor(platform, campaign, privacyManager, gdprEnabled, isCoppaCompliant, language) {
        super(platform, privacyManager, isCoppaCompliant, gdprEnabled, 'privacy');
        this._gdprEnabled = false;
        this._dataDeletionConfirmation = false;
        this._reportSent = false;
        this._userSummaryObtained = false;
        this._templateData.reportKeys = Object.keys(ReportReason);
        // tslint:disable-next-line
        this._templateData.reportReasons = Object.keys(ReportReason).map((reason) => ReportReason[reason]);
        this._language = language;
        this._localization = new PrivacyLocalization(language, 'privacy', privacyManager.getLegalFramework());
        this._template = new Template(PrivacyTemplate, this._localization);
        this._campaign = campaign;
        this._gdprEnabled = gdprEnabled;
        this._bindings = [
            {
                event: 'click',
                listener: (event) => this.onPrivacyEvent(event),
                selector: 'a'
            },
            {
                event: 'click',
                listener: (event) => this.onReportAdButtonEvent(event),
                selector: '.report-ad-button'
            },
            {
                event: 'click',
                listener: (event) => this.onBuildInfoButtonEvent(event),
                selector: '.build-info-button'
            },
            {
                event: 'click',
                listener: (event) => this.onCloseEvent(event),
                selector: '.close-button'
            },
            {
                event: 'click',
                listener: (event) => this.onDataDeletion(event),
                selector: '.data-deletion-link, .data-deletion-reject'
            },
            {
                event: 'click',
                listener: (event) => this.onDataDeletionConfirmation(event),
                selector: '#data-deletion-confirm'
            },
            {
                event: 'click',
                listener: (event) => this.onReportAd(event),
                selector: '.report-button'
            }
        ];
    }
    render() {
        super.render();
        if (this._userPrivacyManager.isDataRequestEnabled()) {
            const dataRequestContainer = this._container.querySelector('.data-request-container');
            if (dataRequestContainer) {
                const dataRequestView = new PrivacyDataRequest(this._platform, this._userPrivacyManager, this._language);
                dataRequestView.render();
                dataRequestContainer.appendChild(dataRequestView.container());
            }
        }
        if (this._gdprEnabled) {
            // Disables reporting for GDPR Regions by hiding the report screen from being activated
            const reportAdButton = this._container.querySelector('.report-ad-button');
            reportAdButton.style.visibility = 'hidden';
        }
    }
    show() {
        super.show();
        if (!this._userPrivacyManager.isUserUnderAgeLimit() && !this._isCoppaCompliant) {
            this.populateUserSummary();
        }
        if (this._gdprEnabled && !this._userPrivacyManager.isUserUnderAgeLimit() && !this._isCoppaCompliant) {
            const elId = this._userPrivacyManager.isOptOutEnabled() ? 'gdpr-refuse-radio' : 'gdpr-agree-radio';
            const activeRadioButton = this._container.querySelector(`#${elId}`);
            activeRadioButton.checked = true;
            const agreeRadioButton = this._container.querySelector('#gdpr-agree-radio');
            if (agreeRadioButton) {
                agreeRadioButton.onclick = () => {
                    const noteContainer = this._container.querySelector('.data-deletion-note');
                    if (noteContainer) {
                        noteContainer.classList.remove('active');
                    }
                    const confirmationContainer = document.getElementById('data-deletion-container');
                    confirmationContainer.classList.remove('active');
                    const requestContainer = document.getElementById('data-deletion-request-container');
                    requestContainer.classList.remove('active');
                    this._dataDeletionConfirmation = false;
                };
            }
        }
    }
    onCloseEvent(event) {
        event.preventDefault();
        if (this._gdprEnabled && !this._userPrivacyManager.isUserUnderAgeLimit() && !this._isCoppaCompliant) {
            const gdprReduceRadioButton = this._container.querySelector('#gdpr-refuse-radio');
            this._handlers.forEach(handler => {
                if (handler.onGDPROptOut) {
                    handler.onGDPROptOut(gdprReduceRadioButton.checked || this._dataDeletionConfirmation);
                }
            });
        }
        this._handlers.forEach(handler => handler.onPrivacyClose());
    }
    onPrivacyEvent(event) {
        event.preventDefault();
        this._handlers.forEach(handler => {
            if (handler.onPrivacy) {
                handler.onPrivacy(event.target.href);
            }
        });
    }
    onDataDeletion(event) {
        event.preventDefault();
        if (this._dataDeletionConfirmation) {
            return;
        }
        const noteContainer = this._container.querySelector('.data-deletion-note');
        if (noteContainer) {
            noteContainer.classList.toggle('active');
        }
        const confirmationContainer = document.getElementById('data-deletion-container');
        confirmationContainer.classList.toggle('active');
    }
    onDataDeletionConfirmation(event) {
        event.preventDefault();
        this._dataDeletionConfirmation = true;
        const confirmationContainer = document.getElementById('data-deletion-container');
        confirmationContainer.classList.toggle('active');
        const noteContainer = this._container.querySelector('.data-deletion-note');
        if (noteContainer) {
            noteContainer.classList.toggle('active');
        }
        const requestContainer = document.getElementById('data-deletion-request-container');
        requestContainer.classList.add('active');
        const activeRadioButton = this._container.querySelector('#gdpr-refuse-radio');
        activeRadioButton.checked = true;
    }
    onReportAdButtonEvent(event) {
        event.preventDefault();
        this.showToolView(ToolViewState.REPORT);
    }
    onBuildInfoButtonEvent(event) {
        event.preventDefault();
        this.showToolView(ToolViewState.BUILD_INFO);
    }
    showToolView(viewState) {
        let classToAdd;
        switch (viewState) {
            case ToolViewState.REPORT:
                classToAdd = 'report';
                break;
            case ToolViewState.BUILD_INFO:
                classToAdd = 'build-info';
                break;
            default:
                classToAdd = '';
        }
        const states = ['report', 'build-info'];
        states.forEach(state => {
            if (state === classToAdd) {
                this.container().classList.toggle(classToAdd);
            }
            else {
                this.container().classList.remove(state);
            }
        });
    }
    onReportAd(event) {
        event.preventDefault();
        if (!this._reportSent) {
            const checkedReportButton = this._container.querySelector('.report-choice-radio:checked');
            const reportText = this._container.querySelector('.report-confirmed-text');
            if (checkedReportButton && checkedReportButton.id) {
                this._reportSent = true;
                this.handleReportText(true, reportText);
                this._onReport.trigger(this._campaign, checkedReportButton.id);
            }
            else {
                this.handleReportText(false, reportText);
            }
        }
    }
    handleReportText(checked, reportText) {
        if (reportText) {
            if (checked) {
                reportText.innerHTML = 'Thank you for your help. Your Ad will close shortly.';
                if (!reportText.classList.contains('active')) {
                    reportText.classList.toggle('active');
                }
            }
            else {
                reportText.innerHTML = 'Please select an option from the list above.';
                reportText.classList.toggle('active');
            }
        }
    }
    populateUserSummary() {
        if (!this._userSummaryObtained) {
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
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJpdmFjeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9BZHMvVmlld3MvUHJpdmFjeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQUUsZUFBZSxFQUFFLFlBQVksRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBRTFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUN6RCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDbkQsT0FBTyxlQUFlLE1BQU0sbUJBQW1CLENBQUM7QUFFaEQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFDMUUsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFFbEUsSUFBSyxhQUdKO0FBSEQsV0FBSyxhQUFhO0lBQ2QscURBQU0sQ0FBQTtJQUNOLDZEQUFVLENBQUE7QUFDZCxDQUFDLEVBSEksYUFBYSxLQUFiLGFBQWEsUUFHakI7QUFFRCxNQUFNLE9BQU8sT0FBUSxTQUFRLGVBQWU7SUFXeEMsWUFBWSxRQUFrQixFQUFFLFFBQWtCLEVBQ3RDLGNBQWtDLEVBQUUsV0FBb0IsRUFDeEQsZ0JBQXlCLEVBQUUsUUFBZ0I7UUFFbkQsS0FBSyxDQUFDLFFBQVEsRUFBRSxjQUFjLEVBQUUsZ0JBQWdCLEVBQUUsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBWDdELGlCQUFZLEdBQVksS0FBSyxDQUFDO1FBR3ZDLDhCQUF5QixHQUFZLEtBQUssQ0FBQztRQUMzQyxnQkFBVyxHQUFZLEtBQUssQ0FBQztRQUM3Qix5QkFBb0IsR0FBWSxLQUFLLENBQUM7UUFPMUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMxRCwyQkFBMkI7UUFDM0IsSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhLEdBQUcsTUFB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