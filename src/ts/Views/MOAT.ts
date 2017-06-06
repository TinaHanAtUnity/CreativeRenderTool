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

    public triggerEvent(type: string, volume: number) {
        this._iframe.contentWindow.postMessage({
            type: type,
            volume: volume
        }, '*');
    }

}
