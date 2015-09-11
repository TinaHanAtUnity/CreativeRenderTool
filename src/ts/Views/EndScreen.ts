/// <amd-dependency path="text!html/EndScreen.html" name="EndScreenTemplate" />
declare var EndScreenTemplate: string;

import View = require('Views/View');
import Template = require('Utilities/Template');

import Campaign = require('Models/Campaign');

class EndScreen extends View {

    constructor(campaign: Campaign) {
        super('end-screen');

        this._template = new Template(EndScreenTemplate);

        this._templateData = {
            "gameName": campaign.getGameName(),
            "gameIcon": campaign.getGameIcon(),
            "endScreenPortrait": campaign.getPortraitUrl(),
        };

        this._bindings = [
            {
                selector: '.btn-watch-again-region',
                event: 'click',
                listener: this.onReplay.bind(this)
            },
            {
                selector: '.btn-close-region',
                event: 'click',
                listener: this.onClose.bind(this)
            }
        ];
    }

    private onReplay(event) {
        event.preventDefault();
        this.trigger(this._id, 'replay');
    }

    private onClose(event) {
        event.preventDefault();
        this.trigger(this._id, 'close');
    }

}

export = EndScreen;