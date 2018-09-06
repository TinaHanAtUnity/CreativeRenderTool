import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { IPrivacyHandler } from 'Ads/Views/AbstractPrivacy';
import { Privacy } from 'Ads/Views/Privacy';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Template } from 'Core/Utilities/Template';
import { View } from 'Core/Views/View';
import VastEndScreenTemplate from 'html/VastEndScreen.html';
import { VastCampaign } from 'VAST/Models/VastCampaign';

export interface IVastEndScreenHandler {
    onVastEndScreenClick(): void;
    onVastEndScreenClose(): void;
    onVastEndScreenShow(): void;
    onKeyEvent(keyCode: number): void;
    onOpenUrl(url: string): Promise<void>;
}

export class VastEndScreen extends View<IVastEndScreenHandler> implements IPrivacyHandler {

    private _isSwipeToCloseEnabled: boolean = false;
    private _coppaCompliant: boolean;
    private _privacy: Privacy;
    private _callButtonEnabled: boolean = true;

    constructor(nativeBridge: NativeBridge, coppaCompliant: boolean, campaign: VastCampaign, gameId: string) {
        super(nativeBridge, 'vast-end-screen');

        this._coppaCompliant = coppaCompliant;
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
            this._privacy.container().parentElement!.removeChild(this._privacy.container());
            delete this._privacy;
        }
    }

    public remove(): void {
        this.container().parentElement!.removeChild(this.container());
    }

    public onPrivacyClose(): void {
        if (this._privacy) {
            this._privacy.removeEventHandler(this);
            this._privacy.hide();
            this._privacy.container().parentElement!.removeChild(this._privacy.container());
            delete this._privacy;
        }
    }

    public onPrivacy(url: string): void {
        this._handlers.forEach(handler => handler.onOpenUrl(url));
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
        // todo: gdpr privacy
        this._privacy = new Privacy(this._nativeBridge, this._coppaCompliant);
        this._privacy.render();
        document.body.appendChild(this._privacy.container());
        this._privacy.addEventHandler(this);
    }
}
