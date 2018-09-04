import VastEndScreenTemplate from 'html/VastEndScreen.html';

import { NativeBridge } from 'Native/NativeBridge';
import { View } from 'Views/View';
import { Template } from 'Utilities/Template';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { IPrivacyHandler, AbstractPrivacy } from 'Views/AbstractPrivacy';
import { CustomFeatures } from 'Utilities/CustomFeatures';

export interface IVastEndScreenHandler {
    onVastEndScreenClick(): void;
    onVastEndScreenClose(): void;
    onVastEndScreenShow(): void;
    onKeyEvent(keyCode: number): void;
    onOpenUrl(url: string): Promise<void>;
}

export class VastEndScreen extends View<IVastEndScreenHandler> implements IPrivacyHandler {

    private _isSwipeToCloseEnabled: boolean = false;
    private _privacy: AbstractPrivacy;
    private _callButtonEnabled: boolean = true;

    constructor(nativeBridge: NativeBridge, campaign: VastCampaign, gameId: string, privacy: AbstractPrivacy) {
        super(nativeBridge, 'vast-end-screen');

        this._template = new Template(VastEndScreenTemplate);
        this._privacy = privacy;

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
            },
            {
                event: 'click',
                listener: (event: Event) => this.onPrivacyEvent(event),
                selector: '.privacy-button'
            }
        ];

        if(CustomFeatures.isTimehopApp(gameId)) {
            this._isSwipeToCloseEnabled = true;

            this._bindings.push({
                event: 'swipe',
                listener: (event: Event) => this.onCloseEvent(event),
                selector: '.campaign-container, .game-background'
            });
        }

        this._privacy.render();
        this._privacy.hide();
        document.body.appendChild(this._privacy.container());
        this._privacy.addEventHandler(this);
    }

    public render(): void {
        super.render();

        if(this._isSwipeToCloseEnabled) {
            (<HTMLElement>this._container.querySelector('.btn-close-region')).style.display = 'none';
        }
    }

    public show(): void {
        super.show();

        this._handlers.forEach(handler => handler.onVastEndScreenShow());

        if(AbstractAdUnit.getAutoClose()) {
            setTimeout(() => {
                this._handlers.forEach(handler => handler.onVastEndScreenClose());
            }, AbstractAdUnit.getAutoCloseDelay());
        }
    }

    public hide(): void {
        super.hide();

        if (this._privacy) {
            this._privacy.hide();
        }
    }

    public remove(): void {
        this._privacy.removeEventHandler(this);
        this._privacy.container().parentElement!.removeChild(this._privacy.container());
        this.container().parentElement!.removeChild(this.container());
    }

    public onPrivacyClose(): void {
        if (this._privacy) {
            this._privacy.hide();
        }
    }

    public onPrivacy(url: string): void {
        // do nothing
    }

    public onGDPROptOut(optOutEnabled: boolean) {
        // do nothing
    }

    public setCallButtonEnabled(value: boolean) {
        if (this._callButtonEnabled !== value) {
            this._callButtonEnabled = value;
        }
    }

    private onCloseEvent(event: Event): void {
        event.preventDefault();
        this._handlers.forEach(handler => handler.onVastEndScreenClose());
    }

    private onClickEvent(event: Event): void {
        if (!this._callButtonEnabled) {
            return;
        }
        event.preventDefault();
        this._handlers.forEach(handler => handler.onVastEndScreenClick());
    }

    private onPrivacyEvent(event: Event): void {
        event.preventDefault();
        this._privacy.show();
    }
}
