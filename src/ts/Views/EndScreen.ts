/// <amd-dependency path='text!html/EndScreen.html' name='EndScreenTemplate' />
import {Observable0} from 'Utilities/Observable';
declare var EndScreenTemplate: string;

import { View } from 'Views/View';
import { Template } from 'Utilities/Template';

import {Campaign} from "../Models/Campaign";

export class EndScreen extends View {

    public onDownload: Observable0 = new Observable0();
    public onReplay: Observable0 = new Observable0();
    public onClose: Observable0 = new Observable0();

    constructor(campaign: Campaign) {
        super('end-screen');

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
                listener: this.onDownloadEvent.bind(this),
                selector: '.game-background, .btn-download, .store-button, .game-icon, .store-badge-container'
            },
            {
                event: 'click',
                listener: this.onReplayEvent.bind(this),
                selector: '.btn-watch-again-region'
            },
            {
                event: 'click',
                listener: this.onCloseEvent.bind(this),
                selector: '.btn-close-region'
            }
        ];
    }

    private onDownloadEvent(event: Event): void {
        event.preventDefault();
        this.onDownload.trigger();
    }

    private onReplayEvent(event: Event): void {
        event.preventDefault();
        this.onReplay.trigger();
    }

    private onCloseEvent(event: Event): void {
        event.preventDefault();
        this.onClose.trigger();
    }

}
