import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { Campaign } from 'Ads/Models/Campaign';
import { AbstractPrivacy, ReportReason } from 'Ads/Views/AbstractPrivacy';
import { Platform } from 'Core/Constants/Platform';
import { Template } from 'Core/Utilities/Template';

import PrivacySettingsTemplate from 'html/consent/PrivacySettings.html';
import { PrivacyRowItemContainer, IPrivacyRowItemContainerHandler } from 'Ads/Views/Consent/PrivacyRowItemContainer';
import { PersonalizationSwitchGroup } from 'Ads/Views/Consent/PersonalizationSwitchGroup';
import { IPermissions } from 'Ads/Models/Privacy';
import { Localization } from 'Core/Utilities/Localization';

enum ViewState {
    INITIAL,
    PERSONALIZATION,
    DATA,
    REPORT,
    BUILD_INFO
}

export class PrivacySettings extends AbstractPrivacy implements IPrivacyRowItemContainerHandler {

    private _reportSent: boolean = false;

    private _currentViewState: ViewState;

    private _campaign: Campaign;

    private _privacyRowItemContainer: PrivacyRowItemContainer;
    private _personalizationSwitchGroup: PersonalizationSwitchGroup;

    constructor(platform: Platform, campaign: Campaign, privacyManager: UserPrivacyManager,
                gdprEnabled: boolean,
                isCoppaCompliant: boolean,
                language: string) {
        super(platform, privacyManager, isCoppaCompliant, gdprEnabled, 'privacy-settings', false);

        this._campaign = campaign;

        this._templateData.reportKeys = Object.keys(ReportReason);
        // https://github.com/Microsoft/TypeScript/issues/13775#issuecomment-276381229 explains "keyof typeof EnumType" cast
        this._templateData.reportReasons = Object.keys(ReportReason).map((reason) => ReportReason[<keyof typeof ReportReason>reason]);

        this._template = new Template(PrivacySettingsTemplate, new Localization(language, 'consent'));
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
                listener: (event: Event) => this.onDeleteDataButtonEvent(event),
                selector: '.delete-data-button'
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
                selector: '.safe-area-content, .close-area'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onReportAdEvent(event),
                selector: '.report-button'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onDeleteYourDataLinkEvent(event),
                selector: '.delete-your-data-link'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onDataDeletionConfirmationEvent(event),
                selector: '#delete-data-yes'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onDataDeletionCancelEvent(event),
                selector: '#delete-data-cancel'
            },
            {
                event: 'swipedown',
                listener: (event: Event) => this.onCloseEvent(event),
                selector: '.close-area, close-button'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onViewContainerEvent(event),
                selector: '.view-container'

            }
        ];

        this._privacyRowItemContainer = new PrivacyRowItemContainer(platform, this._userPrivacyManager, language);
        this._privacyRowItemContainer.addEventHandler(this);

        this._personalizationSwitchGroup = new PersonalizationSwitchGroup(platform, this._userPrivacyManager, language);
    }

    public render(): void {
        super.render();

        this._privacyRowItemContainer.render();
        (<HTMLElement> this._container.querySelector('.info-container')).appendChild(this._privacyRowItemContainer.container());

        this._personalizationSwitchGroup.render();
        (<HTMLElement> this._container.querySelector('.checkbox-group-container')).appendChild(this._personalizationSwitchGroup.container());

        this.showView(ViewState.INITIAL);
    }

    public onPrivacy(url: string): void {
        this._handlers.forEach(handler => {
            if (handler.onPrivacy) {
                handler.onPrivacy(url);
            }
        });
    }

    public hide(): void {
        super.hide();

        if (this._currentViewState === ViewState.PERSONALIZATION) {
            this.triggerPersonalizedConsent();
        }
    }

    protected onCloseEvent(event: Event): void {
        event.preventDefault();

        this._handlers.forEach(handler => handler.onPrivacyClose());
    }

    protected onPrivacyEvent(event: Event): void {
        event.preventDefault();
        this._handlers.forEach(handler => {
            if (handler.onPrivacy) {
                handler.onPrivacy((<HTMLLinkElement>event.target).href);
            }
        });
    }

    private onBackButtonEvent(event: Event) {
        event.preventDefault();

        if (this._currentViewState === ViewState.PERSONALIZATION) {
            this.triggerPersonalizedConsent();
        }
        this.showView(ViewState.INITIAL);
    }

    private onPersonalizationButtonEvent(event: Event) {
        event.preventDefault();

        this.showView(ViewState.PERSONALIZATION);
    }

    private onDeleteDataButtonEvent(event: Event) {
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
            const checkedReportButton = <HTMLElement> this._container.querySelector('.report-choice-radio:checked');
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

    private triggerPersonalizedConsent(): void {
        const consent: IPermissions = {
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

    private showView(viewState: ViewState) {
        this._currentViewState = viewState;

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

                if (state === 'personalization') {
                    this._personalizationSwitchGroup.show();
                }
            } else {
                this.container().classList.remove(state);
            }
        });
    }

    private onDeleteYourDataLinkEvent(event: Event): void {
        event.preventDefault();
        (<HTMLElement> this._container.querySelector('.delete-data-container')).classList.add('active');
    }

    private onDataDeletionConfirmationEvent(event: Event): void {
        event.preventDefault();

        const dataDeletionContainer = (<HTMLElement> this._container.querySelector('.delete-data-container'));
        dataDeletionContainer.classList.remove('active');
        dataDeletionContainer.classList.add('data-deletion-confirmed');

        this._personalizationSwitchGroup.checkCheckboxes(false);
        this.triggerPersonalizedConsent();
    }

    private onDataDeletionCancelEvent(event: Event): void {
        event.preventDefault();
        (<HTMLElement> this._container.querySelector('.delete-data-container')).classList.remove('active');
    }

    private onViewContainerEvent(event: Event): void {
        // Stop propagation to prevent closing the view
        // Click event outside of .view-container div closes the view
        event.stopPropagation();
    }
}
