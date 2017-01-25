import MRAIDContainer from 'html/mraid/container.html';

import { NativeBridge } from 'Native/NativeBridge';
import { View } from 'Views/View';
import { Observable0 } from 'Utilities/Observable';
import { Placement } from 'Models/Placement';
import { MRAIDCampaign } from 'Models/MRAIDCampaign';

export class MRAID extends View {

    public onClick: Observable0 = new Observable0();
    public onClose: Observable0 = new Observable0();

    private _placement: Placement;
    private _campaign: MRAIDCampaign;

    private _iframe: HTMLIFrameElement;

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
        iframe.srcdoc = MRAIDContainer;
        this._container = iframe;
    }

    public show(): void {
        super.show();
        console.log('showing');
        setTimeout(() => {
            if(this._campaign.getResource()) {
                console.log('posting data');
                this._iframe.contentWindow.postMessage({
                    data: this._campaign.getResource()
                }, '*');
            } else if(this._campaign.getResourceUrl()) {
                console.log('posting url');
                this._iframe.contentWindow.postMessage({
                    url: this._campaign.getResourceUrl()
                }, '*');
            }
        }, 5000); // todo: fix temp timer to wait for iframe ready
    }

    private onCloseEvent(event: Event): void {
        event.preventDefault();
        this.onClose.trigger();
    }

}
