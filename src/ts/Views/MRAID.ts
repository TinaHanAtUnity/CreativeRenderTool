import MRAIDContainer from 'html/mraid/container.html';

import { NativeBridge } from 'Native/NativeBridge';
import { View } from 'Views/View';
import { Observable0 } from 'Utilities/Observable';
import { HtmlCampaign } from 'Models/HtmlCampaign';
import { Placement } from 'Models/Placement';
import { Template } from 'Utilities/Template';

export class MRAID extends View {

    public onClick: Observable0 = new Observable0();
    public onClose: Observable0 = new Observable0();

    private _placement: Placement;
    private _campaign: HtmlCampaign;

    constructor(nativeBridge: NativeBridge, placement: Placement, campaign: HtmlCampaign) {
        super(nativeBridge, 'mraid');

        this._placement = placement;
        this._campaign = campaign;
        this._template = new Template(MRAIDContainer);

        this._bindings = [
            {
                event: 'click',
                listener: (event: Event) => this.onCloseEvent(event),
                selector: '.btn-close-region'
            }
        ];
    }

    public render() {
        super.render();
    }

    public show(): void {
        super.show();
    }

    private onCloseEvent(event: Event): void {
        event.preventDefault();
        this.onClose.trigger();
    }

}
