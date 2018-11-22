import { View } from 'Core/Views/View';
import PrivacyRowItemContainerTemplate from 'html/consent/privacy-row-item-container.html';
import { Template } from 'Core/Utilities/Template';
import { Platform } from 'Core/Constants/Platform';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { GdprManager } from 'Ads/Managers/GdprManager';

interface IPrivacyInfoContainerHandler {
}

interface IRowItemContainerParams {
    platform: Platform;
    gdprManager: GdprManager;
}

export class PrivacyRowItemContainer extends View<IPrivacyInfoContainerHandler> {

    private _gdprManager: GdprManager;

    constructor(parameters: IRowItemContainerParams) {
        super(parameters.platform, 'privacy-row-item-container');

        this._gdprManager = parameters.gdprManager;
        this._template = new Template(PrivacyRowItemContainerTemplate);

        this._bindings = [
            {
                event: 'click',
                listener: (event: Event) => this.onWhatWeCollectEvent(event),
                selector: '.what-we-collect'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onDataProtectionEvent(event),
                selector: '.data-protection'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onThirdPartyEvent(event),
                selector: '.third-party'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onPrivacyPolicyEvent(event),
                selector: '.privacy-policy'
            }
        ];
    }

    public show(): void {
        super.show();

        this.fillPersonalInfoFields();
    }

    private fillPersonalInfoFields(): void {
        console.log('fillPersonalInfoFields');
        // todo: manager class should check is the information already available to avoid extra requests
        this._gdprManager.retrievePersonalInformation().then((personalProperties) => {
            document.getElementById('sorry-message')!.innerHTML = ''; // Clear sorry message on previous failed request
            document.getElementById('phone-type')!.innerHTML = `Using ${personalProperties.deviceModel}`;
            document.getElementById('country')!.innerHTML = `Located in ${personalProperties.country}`;
            document.getElementById('game-plays-this-week')!.innerHTML = `Used this app ${personalProperties.gamePlaysThisWeek} times this week`;
            document.getElementById('ads-seen-in-game')!.innerHTML = `Seen ${personalProperties.adsSeenInGameThisWeek} ads in this app`;
            document.getElementById('games-installed-from-ads')!.innerHTML = `Installed ${personalProperties.installsFromAds} apps based on those ads`;
        }).catch(error => {
            console.log('fillPersonalInfoFields error: ' + JSON.stringify(error));
            Diagnostics.trigger('gdpr_personal_info_failed', error);
            document.getElementById('sorry-message')!.innerHTML = 'Sorry. We were unable to deliver our collected information at this time.';
        });
    }

    private onWhatWeCollectEvent(event: Event): void {
        event.preventDefault();
        // if (event.srcElement!.parentElement) {
        //     event.srcElement!.parentElement!.classList.add('show-description');
        // }
        const element = this._container.querySelector('.what-we-collect');
        this.toggleDescription(element);
    }

    private onDataProtectionEvent(event: Event): void {
        event.preventDefault();

        const element = this._container.querySelector('.data-protection');
        this.toggleDescription(element);
    }

    private onThirdPartyEvent(event: Event): void {
        event.preventDefault();

        const element = this._container.querySelector('.third-party');
        this.toggleDescription(element);
    }

    private onPrivacyPolicyEvent(event: Event): void {
        event.preventDefault();

        const element = this._container.querySelector('.privacy-policy');
        this.toggleDescription(element);
    }

    private toggleDescription(element: Element | null) {
        if (element && element.parentElement) {
            if (element.parentElement.classList.contains('show-description')) {
                element.parentElement.classList.remove('show-description');
            } else {
                element.parentElement.classList.add('show-description');
            }
        }
    }
}
