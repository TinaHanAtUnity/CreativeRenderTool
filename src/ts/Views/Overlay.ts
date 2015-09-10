/// <amd-dependency path="text!html/Overlay.html" name="OverlayTemplate" />
declare var OverlayTemplate: string;

import View = require('Views/View');
import Template = require('Utilities/Template');

class Overlay extends View {

    constructor() {
        super('overlay');

        this._template = new Template(OverlayTemplate);

        this._templateData = {};

        this._bindings = [
            {
                selector: '.play-button',
                event: 'click',
                listener: this.onPlay.bind(this)
            },
            {
                selector: '.pause-button',
                event: 'click',
                listener: this.onPause.bind(this)
            },
            {
                selector: '.skip-button',
                event: 'click',
                listener: this.onSkip.bind(this)
            }
        ];
    }

    private onPlay(event) {
        event.preventDefault();
        this.trigger(this._id, 'play');
    }

    private onPause(event) {
        event.preventDefault();
        this.trigger(this._id, 'pause');
    }

    private onSkip(event) {
        event.preventDefault();
        this.trigger(this._id, 'skip');
    }

}

export = Overlay;