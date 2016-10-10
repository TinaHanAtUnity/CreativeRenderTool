import EndScreenTemplate from 'html/EndScreen.html';

import { NativeBridge } from 'Native/NativeBridge';
import { View } from 'Views/View';
import { Template } from 'Utilities/Template';
import { Observable0, Observable1 } from 'Utilities/Observable';
import { Campaign } from 'Models/Campaign';
import { Privacy } from 'Views/Privacy';

export class EndScreen extends View {

    public onDownload: Observable0 = new Observable0();
    public onPrivacy: Observable1<string> = new Observable1();
    public onClose: Observable0 = new Observable0();

    private _coppaCompliant: boolean;
    private _gameName: string;

    constructor(nativeBridge: NativeBridge, campaign: Campaign, coppaCompliant: boolean) {
        super(nativeBridge, 'end-screen');
        this._coppaCompliant = coppaCompliant;
        this._gameName = campaign.getGameName();

        this._template = new Template(EndScreenTemplate);

        if (campaign) {
            let adjustedRating: number = campaign.getRating() * 20;
            this._templateData = {
                'gameName': campaign.getGameName(),
                'gameIcon': campaign.getGameIcon(),
                'endScreenLandscape': campaign.getLandscapeUrl(),
                'endScreenPortrait': campaign.getPortraitUrl(),
                'rating': adjustedRating.toString(),
                'ratingCount': campaign.getRatingCount().toString()
            };
        }

        this._bindings = [
            {
                event: 'click',
                listener: (event: Event) => this.onDownloadEvent(event),
                selector: '.game-background, .btn-download, .store-button, .game-icon, .store-badge-container'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onCloseEvent(event),
                selector: '.btn-close-region'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onPrivacyEvent(event),
                selector: '.privacy-button'
            }
        ];
    }

    public show(): void {
        super.show();

        // todo: the following hack prevents game name from overflowing to more than two lines in the endscreen
        // for some reason webkit-line-clamp is not applied without some kind of a hack
        // this is very strange because identical style works fine in 1.5
        // this is most certainly not a proper solution to this problem but without this hack, sometimes game name
        // would prevent download button from showing which completely breaks layout and monetization
        // therefore this should be treated as an emergency fix and a proper fix needs to be figured out later
        let nameContainer: HTMLElement = <HTMLElement>this._container.querySelector('.name-container');
        nameContainer.innerHTML = this._gameName + ' ';
    }

    private onDownloadEvent(event: Event): void {
        event.preventDefault();
        this.onDownload.trigger();
    }

    private onCloseEvent(event: Event): void {
        event.preventDefault();
        this.onClose.trigger();
    }

    private onPrivacyEvent(event: Event): void {
        event.preventDefault();
        let privacy = new Privacy(this._nativeBridge, this._coppaCompliant);
        privacy.render();
        document.body.appendChild(privacy.container());
        privacy.onPrivacy.subscribe((url) => {
            this.onPrivacy.trigger(url);
        });
        privacy.onClose.subscribe(() => {
            privacy.hide();
            privacy.container().parentElement.removeChild(privacy.container());
        });
    }

}
