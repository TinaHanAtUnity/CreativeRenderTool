/// <amd-dependency path='text!html/EndScreen.html' name='EndScreenTemplate' />

declare var EndScreenTemplate: string;

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

    constructor(campaign: Campaign, coppaCompliant: boolean) {
        super('end-screen');
        this._coppaCompliant = coppaCompliant;

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
                listener: (event) => this.onDownloadEvent(event),
                selector: '.game-background, .btn-download, .store-button, .game-icon, .store-badge-container'
            },
            {
                event: 'click',
                listener: (event) => this.onCloseEvent(event),
                selector: '.btn-close-region'
            },
            {
                event: 'click',
                listener: (event) => this.onPrivacyEvent(event),
                selector: '.privacy-button'
            }
        ];
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
        let privacy = new Privacy(this._coppaCompliant);
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
