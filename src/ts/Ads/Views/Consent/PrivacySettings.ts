import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { Campaign } from 'Ads/Models/Campaign';
import { AbstractPrivacy, ReportReason } from 'Ads/Views/AbstractPrivacy';
import { Platform } from 'Core/Constants/Platform';
import { Template } from 'Core/Utilities/Template';

import PrivacySettingsTemplate from 'html/consent/PrivacySettings.html';
import { PrivacyRowItemContainer, IPrivacyRowItemContainerHandler } from 'Ads/Views/Consent/PrivacyRowItemContainer';
import { PersonalizationCheckboxGroup } from 'Ads/Views/Consent/PersonalizationCheckboxGroup';
import { IPermissions } from 'Ads/Models/Privacy';

enum ViewState {
    INITIAL,
    PERSONALIZATION,
    DATA,
    REPORT,
    BUILD_INFO
}

export class PrivacySettings extends AbstractPrivacy implements IPrivacyRowItemContainerHandler {

    private _reportSent: boolean = false;

    private _campaign: Campaign;

    private _privacyRowItemContainer: PrivacyRowItemContainer;
    private _personalizationCheckBoxGroup: PersonalizationCheckboxGroup;

    constructor(platform: Platform, campaign: Campaign, privacyManager: UserPrivacyManager,
                gdprEnabled: boolean,
                isCoppaCompliant: boolean) {
        super(platform, privacyManager, isCoppaCompliant, gdprEnabled, 'privacy-settings');

        this._campaign = campaign;

        this._templateData.reportKeys = Object.keys(ReportReason);
        this._templateData.reportReasons = Object.keys(ReportReason).map((reason: any) => ReportReason[reason]);

        this._template = new Template(PrivacySettingsTemplate);
        this._bindings = [
            {
                event: 'click',
                listener: (event: Event) => this.onBackButtonEvent(event),
                selector: '.back-button'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onPersonalizationButtonEvent(event),
                selector: '.personalization-button'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onViewDataButtonEvent(event),
                selector: '.view-data-button'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onReportAdButtonEvent(event),
                selector: '.report-ad-button'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onBuildInfoButtonEvent(event),
                selector: '.build-info-button'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onCloseEvent(event),
                selector: '.close-area'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onReportAdEvent(event),
                selector: '.report-button'
            }
        ];

        this._privacyRowItemContainer = new PrivacyRowItemContainer({ platform: platform, gdprManager: privacyManager });
        this._privacyRowItemContainer.addEventHandler(this);
        // todo: add user privacy
        this._personalizationCheckBoxGroup = new PersonalizationCheckboxGroup(platform, { gameExp: true, ads: false, external: true});
    }

    public render(): void {
        super.render();

        this._privacyRowItemContainer.render();
        (<HTMLElement>this._container.querySelector('.info-container')).appendChild(this._privacyRowItemContainer.container());

        this._personalizationCheckBoxGroup.render();
        (<HTMLElement>this._container.querySelector('.checkbox-group-container')).appendChild(this._personalizationCheckBoxGroup.container());

        this.showView(ViewState.INITIAL);
    }

    // IPrivacyRowItemContainerHandler
    public onDataDeletion(): void {
        this._personalizationCheckBoxGroup.checkCheckboxes(false);
    }

    // IPrivacyRowItemContainerHandler
    public onPrivacy(url: string): void {
        this._handlers.forEach(handler => handler.onPrivacy(url));
    }

    protected onCloseEvent(event: Event): void {
        event.preventDefault();

        const consent: IPermissions = {
            personalizedConsent: {
                gameExp: this._personalizationCheckBoxGroup.isPersonalizedExperienceChecked(),
                ads: this._personalizationCheckBoxGroup.isPersonalizedAdsChecked(),
                external: this._personalizationCheckBoxGroup.isAds3rdPartyChecked()
            }
        };

        this._handlers.forEach(handler => handler.onPersonalizedConsent(consent));
        this._handlers.forEach(handler => handler.onPrivacyClose());

        // todo: for testing, remove
        this.hide();
    }

    protected onPrivacyEvent(event: Event): void {
        event.preventDefault();
        this._handlers.forEach(handler => handler.onPrivacy((<HTMLLinkElement>event.target).href));
    }

    private onBackButtonEvent(event: Event) {
        event.preventDefault();

        this.showView(ViewState.INITIAL);
    }

    private onPersonalizationButtonEvent(event: Event) {
        event.preventDefault();

        this.showView(ViewState.PERSONALIZATION);
    }

    private onViewDataButtonEvent(event: Event) {
        event.preventDefault();

        this.showView(ViewState.DATA);
    }

    private onReportAdButtonEvent(event: Event) {
        event.preventDefault();

        this.showView(ViewState.REPORT);
    }

    private onBuildInfoButtonEvent(event: Event) {
        event.preventDefault();

        this.showView(ViewState.BUILD_INFO);
    }

    private onReportAdEvent(event: Event): void {
        event.preventDefault();
        if (!this._reportSent) {
            const checkedReportButton = <HTMLElement>this._container.querySelector('.report-choice-radio:checked');
            const reportText = this._container.querySelector('.report-confirmed-text');
            if (checkedReportButton && checkedReportButton.id) {
                this._reportSent = true;
                this.handleReportText(true, reportText);
                this._onReport.trigger(this._campaign, checkedReportButton.id);
            } else {
                this.handleReportText(false, reportText);
            }
        }
    }

    private handleReportText(checked: boolean, reportText: Element | null) {
        if (reportText) {
            if (checked) {
                reportText.innerHTML = 'Thank you for your help. Your Ad will close shortly.';
                if (!reportText.classList.contains('active')) {
                    reportText.classList.toggle('active');
                }
            } else {
                reportText.innerHTML = 'Please select an option from the list above.';
                reportText.classList.toggle('active');
            }
        }
    }

    private showView(viewState: ViewState) {
        let classToAdd: string;

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

                // todo: needed to set the length of the line connecting main and sub checkboxes
                if (state === 'personalization') {
                    this._personalizationCheckBoxGroup.show();
                }
            } else {
                this.container().classList.remove(state);
            }
        });
    }

}
