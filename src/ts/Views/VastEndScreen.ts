import VastEndScreenTemplate from 'html/VastEndScreen.html';

import { NativeBridge } from 'Native/NativeBridge';
import { View } from 'Views/View';
import { Template } from 'Utilities/Template';
import { Observable0 } from 'Utilities/Observable';
import { Campaign } from 'Models/Campaign';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';

export class VastEndScreen extends View {

    public onClick: Observable0 = new Observable0();
    public onClose: Observable0 = new Observable0();

    constructor(nativeBridge: NativeBridge, campaign: Campaign) {
        super(nativeBridge, 'end-screen');

        this._template = new Template(VastEndScreenTemplate);

        if(campaign) {
            this._templateData = {
                'endScreenLandscape': campaign.getLandscapeUrl() || campaign.getPortraitUrl(),
                'endScreenPortrait': campaign.getPortraitUrl() || campaign.getLandscapeUrl()
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
