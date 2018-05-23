import { NativeBridge } from 'Native/NativeBridge';

import GDPRPrivacyTemplate from 'html/GDPR-privacy.html';
import { AbstractPrivacy } from 'Views/AbstractPrivacy';
import { Template } from 'Utilities/Template';
import { GdprConsentManager, IGdprPersonalProperties } from 'Managers/GdprConsentManager';
import { Diagnostics } from 'Utilities/Diagnostics';

export class GDPRPrivacy extends AbstractPrivacy {

    private _optOutEnabled: boolean;
    private _gdprConsentManager: GdprConsentManager;
    private _isCoppaCompliant: boolean;

    constructor(nativeBridge: NativeBridge, gdprConsentManager: GdprConsentManager, isCoppaCompliant: boolean, optOutEnabled: boolean) {
        super(nativeBridge, isCoppaCompliant, 'gdpr-privacy');

        this._template = new Template(GDPRPrivacyTemplate);
        this._gdprConsentManager = gdprConsentManager;
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
            }
        ];
    }

    public show(): void {
        super.show();
        this.editPopupPerUser();
        this.setCardState();
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
        const gdprRefuceRadioButton = <HTMLInputElement>this._container.querySelector('#gdpr-refuse-radio');
        this._handlers.forEach(handler => handler.onGDPROptOut(gdprRefuceRadioButton.checked));
        this._handlers.forEach(handler => handler.onPrivacyClose());
    }

    protected onPrivacyEvent(event: Event): void {
        event.preventDefault();
        this._handlers.forEach(handler => handler.onPrivacy((<HTMLLinkElement>event.target).href));
    }

    private editPopupPerUser() {
        if (this._isCoppaCompliant) {
            document.getElementById('coppaTag1')!.innerHTML = 'Per request of this app’s publisher, we do not combine the data from this app with data from any other apps.';
            document.getElementById('coppaTag2')!.innerHTML = 'While these partners generally collect information about your advertising ID from sources other than Unity, Unity does not provide your advertising ID to these third-parties for ads served in this app.';
        } else {
            // Add nothing for coppaTag1
            document.getElementById('coppaTag2')!.innerHTML = 'These partners may collect information about your advertising ID from sources other than Unity to further personalize the ads you see. Please visit the privacy policies of these third parties to review the compiled data they may have.';
        }

        this._gdprConsentManager.retrievePersonalInformation().then((personalProperties) => {
            document.getElementById('phone-type')!.innerHTML = ` - Using ${personalProperties.device}.`;
            document.getElementById('country')!.innerHTML = ` - Playing in ${personalProperties.country}.`;
            document.getElementById('game-plays-this-week')!.innerHTML = ` - Played this game ${personalProperties.gamePlaysThisWeek} times this week.`;
            document.getElementById('ads-seen-in-game')!.innerHTML = ` - Seen ${personalProperties.adsSeenInGameThisWeek} ads in this game.`;
            document.getElementById('games-installed-from-ads')!.innerHTML = ` - Installed ${personalProperties.installsFromAds} games based on those ads.`;
        }).catch(error => {
            Diagnostics.trigger('gdpr_personal_info_failed', {});
            // Reuse phoneType div for message
            document.getElementById('sorry-message')!.innerHTML = `Sorry. We were unable to provide this rest of our collected information at this time.`;
        });
    }

    private onLeftSideClick(event: Event): void {
        event.preventDefault();
        const buildInformationActive = this._container.classList.contains('flip');
        this.setCardState(!buildInformationActive);
    }

    private setCardState(isFlipped: boolean = false): void {
        const linkEL = <HTMLDivElement>this._container.querySelector('.left-side-link');
        if (isFlipped) {
            linkEL.innerText = 'Privacy info';
            this._container.classList.add('flip');
        } else {
            linkEL.innerText = 'Build info';
            this._container.classList.remove('flip');
        }
    }
}
