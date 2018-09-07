import { GdprManager } from 'Ads/Managers/GdprManager';
import { Campaign } from 'Ads/Models/Campaign';
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { Template } from 'Core/Utilities/Template';
import GDPRPrivacyTemplate from 'html/GDPR-privacy.html';
import { BadAdsReporting } from 'Ads/Utilities/BadAdsReporting';

export class GDPRPrivacy extends AbstractPrivacy {

    private _optOutEnabled: boolean;
    private _gdprManager: GdprManager;
    private _personalInfoObtained: boolean = false;
    private _dataDeletionConfirmation: boolean = false;
    private _currentState : number = -1;
    private _campaign: Campaign;
    private _reportSent: boolean = false;
    private _gdprEnabled: boolean = false;

    constructor(nativeBridge: NativeBridge, campaign: Campaign, gdprManager: GdprManager, gdprEnabled: boolean, isCoppaCompliant: boolean, optOutEnabled: boolean) {
        super(nativeBridge, isCoppaCompliant, gdprEnabled, 'gdpr-privacy');

        this._template = new Template(GDPRPrivacyTemplate);
        this._gdprManager = gdprManager;
        this._campaign = campaign;
        this._gdprEnabled = gdprEnabled;
        this._optOutEnabled = optOutEnabled;

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
                listener: (event: Event) => this.onReportAd(),
                selector: '.report-button'
            }
        ];
    }

    public show(): void {
        super.show();
        this.editPopupPerUser();

        const agreeRadioButton = <HTMLInputElement>this._container.querySelector('#gdpr-agree-radio');
        agreeRadioButton.onclick = () => {
            const confirmationContainer = <HTMLSpanElement>document.getElementById('data-deletion-container');
            confirmationContainer.classList.remove('active');

            const requestContainer = <HTMLSpanElement>document.getElementById('data-deletion-request-container');
            requestContainer.classList.remove('active');

            this._dataDeletionConfirmation = false;
        };
    }

    public render(): void {
        super.render();

        if (this._gdprEnabled) {
            const elId = this._optOutEnabled ? 'gdpr-refuse-radio' : 'gdpr-agree-radio';

            const activeRadioButton = <HTMLInputElement>this._container.querySelector(`#${elId}`);
            activeRadioButton.checked = true;
        }

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

    private editPopupPerUser() {
        if (this._gdprEnabled && !this._personalInfoObtained) {
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

    private onStateClick(event: Event, isLeftClick: boolean): void {
        event.preventDefault();
        this.setCardState(isLeftClick);
    }

    private onReportAd(): void {
        if (!this._reportSent) {
            const checkedReportButton = <HTMLElement>this._container.querySelector('.report-choice-radio:checked');
            const reportText = this._container.querySelector('.report-confirmed-text');
            if (checkedReportButton && checkedReportButton.id) {
                this._reportSent = true;
                this.handleReportText(true, reportText);
                BadAdsReporting.onUserReport(this._campaign, checkedReportButton.id);
            } else {
                this.handleReportText(false, reportText);
            }
        }
    }

    private handleReportText(checked: boolean, reportText: Element | null) {
        if (reportText) {
            if (checked) {
                reportText.innerHTML = 'Thank you for taking the time to improve Unity Ads. Your Ad Experience will close shortly.';
                if (!reportText.classList.contains('active')) {
                    reportText.classList.toggle('active');
                }
            } else {
                reportText.innerHTML = 'Please select an option from the list above.';
                reportText.classList.toggle('active');
            }
        }
    }

    // State 0: Privacy info - Left: Build info - Middle: Report Ad
    // State 1: Build info - Left: Privacy info - Middle: Report Ad
    // State 2: Report Ad - Left: Privacy info - Middle: Build info
    private setCardState(isLeftClick: boolean) {

        const leftEl = <HTMLDivElement>this._container.querySelector('.left-side-link');
        const middleEl = <HTMLDivElement>this._container.querySelector('.middle-link');
        const classList = this._container.classList;
        const rCard = 'Report Ad ⚑';
        const pCard = 'Privacy info';
        const bCard = 'Build info';

        switch(this._currentState) {

            // Privacy info showing
            case 0: {
                leftEl.innerText = pCard;
                if (isLeftClick) {
                    this._currentState = 1;
                    middleEl.innerText = rCard;
                    classList.add('build');
                } else {
                    this._currentState = 2;
                    middleEl.innerText = bCard;
                    classList.add('report');
                }
                break;
            }
            // Build info showing
            case 1: {
                classList.remove('build');
                if (isLeftClick) {
                    this._currentState = 0;
                    leftEl.innerText = bCard;
                    middleEl.innerText = rCard;
                } else {
                    this._currentState = 2;
                    leftEl.innerText = pCard;
                    middleEl.innerText = bCard;
                    classList.add('report');
                }
                break;
            }
            // Report Ad showing
            case 2: {
                classList.remove('report');
                middleEl.innerText = rCard;
                if (isLeftClick) {
                    this._currentState = 0;
                    leftEl.innerText = bCard;
                } else {
                    this._currentState = 1;
                    leftEl.innerText = pCard;
                    classList.add('build');
                }
                break;
            }
            // Initial Configuration
            default: {
                this._currentState = 0;
                leftEl.innerText = bCard;
                middleEl.innerText = rCard;
            }
        }
    }
}
