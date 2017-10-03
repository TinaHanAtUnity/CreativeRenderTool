import VastEndScreenTemplate from 'html/VastEndScreen.html';

import { NativeBridge } from 'Native/NativeBridge';
import { View } from 'Views/View';
import { Template } from 'Utilities/Template';
import { Observable0 } from 'Utilities/Observable';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { VastCampaign } from 'Models/Vast/VastCampaign';

export interface IVastEndScreenHandler {
    onClick(): void;
    onClose(): void;
    onShow(): void;
}

export class VastEndScreen extends View<IVastEndScreenHandler> {

    public readonly onClick = new Observable0();
    public readonly onClose = new Observable0();
    public readonly onShow = new Observable0();

    private _isSwipeToCloseEnabled: boolean = false;

    constructor(nativeBridge: NativeBridge, campaign: VastCampaign, gameId: string) {
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

        if(gameId === '1300023' || gameId === '1300024') {
            this._isSwipeToCloseEnabled = true;

            this._bindings.push({
                event: 'swipe',
                listener: (event: Event) => this.onCloseEvent(event),
                selector: '.campaign-container, .game-background'
            });
        }
    }

    public render(): void {
        super.render();

        if(this._isSwipeToCloseEnabled) {
            (<HTMLElement>this._container.querySelector('.btn-close-region')).style.display = 'none';
        }
    }

    public show(): void {
        super.show();

        this.onShow.trigger();

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
