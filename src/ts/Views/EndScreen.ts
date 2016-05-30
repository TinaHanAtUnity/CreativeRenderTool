/// <amd-dependency path='text!html/EndScreen.html' name='EndScreenTemplate' />
declare var EndScreenTemplate: string;

import { View } from 'Views/View';
import { Template } from 'Utilities/Template';
import { Observable0 } from 'Utilities/Observable';
import { Campaign } from 'Models/Campaign';

export class EndScreen extends View {

    public onDownload: Observable0 = new Observable0();
    public onClose: Observable0 = new Observable0();

    constructor(campaign: Campaign) {
        super('end-screen');

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

}
