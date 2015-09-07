/// <amd-dependency path="text!html/Overlay.html" name="OverlayTemplate" />
declare var OverlayTemplate: string;

import View = require('Views/View');
import Template = require('Utilities/Template');

import NativeBridge = require('NativeBridge');

class Overlay extends View {

    private _template = new Template(OverlayTemplate);

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge);
    }

    id() {
        return 'overlay';
    }

    render(): HTMLElement {
        let element = super.render();
        element.innerHTML = this._template.render({});

        let playButton = element.getElementsByClassName("play-button")[0];
        playButton.addEventListener('click', (event) => {
            event.preventDefault();
            this._nativeBridge.invoke("VideoPlayer", "play", [], (status) => {
                console.log('playCallback: ' + status);
            });
        }, false);

        let pauseButton = element.getElementsByClassName("pause-button")[0];
        pauseButton.addEventListener('click', (event) => {
            event.preventDefault();
            this._nativeBridge.invoke("VideoPlayer", "pause", [], (status) => {
                console.log('pauseCallback:' + status);
            });
        }, false);

        let skipButton = element.getElementsByClassName("skip-button")[0];
        skipButton.addEventListener('click', (event) => {
            event.preventDefault();
            this._nativeBridge.invoke("VideoPlayer", "pause", [], (status) => {
                console.log('stopCallback:' + status);
                this._nativeBridge.handleEvent("VIDEOPLAYER", "COMPLETED", "asdasd");
            });
        }, false);

        return element;
    }

    show() {

    }

    hide() {

    }

}

export = Overlay;