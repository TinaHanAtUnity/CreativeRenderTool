import { NativeBridge } from 'Native/NativeBridge';

import GDPRPrivacyTemplate from 'html/GDPR-privacy.html';
import { AbstractPrivacy } from 'Views/AbstractPrivacy';
import { Template } from 'Utilities/Template';
import { GdprManager } from 'Managers/GdprManager';
import { Diagnostics } from 'Utilities/Diagnostics';

export class GDPRPrivacy extends AbstractPrivacy {

    private _optOutEnabled: boolean;
    private _gdprManager: GdprManager;
    private _isCoppaCompliant: boolean;
    private _personalInfoObtained: boolean = false;
    private _dataDeletionConfirmation: boolean = false;

    constructor(nativeBridge: NativeBridge, gdprManager: GdprManager, isCoppaCompliant: boolean, optOutEnabled: boolean) {
        super(nativeBridge, isCoppaCompliant, 'gdpr-privacy');

        this._template = new Template(GDPRPrivacyTemplate);
        this._gdprManager = gdprManager;
        this._isCoppaCompliant = isCoppaCompliant;

        this._optOutEnabled = optOutEnabled;

        this._bindings = [
            {
                event: 'click',
                listener: (event: Event) => this.onPrivacyEvent(event),
                selector: 'a'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onLeftSideClick(event),
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
                listener: (event: Event) => this.onMiddleLinkClick(event),
                selector: '.middle-link'
            }
        ];
    }

    public show(): void {
        super.show();
        this.editPopupPerUser();
        this.setCardState();

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

        const elId = this._optOutEnabled ? 'gdpr-refuse-radio' : 'gdpr-agree-radio';

        const activeRadioButton = <HTMLInputElement>this._container.querySelector(`#${elId}`);
        activeRadioButton.checked = true;

        this.setCardState();
    }

    protected onCloseEvent(event: Event): void {
        event.preventDefault();
        const gdprReduceRadioButton = <HTMLInputElement>this._container.querySelector('#gdpr-refuse-radio');
        this._handlers.forEach(handler => handler.onGDPROptOut(gdprReduceRadioButton.checked || this._dataDeletionConfirmation));
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
        if (this._isCoppaCompliant) {
            document.getElementById('coppaTag1')!.innerHTML = 'Per request of this app’s publisher, we do not combine the data from this app with data from any other apps.';
            document.getElementById('coppaTag2')!.innerHTML = 'While these partners generally collect information about your advertising ID from sources other than Unity, Unity does not provide your advertising ID to these third-parties for ads served in this app.';
        } else {
            // Add nothing for coppaTag1
            document.getElementById('coppaTag2')!.innerHTML = 'These partners may collect information about your advertising ID from sources other than Unity to further personalize the ads you see. Please visit the privacy policies of these third parties to review the compiled data they may have.';
        }

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

    private onLeftSideClick(event: Event): void {
        event.preventDefault();
        const buildInformationActive = this._container.classList.contains('build');
        this.setCardState(!buildInformationActive);
    }

    private setCardState(isFlipped: boolean = false): void {
        const linkEL = <HTMLDivElement>this._container.querySelector('.left-side-link');
        if (isFlipped) {
            linkEL.innerText = 'Privacy info';
            this._container.classList.add('build');
        } else {
            linkEL.innerText = 'Build info';
            this._container.classList.remove('build');
        }
    }

    private onMiddleLinkClick(event: Event): void {
        event.preventDefault();
        const middleLink = <HTMLDivElement>this._container.querySelector('.middle-link');
    }
}
