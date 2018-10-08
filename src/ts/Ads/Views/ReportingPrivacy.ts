import { GdprManager } from 'Ads/Managers/GdprManager';
import { Campaign } from 'Ads/Models/Campaign';
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Observable2 } from 'Core/Utilities/Observable';
import { Template } from 'Core/Utilities/Template';
import ReportingPrivacyTemplate from 'html/Reporting-privacy.html';
import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { AbstractVideoOverlay } from 'Ads/Views/AbstractVideoOverlay';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { FinishState } from 'Core/Constants/FinishState';

enum PrivacyCardState {
    INITIAL,
    PRIVACY,
    BUILD,
    REPORT
}

enum BadAdReason {
    OFFENSIVE = 'Ad is very offensive',
    NEVER_STARTED = 'Ad did not start',
    WONT_END = 'Ad will not close',
    MALFORMED = 'Ad does not look right',
    OTHER = 'Other'
}

export class ReportingPrivacy extends AbstractPrivacy {

    private _onReport: Observable2<Campaign, string> = new Observable2();
    private _gdprManager: GdprManager;
    private _dataDeletionConfirmation: boolean = false;
    private _currentState : number = -1;
    private _campaign: Campaign;
    private _reportSent: boolean = false;
    private _gdprEnabled: boolean = false;
    private _personalInfoObtained: boolean = false;

    constructor(nativeBridge: NativeBridge, campaign: Campaign,
                gdprManager: GdprManager, gdprEnabled: boolean,
                isCoppaCompliant: boolean) {

        super(nativeBridge, isCoppaCompliant, gdprEnabled, 'reporting-privacy');
        this._templateData.badAdKeys = Object.keys(BadAdReason);
        this._templateData.badAdReasons = (<string[]>(<any>Object).values(BadAdReason));

        this._template = new Template(ReportingPrivacyTemplate);
        this._campaign = campaign;
        this._gdprEnabled = gdprEnabled;
        this._gdprManager = gdprManager;

        this._bindings = [
            {
                event: 'click',
                listener: (event: Event) => this.onPrivacyEvent(event),
                selector: 'a'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onStateClick(event, true),
                selector: '.left-side-link'
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
                listener: (event: Event) => this.onStateClick(event, false),
                selector: '.middle-link'
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
        if (this._gdprEnabled) {
            this.editPopupPerUser();
            const elId = this._gdprManager.isOptOutEnabled() ? 'gdpr-refuse-radio' : 'gdpr-agree-radio';

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

    public render(): void {
        super.render();
        this.setCardState(false);
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

    private onStateClick(event: Event, isLeftClick: boolean): void {
        event.preventDefault();
        this.setCardState(isLeftClick);
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

    private setCardState(isLeftClick: boolean) {

        const leftEl = <HTMLDivElement>this._container.querySelector('.left-side-link');
        const middleEl = <HTMLDivElement>this._container.querySelector('.middle-link');
        const classList = this._container.classList;
        const rCard = 'Report Ad ⚑';
        const pCard = 'Privacy info 👁';
        const bCard = 'Build info ⚙';

        switch(this._currentState) {

            // Privacy info showing
            case PrivacyCardState.PRIVACY: {
                leftEl.innerText = pCard;
                if (isLeftClick) {
                    this._currentState = PrivacyCardState.BUILD;
                    middleEl.innerText = rCard;
                    classList.add('build');
                } else {
                    this._currentState = PrivacyCardState.REPORT;
                    middleEl.innerText = bCard;
                    classList.add('report');
                }
                break;
            }
            // Build info showing
            case PrivacyCardState.BUILD: {
                classList.remove('build');
                if (isLeftClick) {
                    this._currentState = PrivacyCardState.PRIVACY;
                    leftEl.innerText = bCard;
                    middleEl.innerText = rCard;
                } else {
                    this._currentState = PrivacyCardState.REPORT;
                    leftEl.innerText = pCard;
                    middleEl.innerText = bCard;
                    classList.add('report');
                }
                break;
            }
            // Report Ad showing
            case PrivacyCardState.REPORT: {
                classList.remove('report');
                middleEl.innerText = rCard;
                if (isLeftClick) {
                    this._currentState = PrivacyCardState.PRIVACY;
                    leftEl.innerText = bCard;
                } else {
                    this._currentState = PrivacyCardState.BUILD;
                    leftEl.innerText = pCard;
                    classList.add('build');
                }
                break;
            }
            // Initial Configuration
            default: {
                this._currentState = PrivacyCardState.PRIVACY;
                leftEl.innerText = bCard;
                middleEl.innerText = rCard;
            }
        }
    }

    private editPopupPerUser() {
        if (!this._personalInfoObtained) {
            this._gdprManager.retrievePersonalInformation().then((personalProperties) => {
                this._personalInfoObtained = true;
                document.getElementById('sorry-message')!.innerHTML = ''; // Clear sorry message on previous failed request
                document.getElementById('phone-type')!.innerHTML = ` - Using ${personalProperties.deviceModel}.`;
                document.getElementById('country')!.innerHTML = ` - Playing in ${personalProperties.country}.`;
                document.getElementById('game-plays-this-week')!.innerHTML = ` - Played this game ${personalProperties.gamePlaysThisWeek} times this week.`;
                document.getElementById('ads-seen-in-game')!.innerHTML = ` - Seen ${personalProperties.adsSeenInGameThisWeek} ads in this game.`;
                document.getElementById('games-installed-from-ads')!.innerHTML = ` - Installed ${personalProperties.installsFromAds} games based on those ads.`;
            }).catch(error => {
                Diagnostics.trigger('gdpr_personal_info_failed', error);
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
            sessionId: campaign.getSession().getId(),
            reason: reasonKey,
            adType: adType,
            seatId: campaign.getSeatId(),
            finishState: finishState,
            isCached: isCached,
            adPlan: campaign.getSession().getAdPlan()
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

    public static setupReportListener(privacy: ReportingPrivacy, ad: AbstractAdUnit | AbstractVideoOverlay): void {
        privacy._onReport.subscribe((campaign: Campaign, reasonKey: string) => {
            this.onUserReport(campaign, reasonKey, ad);
            this.timeoutAd(ad);
            privacy._onReport.unsubscribe();
        });
    }
}
