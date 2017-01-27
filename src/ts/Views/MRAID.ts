import MRAIDContainer from 'html/mraid/container.html';

import { NativeBridge } from 'Native/NativeBridge';
import { View } from 'Views/View';
import { Observable0 } from 'Utilities/Observable';
import { Placement } from 'Models/Placement';
import { MRAIDCampaign } from 'Models/MRAIDCampaign';

export class MRAID extends View {

    public onClick: Observable0 = new Observable0();
    public onClose: Observable0 = new Observable0();

    private onLoaded: Observable0 = new Observable0();

    private _placement: Placement;
    private _campaign: MRAIDCampaign;

    private _iframe: HTMLIFrameElement;
    private _loaded = false;

    constructor(nativeBridge: NativeBridge, placement: Placement, campaign: MRAIDCampaign) {
        super(nativeBridge, 'mraid');

        this._placement = placement;
        this._campaign = campaign;

        this._bindings = [
            {
                event: 'click',
                listener: (event: Event) => this.onCloseEvent(event),
                selector: '.btn-close-region'
            }
        ];
    }

    public render() {
        const iframe: any = this._iframe = <HTMLIFrameElement>document.createElement('iframe');
        iframe.id = this._id;
        iframe.srcdoc = this.createMRAID();
        window.addEventListener('message', (event: MessageEvent) => this.onMessage(event), false);
        this._container = iframe;
    }

    public show(): void {
        super.show();
        if(this._loaded) {
            console.log('immediate viewable');
            this._iframe.contentWindow.postMessage('viewable', '*');
        } else {
            const observer = this.onLoaded.subscribe(() => {
                console.log('postponed viewable');
                this._iframe.contentWindow.postMessage('viewable', '*');
                this.onLoaded.unsubscribe(observer);
            });
        }
    }

    private onCloseEvent(event: Event): void {
        event.preventDefault();
        this.onClose.trigger();
    }

    private onMessage(event: MessageEvent) {
        console.dir(event);
        if(event.data === 'close') {
            this.onClose.trigger();
        } else if(event.data === 'loaded') {
            this._loaded = true;
            this.onLoaded.trigger();
        }
    }

    private createMRAID() {
        return MRAIDContainer.replace('<body></body>', '<body>' + this._campaign.getResource().replace('<script src="mraid.js"></script>', '') + '</body>');
    }

}
