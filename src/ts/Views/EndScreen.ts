/// <amd-dependency path='text!html/EndScreen.html' name='EndScreenTemplate' />
declare var EndScreenTemplate: string;

import { View } from 'Views/View';
import { Template } from 'Utilities/Template';
import { Observable0 } from 'Utilities/Observable';
import { Campaign } from 'Models/Campaign';
import { Vast } from 'Models/Vast';

export class EndScreen extends View {

    public onDownload: Observable0 = new Observable0();
    public onReplay: Observable0 = new Observable0();
    public onClose: Observable0 = new Observable0();

    constructor(campaign: Campaign, vast: Vast) {
        super('end-screen');

        this._template = new Template(EndScreenTemplate);

        if (campaign) {
            let adjustedRating: number = campaign.getRating() * 20 - 2;
            this._templateData = {
                'gameName': campaign.getGameName(),
                'gameIcon': campaign.getGameIcon(),
                'endScreenLandscape': campaign.getLandscapeUrl(),
                'endScreenPortrait': campaign.getPortraitUrl(),
                'rating': adjustedRating.toString(),
                'ratingCount': campaign.getRatingCount().toString()
            };
        } else {
            // TODO where do we get this from for VAST?
            this._templateData = {
                'gameName': 'Unknown',
                'gameIcon': 'Unknown',
                'endScreenLandscape': 'http://madewith.unity.com/sites/default/files/styles/unity_mwu_front_banner/public/game-article/header-image-desktop/storyheaderimage.jpg',
                'endScreenPortrait': 'http://madewith.unity.com/sites/default/files/styles/unity_mwu_front_banner/public/game-article/header-image-desktop/storyheaderimage.jpg',
                'rating': '5',
                'ratingCount': '12345'
            };
        }

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
