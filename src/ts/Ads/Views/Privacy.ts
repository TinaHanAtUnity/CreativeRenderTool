import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { Campaign } from 'Ads/Models/Campaign';
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';
import { AbstractVideoOverlay } from 'Ads/Views/AbstractVideoOverlay';
import { FinishState } from 'Core/Constants/FinishState';
import { Platform } from 'Core/Constants/Platform';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { Observable2 } from 'Core/Utilities/Observable';
import { Template } from 'Core/Utilities/Template';
import PrivacyTemplate from 'html/Privacy.html';

enum PrivacyCardState {
    PRIVACY,
    BUILD,
    REPORT
}

enum ReportReason {
    NOT_SHOWING = 'Ad is not showing',
    OFFENSIVE = 'Ad is very offensive',
    MALFORMED = 'Ad does not look right',
    DISLIKE = 'I don\'t like this ad',
    OTHER = 'Other'
}

export class Privacy extends AbstractPrivacy {

    private _onReport: Observable2<Campaign, string> = new Observable2();
    private _privacyManager: UserPrivacyManager;
    private _dataDeletionConfirmation: boolean = false;
    private _currentState: PrivacyCardState = PrivacyCardState.PRIVACY;
    private _campaign: Campaign;
    private _reportSent: boolean = false;
    private _gdprEnabled: boolean = false;
    private _userSummaryObtained: boolean = false;

    constructor(platform: Platform, campaign: Campaign,
                privacyManager: UserPrivacyManager, gdprEnabled: boolean,
                isCoppaCompliant: boolean) {

        super(platform, isCoppaCompliant, gdprEnabled, 'privacy');
        this._templateData.reportKeys = Object.keys(ReportReason);
        this._templateData.reportReasons = Object.keys(ReportReason).map((reason: any) => ReportReason[reason]);

        this._template = new Template(PrivacyTemplate);
        this._campaign = campaign;
        this._gdprEnabled = gdprEnabled;
        this._privacyManager = privacyManager;

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

        this.populateUserSummary();

        if (this._gdprEnabled) {
            const elId = this._privacyManager.isOptOutEnabled() ? 'gdpr-refuse-radio' : 'gdpr-agree-radio';

            const activeRadioButton = <HTMLInputElement>this._container.querySelector(`#${elId}`);
            activeRadioButton.checked = true;
        }

        const agreeRadioButton = <HTMLInputElement>this._container.querySelector('#gdpr-agree-radio');
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

    protected onCloseEvent(event: Event): void {
        event.preventDefault();
        const gdprReduceRadioButton = <HTMLInputElement>this._container.querySelector('#gdpr-refuse-radio');
        if (this._gdprEnabled) {
            this._handlers.forEach(handler => handler.onGDPROptOut(gdprReduceRadioButton.checked || this._dataDeletionConfirmation));
        }
        this._handlers.forEach(handler => handler.onPrivacyClose());
    }

    protected onPrivacyEvent(event: Event): void {
        event.preventDefault();
        this._handlers.forEach(handler => handler.onPrivacy((<HTMLLinkElement>event.target).href));
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

        const activeRadioButton = <HTMLInputElement>this._container.querySelector('#gdpr-refuse-radio');
        activeRadioButton.checked = true;
    }

    private onReportAd(event: Event): void {
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

    private changePrivacyState(event: Event, isLeftClick: boolean) {
        event.preventDefault();

        const leftSideLink = <HTMLDivElement>this._container.querySelector('.left-side-link');
        const middleLink = <HTMLDivElement>this._container.querySelector('.middle-link');
        const closeButton = <HTMLDivElement>this._container.querySelector('.close-button');
        const classList = this._container.classList;
        const reportButtonText = 'Report Ad ⚑';
        const privacyButtonText = 'Privacy info 👁';
        const buildButtonText = 'Build info ⚙';
        const confirmText = 'Confirm';
        const closeText = 'Close';

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
            this._privacyManager.retrieveUserSummary().then((userSummary) => {
                this._userSummaryObtained = true;
                document.getElementById('sorry-message')!.innerHTML = ''; // Clear sorry message on previous failed request
                document.getElementById('phone-type')!.innerHTML = ` - Using ${userSummary.deviceModel}`;
                document.getElementById('country')!.innerHTML = ` - Located in ${userSummary.country}`;
                document.getElementById('game-plays-this-week')!.innerHTML = ` - Used this app ${userSummary.gamePlaysThisWeek} times this week`;
                document.getElementById('ads-seen-in-game')!.innerHTML = ` - Seen ${userSummary.adsSeenInGameThisWeek} ads in this app`;
                document.getElementById('games-installed-from-ads')!.innerHTML = ` - Installed ${userSummary.installsFromAds} apps based on those ads`;
            }).catch(error => {
                Diagnostics.trigger('user_summary_failed', error);
                document.getElementById('sorry-message')!.innerHTML = 'Sorry. We were unable to deliver our collected information at this time.';
            });
        }
    }

    private static onUserReport(campaign: Campaign, reasonKey: string, ad: AbstractAdUnit | AbstractVideoOverlay): void {
        let adType;
        let isCached;
        let finishState;

        if (ad instanceof AbstractAdUnit) {
            adType = ad.description();
            finishState = FinishState[ad.getFinishState()];
            isCached = ad.isCached();
            ad.markAsSkipped(); // Don't grant user potential reward to prevent bad reports
        } else {
            adType = campaign.getAdType();
            finishState = 'VIDEO_PROGRESS';
        }

        const error = {
            creativeId: campaign.getCreativeId(),
            reason: reasonKey,
            adType: adType,
            seatId: campaign.getSeatId(),
            finishState: finishState,
            isCached: isCached
        };
        Diagnostics.trigger('reported_ad', error);
    }

    // After the report, wait four seconds and close the ad
    private static timeoutAd(ad: AbstractAdUnit | AbstractVideoOverlay): Promise<void> {
        return new Promise(() => {
            setTimeout(() => {
                return ad.hide();
            }, 4000);
        });
    }

    public static setupReportListener(privacy: Privacy, ad: AbstractAdUnit | AbstractVideoOverlay): void {
        privacy._onReport.subscribe((campaign: Campaign, reasonKey: string) => {
            this.onUserReport(campaign, reasonKey, ad);
            this.timeoutAd(ad);
            privacy._onReport.unsubscribe();
        });
    }
}
