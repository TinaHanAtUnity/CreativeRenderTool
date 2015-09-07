/// <amd-dependency path="text!html/EndScreen.html" name="EndScreenTemplate" />
declare var EndScreenTemplate: string;

import NativeBridge = require('NativeBridge');

import View = require('Views/View');
import Template = require('Utilities/Template');

class EndScreen extends View {

    private _template = new Template(EndScreenTemplate);

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge);
    }

    id() {
        return 'end-screen';
    }

    render(): HTMLElement {
        let element = super.render();
        element.innerHTML = this._template.render({
            "gameName": "DomiNations",
            "gameIcon": "https://lh3.ggpht.com/GQ1P4gmeM0x4qXpqF1AOSLw9rfd7KxmWo67wGGGy8CVhhf0lPTPcRuT9Sbv_75jMR8-0=w300",
            "endScreenPortrait": "http://static.everyplay.com/impact/images/18940/4f54f70f87f3375a/600.jpg",
        });

        let replayButton = element.getElementsByClassName("btn-watch-again-region")[0];
        replayButton.addEventListener("click", (event) => {
            event.preventDefault();
            this._nativeBridge.invoke("VideoPlayer", "seekTo", [0], (status) => {
                this._nativeBridge.invoke("VideoPlayer", "play", [], (status) => {
                    console.log("playCallback: " + status);
                    this._nativeBridge.handleEvent("VIDEOPLAYER", "REPLAY", "asdasd");
                });
            });
        }, false);

        let closeButton = element.getElementsByClassName("btn-close-region")[0];
        closeButton.addEventListener("click", (event) => {
            event.preventDefault();
            this._nativeBridge.invoke("AdUnit", "close", [], function(status) {
                console.log("closeCallback: " + status);
            });
        }, false);

        return element;
    }

    show() {

    }

    hide() {

    }

}

export = EndScreen;