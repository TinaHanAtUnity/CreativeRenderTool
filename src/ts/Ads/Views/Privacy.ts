import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { Campaign } from 'Ads/Models/Campaign';
import { AbstractPrivacy, ReportReason } from 'Ads/Views/AbstractPrivacy';
import { Platform } from 'Core/Constants/Platform';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { Template } from 'Core/Utilities/Template';
import PrivacyTemplate from 'html/Privacy.html';
import { Localization } from 'Core/Utilities/Localization';

enum PrivacyCardState {
    PRIVACY,
    BUILD,
    REPORT
}

export class Privacy extends AbstractPrivacy {

    private _dataDeletionConfirmation: boolean = false;
    private _currentState: PrivacyCardState = PrivacyCardState.PRIVACY;
    private _campaign: Campaign;
    private _reportSent: boolean = false;
    private _gdprEnabled: boolean = false;
    private _userSummaryObtained: boolean = false;
    private _localization: Localization;

    constructor(platform: Platform, campaign: Campaign,
                privacyManager: UserPrivacyManager, gdprEnabled: boolean,
                isCoppaCompliant: boolean, language: string) {

        super(platform, privacyManager, isCoppaCompliant, gdprEnabled, 'privacy');
        this._templateData.reportKeys = Object.keys(ReportReason);
        // tslint:disable-next-line
        this._templateData.reportReasons = Object.keys(ReportReason).map((reason: any) => ReportReason[reason]);

        this._localization = new Localization(language, 'privacy');
        this._template = new Template(PrivacyTemplate, this._localization);
        this._campaign = campaign;
        this._gdprEnabled = gdprEnabled;

        this._bindings = [
            {
                event: 'click',
                listener: (event: Event) => this.onPrivacyEvent(event),
                selector: 'a'
            },
            {
                event: 'click',
                listener: (event: Event) => this.changePrivacyState(event, true),
                selector: '.left-side-link'
            },
            {
                event: 'click',
                listener: (event: Event) => this.changePrivacyState(event, false),
                selector: '.middle-link'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onCloseEvent(event),
                selector: '.close-button'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onDataDeletion(event),
                selector: '.data-deletion-link, .data-deletion-reject'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onDataDeletionConfirmation(event),
                selector: '#data-deletion-confirm'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onReportAd(event),
                selector: '.report-button'
            }
        ];
    }

    public show(): void {
        super.show();

        if (!this._userPrivacyManager.isUserUnderAgeLimit() &&  !this._isCoppaCompliant) {
            this.populateUserSummary();
        }

        if (this._gdprEnabled && !this._userPrivacyManager.isUserUnderAgeLimit() && !this._isCoppaCompliant) {
            const elId = this._userPrivacyManager.isOptOutEnabled() ? 'gdpr-refuse-radio' : 'gdpr-agree-radio';

            const activeRadioButton = <HTMLInputElement> this._container.querySelector(`#${elId}`);
            activeRadioButton.checked = true;

            const agreeRadioButton = <HTMLInputElement> this._container.querySelector('#gdpr-agree-radio');
            if (agreeRadioButton) {
                agreeRadioButton.onclick = () => {
                    const confirmationContainer = <HTMLSpanElement>document.getElementById('data-deletion-container');
                    confirmationContainer.classList.remove('active');

                    const requestContainer = <HTMLSpanElement>document.getElementById('data-deletion-request-container');
                    requestContainer.classList.remove('active');

                    this._dataDeletionConfirmation = false;
                };
            }
        }

        if (this._gdprEnabled) {
            // Disables reporting for GDPR Regions by hiding the report screen from being activated
            const middleLink = <HTMLDivElement> this._container.querySelector('.middle-link');
            middleLink.style.visibility = 'hidden';
        }
    }

    protected onCloseEvent(event: Event): void {
        event.preventDefault();
        if (this._gdprEnabled && !this._userPrivacyManager.isUserUnderAgeLimit() && !this._isCoppaCompliant) {
            const gdprReduceRadioButton = <HTMLInputElement> this._container.querySelector('#gdpr-refuse-radio');

            this._handlers.forEach(handler => {
                if (handler.onGDPROptOut) {
                    handler.onGDPROptOut(gdprReduceRadioButton.checked || this._dataDeletionConfirmation);
                }
            });
        }
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

    protected onDataDeletion(event: Event): void {
        event.preventDefault();

        if (this._dataDeletionConfirmation) {
            return;
        }

        const confirmationContainer = <HTMLSpanElement>document.getElementById('data-deletion-container');
        confirmationContainer.classList.toggle('active');
    }

    protected onDataDeletionConfirmation(event: Event): void {
        event.preventDefault();
        this._dataDeletionConfirmation = true;

        const confirmationContainer = <HTMLSpanElement>document.getElementById('data-deletion-container');
        confirmationContainer.classList.toggle('active');

        const requestContainer = <HTMLSpanElement>document.getElementById('data-deletion-request-container');
        requestContainer.classList.add('active');

        const activeRadioButton = <HTMLInputElement> this._container.querySelector('#gdpr-refuse-radio');
        activeRadioButton.checked = true;
    }

    private onReportAd(event: Event): void {
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

    private changePrivacyState(event: Event, isLeftClick: boolean) {
        event.preventDefault();

        const leftSideLink = <HTMLDivElement> this._container.querySelector('.left-side-link');
        const middleLink = <HTMLDivElement> this._container.querySelector('.middle-link');
        const closeButton = <HTMLDivElement> this._container.querySelector('.close-button');
        const classList = this._container.classList;
        const reportButtonText = 'Report Ad ⚑';
        const privacyButtonText = 'Privacy info 👁';
        const buildButtonText = 'Build info ⚙';
        const confirmText = this._localization.translate('privacy-dialog-button-confirm');
        const closeText = this._localization.translate('privacy-dialog-button-close');

        switch (this._currentState) {
            // Privacy screen showing
            case PrivacyCardState.PRIVACY: {
                leftSideLink.innerText = privacyButtonText;
                closeButton.innerText = closeText;
                if (isLeftClick) {
                    this._currentState = PrivacyCardState.BUILD;
                    middleLink.innerText = reportButtonText;
                    classList.add('build');
                } else {
                    this._currentState = PrivacyCardState.REPORT;
                    middleLink.innerText = buildButtonText;
                    classList.add('report');
                }
                break;
            }
            // Build screen showing
            case PrivacyCardState.BUILD: {
                classList.remove('build');
                if (isLeftClick) {
                    this._currentState = PrivacyCardState.PRIVACY;
                    leftSideLink.innerText = buildButtonText;
                    middleLink.innerText = reportButtonText;
                    closeButton.innerText = confirmText;
                } else {
                    this._currentState = PrivacyCardState.REPORT;
                    leftSideLink.innerText = privacyButtonText;
                    middleLink.innerText = buildButtonText;
                    classList.add('report');
                }
                break;
            }
            // Report screen showing
            case PrivacyCardState.REPORT: {
                classList.remove('report');
                middleLink.innerText = reportButtonText;
                if (isLeftClick) {
                    this._currentState = PrivacyCardState.PRIVACY;
                    leftSideLink.innerText = buildButtonText;
                    closeButton.innerText = confirmText;
                } else {
                    this._currentState = PrivacyCardState.BUILD;
                    leftSideLink.innerText = privacyButtonText;
                    classList.add('build');
                }
                break;
            }
            default: {
                // Must be included. Thanks linter.
            }
        }
    }

    private populateUserSummary() {
        if (!this._userSummaryObtained) {
            const formatTranslation = (str: string, arr: string[]) => {
                return str.replace(/{(\d+)}/g, (match, number) => {
                    return typeof arr[number] !== 'undefined' ? arr[number] : match;
                });
            };

            this._userPrivacyManager.retrieveUserSummary().then((personalProperties) => {
                document.getElementById('phone-type')!.innerHTML = formatTranslation(this._localization.translate('privacy-using'), [personalProperties.deviceModel]);
                document.getElementById('country')!.innerHTML = formatTranslation(this._localization.translate('privacy-located-in'), [personalProperties.country]);
                document.getElementById('game-plays-this-week')!.innerHTML = formatTranslation(this._localization.translate('privacy-used-this-app'), [personalProperties.gamePlaysThisWeek.toString()]);
                document.getElementById('ads-seen-in-game')!.innerHTML = formatTranslation(this._localization.translate('privacy-seen-ads'), [personalProperties.adsSeenInGameThisWeek.toString()]);
                document.getElementById('games-installed-from-ads')!.innerHTML = formatTranslation(this._localization.translate('privacy-installed-based-on'), [personalProperties.installsFromAds.toString()]);
            }).catch(error => {
                Diagnostics.trigger('gdpr_personal_info_failed', error);
                const hyphen = ['-'];
                document.getElementById('phone-type')!.innerHTML = formatTranslation(this._localization.translate('privacy-using'), hyphen);
                document.getElementById('country')!.innerHTML = formatTranslation(this._localization.translate('privacy-located-in'), hyphen);
                document.getElementById('game-plays-this-week')!.innerHTML = formatTranslation(this._localization.translate('privacy-used-this-app'), hyphen);
                document.getElementById('ads-seen-in-game')!.innerHTML = formatTranslation(this._localization.translate('privacy-seen-ads'), hyphen);
                document.getElementById('games-installed-from-ads')!.innerHTML = formatTranslation(this._localization.translate('privacy-installed-based-on'), hyphen);
            });
        }

    }
}
