import MOATTemplate from 'html/MOAT.html';
import MOATContainer from 'html/moat/container.html';

import { NativeBridge } from 'Native/NativeBridge';
import { View } from 'Views/View';
import { Template } from 'Utilities/Template';

export class MOAT extends View {

    private _iframe: HTMLIFrameElement;

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'moat');
        this._template = new Template(MOATTemplate);
        this._bindings = [];
    }

    public render() {
        super.render();
        const iframe: any = this._iframe = <HTMLIFrameElement>this._container.querySelector('#moat-iframe');
        iframe.srcdoc = MOATContainer;
    }

    public init(ids: { [key: string]: string }, duration: number, url: string) {
        this._nativeBridge.Sdk.logDebug('Calling MOAT init with: ' + JSON.stringify(ids) + ' duration: ' + duration + ' url: ' + url);
        this._iframe.contentWindow.postMessage('viewable', '*');
        this._iframe.contentWindow.postMessage({
            type: 'resize',
            width: window.innerWidth,
            height: window.innerHeight
        }, '*');
        this._iframe.contentWindow.postMessage({
            type: 'init',
            data: {
                ids,
                duration,
                url
            }
        }, '*');
    }

    public triggerEvent(type: string, volume: number) {
        this._nativeBridge.Sdk.logDebug('Calling MOAT video event "' + type + '" with volume: ' + volume);
        this._iframe.contentWindow.postMessage({
            type: 'event',
            data: {
                type,
                volume
            }
        }, '*');
    }

}
