/// <amd-dependency path="text!html/Overlay.html" name="OverlayTemplate" />
declare var OverlayTemplate: string;

import View from 'Views/View';
import Template from 'Utilities/Template';

export default class Overlay extends View {

    constructor() {
        super('overlay');

        this._template = new Template(OverlayTemplate);

        this._templateData = {};

        this._bindings = [
            {
                event: 'click',
                listener: this.onPlay.bind(this),
                selector: '.play-button'
            },
            {
                event: 'click',
                listener: this.onPause.bind(this),
                selector: '.pause-button'
            },
            {
                event: 'click',
                listener: this.onSkip.bind(this),
                selector: '.skip-button'
            }
        ];
    }

    private onPlay(event: Event): void {
        event.preventDefault();
        this.trigger(this._id, 'play');
    }

    private onPause(event: Event): void {
        event.preventDefault();
        this.trigger(this._id, 'pause');
    }

    private onSkip(event: Event): void {
        event.preventDefault();
        this.trigger(this._id, 'skip');
    }

}
