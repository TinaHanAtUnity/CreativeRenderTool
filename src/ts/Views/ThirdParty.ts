import ThirdPartyTemplate from 'html/ThirdParty.html';

import { NativeBridge } from 'Native/NativeBridge';
import { View } from 'Views/View';
import { Template } from 'Utilities/Template';
import { Observable0 } from 'Utilities/Observable';
import { HtmlCampaign } from 'Models/HtmlCampaign';
import { Placement } from 'Models/Placement';

export class ThirdParty extends View {

    public onClose: Observable0 = new Observable0();

    private _placement: Placement;
    private _campaign: HtmlCampaign;

    private _closeElement: HTMLElement;

    constructor(nativeBridge: NativeBridge, placement: Placement, campaign: HtmlCampaign) {
        super(nativeBridge, 'empty');

        this._placement = placement;
        this._campaign = campaign;

        this._template = new Template(ThirdPartyTemplate);
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
        this._closeElement = <HTMLElement>this._container.querySelector('.btn-close-region');
        this._closeElement.style.display = 'none';
    }

    public show(): void {
        super.show();

        if(this._placement.allowSkip()) {
            this._closeElement.style.display = 'block';
        } else {
            setTimeout(() => {
                this._closeElement.style.display = 'block';
            }, 15000);
        }

        const iframe = <HTMLIFrameElement>this._container.querySelector('#thirdParty');
        iframe.src = this._campaign.getResource();

        window.addEventListener('message', (event: MessageEvent) => {
            if(event.data) {
                this._nativeBridge.Intent.launch({
                    'action': 'android.intent.action.VIEW',
                    'uri': event.data
                });
            }
        }, false);

        window.addEventListener('resize', (event: Event) => {
            iframe.contentWindow.postMessage({
                innerWidth: window.innerWidth,
                innerHeight: window.innerHeight
            }, '*');
        }, false);
    }

    private onCloseEvent(event: Event): void {
        event.preventDefault();
        this.onClose.trigger();
    }

}
