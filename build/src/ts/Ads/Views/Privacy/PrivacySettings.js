import { AbstractPrivacy, ReportReason } from 'Ads/Views/AbstractPrivacy';
import { Template } from 'Core/Utilities/Template';
import PrivacySettingsTemplate from 'html/consent/PrivacySettings.html';
import { PrivacyRowItemContainer } from 'Ads/Views/Privacy/PrivacyRowItemContainer';
import { PersonalizationSwitchGroup } from 'Ads/Views/Privacy/PersonalizationSwitchGroup';
import { PrivacyLocalization } from 'Privacy/PrivacyLocalization';
var ViewState;
(function (ViewState) {
    ViewState[ViewState["INITIAL"] = 0] = "INITIAL";
    ViewState[ViewState["PERSONALIZATION"] = 1] = "PERSONALIZATION";
    ViewState[ViewState["DATA"] = 2] = "DATA";
    ViewState[ViewState["REPORT"] = 3] = "REPORT";
    ViewState[ViewState["BUILD_INFO"] = 4] = "BUILD_INFO";
})(ViewState || (ViewState = {}));
export class PrivacySettings extends AbstractPrivacy {
    constructor(platform, campaign, privacyManager, gdprEnabled, isCoppaCompliant, language) {
        super(platform, privacyManager, isCoppaCompliant, gdprEnabled, 'privacy-settings', false);
        this._reportSent = false;
        this._campaign = campaign;
        this._templateData.reportKeys = Object.keys(ReportReason);
        // https://github.com/Microsoft/TypeScript/issues/13775#issuecomment-276381229 explains "keyof typeof EnumType" cast
        this._templateData.reportReasons = Object.keys(ReportReason).map((reason) => ReportReason[reason]);
        this._template = new Template(PrivacySettingsTemplate, new PrivacyLocalization(language, 'consent', privacyManager.getLegalFramework()));
        this._bindings = [
            {
                event: 'click',
                listener: (event) => this.onBackButtonEvent(event),
                selector: '.back-button'
            },
            {
                event: 'click',
                listener: (event) => this.onPersonalizationButtonEvent(event),
                selector: '.personalization-button'
            },
            {
                event: 'click',
                listener: (event) => this.onDeleteDataButtonEvent(event),
                selector: '.delete-data-button'
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
                selector: '.safe-area-content, .close-area'
            },
            {
                event: 'click',
                listener: (event) => this.onReportAdEvent(event),
                selector: '.report-button'
            },
            {
                event: 'click',
                listener: (event) => this.onDeleteYourDataLinkEvent(event),
                selector: '.delete-your-data-link'
            },
            {
                event: 'click',
                listener: (event) => this.onDataDeletionConfirmationEvent(event),
                selector: '#delete-data-yes'
            },
            {
                event: 'click',
                listener: (event) => this.onDataDeletionCancelEvent(event),
                selector: '#delete-data-cancel'
            },
            {
                event: 'swipedown',
                listener: (event) => this.onCloseEvent(event),
                selector: '.close-area, close-button'
            },
            {
                event: 'click',
                listener: (event) => this.onViewContainerEvent(event),
                selector: '.view-container'
            }
        ];
        this._privacyRowItemContainer = new PrivacyRowItemContainer(platform, this._userPrivacyManager, language);
        this._privacyRowItemContainer.addEventHandler(this);
        this._personalizationSwitchGroup = new PersonalizationSwitchGroup(platform, this._userPrivacyManager, language);
    }
    render() {
        super.render();
        this._privacyRowItemContainer.render();
        this._container.querySelector('.info-container').appendChild(this._privacyRowItemContainer.container());
        this._personalizationSwitchGroup.render();
        this._container.querySelector('.checkbox-group-container').appendChild(this._personalizationSwitchGroup.container());
        this.showView(ViewState.INITIAL);
    }
    onPrivacy(url) {
        this._handlers.forEach(handler => {
            if (handler.onPrivacy) {
                handler.onPrivacy(url);
            }
        });
    }
    hide() {
        super.hide();
        if (this._currentViewState === ViewState.PERSONALIZATION) {
            this.triggerPersonalizedConsent();
        }
    }
    onCloseEvent(event) {
        event.preventDefault();
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
    onBackButtonEvent(event) {
        event.preventDefault();
        if (this._currentViewState === ViewState.PERSONALIZATION) {
            this.triggerPersonalizedConsent();
        }
        this.showView(ViewState.INITIAL);
    }
    onPersonalizationButtonEvent(event) {
        event.preventDefault();
        this.showView(ViewState.PERSONALIZATION);
    }
    onDeleteDataButtonEvent(event) {
        event.preventDefault();
        this.showView(ViewState.DATA);
    }
    onReportAdButtonEvent(event) {
        event.preventDefault();
        this.showView(ViewState.REPORT);
    }
    onBuildInfoButtonEvent(event) {
        event.preventDefault();
        this.showView(ViewState.BUILD_INFO);
    }
    onReportAdEvent(event) {
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
    triggerPersonalizedConsent() {
        const consent = {
            gameExp: this._personalizationSwitchGroup.isPersonalizedExperienceChecked(),
            ads: this._personalizationSwitchGroup.isPersonalizedAdsChecked(),
            external: this._personalizationSwitchGroup.isAds3rdPartyChecked()
        };
        this._handlers.forEach(handler => {
            if (handler.onPersonalizedConsent) {
                handler.onPersonalizedConsent(consent);
            }
        });
    }
    showView(viewState) {
        this._currentViewState = viewState;
        let classToAdd;
        switch (viewState) {
            case ViewState.INITIAL:
                classToAdd = 'initial';
                break;
            case ViewState.PERSONALIZATION:
                classToAdd = 'personalization';
                break;
            case ViewState.DATA:
                classToAdd = 'data';
                break;
            case ViewState.REPORT:
                classToAdd = 'report';
                break;
            case ViewState.BUILD_INFO:
                classToAdd = 'build-info';
                break;
            default:
                classToAdd = 'initial';
        }
        const states = ['initial', 'personalization', 'data', 'report', 'build-info'];
        states.forEach(state => {
            if (state === classToAdd) {
                this.container().classList.add(classToAdd);
                if (state === 'personalization') {
                    this._personalizationSwitchGroup.show();
                }
            }
            else {
                this.container().classList.remove(state);
            }
        });
    }
    onDeleteYourDataLinkEvent(event) {
        event.preventDefault();
        this._container.querySelector('.delete-data-container').classList.add('active');
    }
    onDataDeletionConfirmationEvent(event) {
        event.preventDefault();
        const dataDeletionContainer = this._container.querySelector('.delete-data-container');
        dataDeletionContainer.classList.remove('active');
        dataDeletionContainer.classList.add('data-deletion-confirmed');
        this._personalizationSwitchGroup.checkCheckboxes(false);
        this.triggerPersonalizedConsent();
    }
    onDataDeletionCancelEvent(event) {
        event.preventDefault();
        this._container.querySelector('.delete-data-container').classList.remove('active');
    }
    onViewContainerEvent(event) {
        // Stop propagation to prevent closing the view
        // Click event outside of .view-container div closes the view
        event.stopPropagation();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJpdmFjeVNldHRpbmdzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9WaWV3cy9Qcml2YWN5L1ByaXZhY3lTZXR0aW5ncy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQUUsZUFBZSxFQUFFLFlBQVksRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBRTFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUVuRCxPQUFPLHVCQUF1QixNQUFNLG1DQUFtQyxDQUFDO0FBQ3hFLE9BQU8sRUFBRSx1QkFBdUIsRUFBbUMsTUFBTSwyQ0FBMkMsQ0FBQztBQUNySCxPQUFPLEVBQUUsMEJBQTBCLEVBQUUsTUFBTSw4Q0FBOEMsQ0FBQztBQUUxRixPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUVsRSxJQUFLLFNBTUo7QUFORCxXQUFLLFNBQVM7SUFDViwrQ0FBTyxDQUFBO0lBQ1AsK0RBQWUsQ0FBQTtJQUNmLHlDQUFJLENBQUE7SUFDSiw2Q0FBTSxDQUFBO0lBQ04scURBQVUsQ0FBQTtBQUNkLENBQUMsRUFOSSxTQUFTLEtBQVQsU0FBUyxRQU1iO0FBRUQsTUFBTSxPQUFPLGVBQWdCLFNBQVEsZUFBZTtJQVdoRCxZQUFZLFFBQWtCLEVBQUUsUUFBa0IsRUFBRSxjQUFrQyxFQUMxRSxXQUFvQixFQUNwQixnQkFBeUIsRUFDekIsUUFBZ0I7UUFDeEIsS0FBSyxDQUFDLFFBQVEsRUFBRSxjQUFjLEVBQUUsZ0JBQWdCLEVBQUUsV0FBVyxFQUFFLGtCQUFrQixFQUFFLEtBQUssQ0FBQyxDQUFDO1FBYnRGLGdCQUFXLEdBQVksS0FBSyxDQUFDO1FBZWpDLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO1FBRTFCLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDMUQs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