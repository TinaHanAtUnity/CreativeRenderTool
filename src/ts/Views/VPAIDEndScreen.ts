import VastEndScreenTemplate from 'html/VastEndScreen.html';

import { View } from 'Views/View';
import { Template } from 'Utilities/Template';
import { VPAIDCampaign } from 'Models/VPAID/VPAIDCampaign';
import { NativeBridge } from 'Native/NativeBridge';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';

export interface IVPAIDEndScreenHandler {
    onVPAIDEndScreenClick(): void;
    onVPAIDEndScreenClose(): void;
    onVPAIDEndScreenShow(): void;
}

export class VPAIDEndScreen extends View<IVPAIDEndScreenHandler> {
    private _isSwipeToCloseEnabled: boolean = false;

    constructor(nativeBridge: NativeBridge, campaign: VPAIDCampaign, gameId: string) {
        super(nativeBridge, 'end-screen');

        this._template = new Template(VastEndScreenTemplate);

        if(campaign) {
            const landscape = campaign.getCompanionLandscapeUrl();
            const portrait = campaign.getCompanionPortraitUrl();

            this._templateData = {
                'endScreenLandscape': (landscape ? landscape : (portrait ? portrait : undefined)),
                'endScreenPortrait': (portrait ? portrait : (landscape ? landscape : undefined))
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

        this._handlers.forEach(handler => handler.onVPAIDEndScreenShow());

        if(AbstractAdUnit.getAutoClose()) {
            // setTimeout(() => {
                this._handlers.forEach(handler => handler.onVPAIDEndScreenClose());
           // }, AbstractAdUnit.getAutoCloseDelay());
        }
    }

    public remove(): void {
        this.container().parentElement!.removeChild(this.container());
    }

    private onCloseEvent(event: Event): void {
        event.preventDefault();
        this._handlers.forEach(handler => handler.onVPAIDEndScreenClose());
    }

    private onClickEvent(event: Event): void {
        event.preventDefault();
        this._handlers.forEach(handler => handler.onVPAIDEndScreenClick());
    }
}
