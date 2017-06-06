import MOATTemplate from 'html/MOAT.html';
import MOATContainer from 'html/moat/container.html';

import { NativeBridge } from 'Native/NativeBridge';
import { View } from 'Views/View';
import { Template } from 'Utilities/Template';

export class MOAT extends View {

    private _iframe: HTMLIFrameElement;

    private _messageListener: any;

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'moat');
        this._template = new Template(MOATTemplate);
        this._bindings = [];
    }

    public render() {
        super.render();

        const iframe: any = this._iframe = <HTMLIFrameElement>this._container.querySelector('#moat-iframe');
        iframe.srcdoc = MOATContainer;

        this._messageListener = (event: MessageEvent) => this.onMessage(event);
        window.addEventListener('message', this._messageListener, false);
    }

    public show(): void {
        super.show();
    }

    public hide() {
        if(this._messageListener) {
            window.removeEventListener('message', this._messageListener, false);
            this._messageListener = undefined;
        }
        super.hide();
    }

    private onMessage(event: MessageEvent) {
        switch(event.data.type) {
            default:
                break;
        }
    }

}
