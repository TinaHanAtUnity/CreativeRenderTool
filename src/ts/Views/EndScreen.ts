/// <amd-dependency path='text!html/EndScreen.html' name='EndScreenTemplate' />
declare var EndScreenTemplate: string;

import { View } from 'Views/View';
import { Template } from 'Utilities/Template';

import { AdUnit } from 'Models/AdUnit';

export class EndScreen extends View {

    private _adUnit: AdUnit;

    constructor(adUnit: AdUnit) {
        super('end-screen');

        this._adUnit = adUnit;

        this._template = new Template(EndScreenTemplate);

        let adjustedRating: number = adUnit.getCampaign().getRating() * 20 - 2;
        this._templateData = {
            'gameName': adUnit.getCampaign().getGameName(),
            'gameIcon': adUnit.getCampaign().getGameIcon(),
            'endScreenLandscape': adUnit.getCampaign().getLandscapeUrl(),
            'endScreenPortrait': adUnit.getCampaign().getPortraitUrl(),
            'rating': adjustedRating.toString(),
            'ratingCount': adUnit.getCampaign().getRatingCount().toString()
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
        this.trigger('download', this._adUnit);
    }

    private onReplay(event: Event): void {
        event.preventDefault();
        this.trigger('replay', this._adUnit);
    }

    private onClose(event: Event): void {
        event.preventDefault();
        this.trigger('close', this._adUnit);
    }

}
