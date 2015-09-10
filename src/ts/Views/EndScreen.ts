/// <amd-dependency path="text!html/EndScreen.html" name="EndScreenTemplate" />
declare var EndScreenTemplate: string;

import View = require('Views/View');
import Template = require('Utilities/Template');

class EndScreen extends View {

    constructor() {
        super('end-screen');

        this._template = new Template(EndScreenTemplate);

        this._templateData = {
            "gameName": "DomiNations",
            "gameIcon": "https://lh3.ggpht.com/GQ1P4gmeM0x4qXpqF1AOSLw9rfd7KxmWo67wGGGy8CVhhf0lPTPcRuT9Sbv_75jMR8-0=w300",
            "endScreenPortrait": "http://static.everyplay.com/impact/images/18940/4f54f70f87f3375a/600.jpg",
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