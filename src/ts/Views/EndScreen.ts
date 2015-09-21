/// <amd-dependency path='text!html/EndScreen.html' name='EndScreenTemplate' />
declare var EndScreenTemplate: string;

import View from 'Views/View';
import Template from 'Utilities/Template';

import Zone from 'Models/Zone';
import Campaign from 'Models/Campaign';

export default class EndScreen extends View {

    private _zone: Zone = null;
    private _campaign: Campaign = null;

    constructor(zone: Zone, campaign: Campaign) {
        super('end-screen');

        this._zone = zone;
        this._campaign = campaign;

        this._template = new Template(EndScreenTemplate);

        let adjustedRating: number = campaign.getRating() * 20 - 2;
        this._templateData = {
            'gameName': campaign.getGameName(),
            'gameIcon': campaign.getGameIcon(),
            'endScreenLandscape': campaign.getLandscapeUrl(),
            'endScreenPortrait': campaign.getPortraitUrl(),
            'rating': adjustedRating.toString(),
            'ratingCount': campaign.getRatingCount().toString()
        };

        this._bindings = [
            {
                event: 'click',
                listener: this.onDownload.bind(this),
                selector: '.game-background, .btn-download, .store-button, .game-icon, .store-badge-container'
            },
            {
                event: 'click',
                listener: this.onReplay.bind(this),
                selector: '.btn-watch-again-region'
            },
            {
                event: 'click',
                listener: this.onClose.bind(this),
                selector: '.btn-close-region'
            }
        ];
    }

    private onDownload(event: Event): void {
        event.preventDefault();
        this.trigger(this._id, 'download', this._zone, this._campaign);
    }

    private onReplay(event: Event): void {
        event.preventDefault();
        this.trigger(this._id, 'replay', this._zone, this._campaign);
    }

    private onClose(event: Event): void {
        event.preventDefault();
        this.trigger(this._id, 'close', this._zone, this._campaign);
    }

}
