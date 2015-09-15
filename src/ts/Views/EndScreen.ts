/// <amd-dependency path='text!html/EndScreen.html' name='EndScreenTemplate' />
declare var EndScreenTemplate: string;

import View from 'Views/View';
import Template from 'Utilities/Template';

import Campaign from 'Models/Campaign';

export default class EndScreen extends View {

    constructor(campaign: Campaign) {
        super('end-screen');

        this._template = new Template(EndScreenTemplate);

        this._templateData = {
            'gameName': campaign.getGameName(),
            'gameIcon': campaign.getGameIcon(),
            'endScreenLandscape': campaign.getLandscapeUrl(),
            'endScreenPortrait': campaign.getPortraitUrl(),
            'rating': campaign.getRating() * 20 - 2,
            'ratingCount': campaign.getRatingCount()
        };

        this._bindings = [
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

    private onReplay(event: Event): void {
        event.preventDefault();
        this.trigger(this._id, 'replay');
    }

    private onClose(event: Event): void {
        event.preventDefault();
        this.trigger(this._id, 'close');
    }

}
