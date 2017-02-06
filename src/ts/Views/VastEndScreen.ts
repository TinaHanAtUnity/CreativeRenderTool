import VastEndScreenTemplate from 'html/VastEndScreen.html';

import { NativeBridge } from 'Native/NativeBridge';
import { View } from 'Views/View';
import { Template } from 'Utilities/Template';
import { Observable0 } from 'Utilities/Observable';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { VastCampaign } from 'Models/Vast/VastCampaign';

export class VastEndScreen extends View {

    public onClick: Observable0 = new Observable0();
    public onClose: Observable0 = new Observable0();

    constructor(nativeBridge: NativeBridge, campaign: VastCampaign) {
        super(nativeBridge, 'end-screen');

        this._template = new Template(VastEndScreenTemplate);

        if(campaign) {
            const landscape = campaign.getLandscape();
            const portrait = campaign.getPortrait();

            this._templateData = {
                'endScreenLandscape': (landscape ? landscape.getUrl() : (portrait ? portrait.getUrl() : undefined)),
                'endScreenPortrait': (portrait ? portrait.getUrl() : (landscape ? landscape.getUrl() : undefined))
            };
        }

        this._bindings = [
            {
                event: 'click',
                listener: (event: Event) => this.onClickEvent(event),
                selector: '.game-background'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onCloseEvent(event),
                selector: '.btn-close-region'
            }
        ];
    }

    public show(): void {
        super.show();

        if(AbstractAdUnit.getAutoClose()) {
            setTimeout(() => {
                this.onClose.trigger();
            }, AbstractAdUnit.getAutoCloseDelay());
        }
    }

    public remove(): void {
        this.container().parentElement!.removeChild(this.container());
    }

    private onCloseEvent(event: Event): void {
        event.preventDefault();
        this.onClose.trigger();
    }

    private onClickEvent(event: Event): void {
        event.preventDefault();
        this.onClick.trigger();
    }

}
