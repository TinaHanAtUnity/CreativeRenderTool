import { AbstractAdUnit, IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { AbstractPrivacy, IPrivacyHandler } from 'Ads/Views/AbstractPrivacy';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Template } from 'Core/Utilities/Template';
import { View } from 'Core/Views/View';
import VastEndScreenTemplate from 'html/VastEndScreen.html';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { Platform } from '../../Core/Constants/Platform';

export interface IVastEndScreenHandler {
    onVastEndScreenClick(): void;
    onVastEndScreenClose(): void;
    onVastEndScreenShow(): void;
    onKeyEvent(keyCode: number): void;
    onOpenUrl(url: string): Promise<void>;
}

export interface IVastEndscreenParameters {
    campaign: VastCampaign;
    clientInfo: ClientInfo;
    seatId: number | undefined;
    showPrivacyDuringEndscreen: boolean;
}

export class VastEndScreen extends View<IVastEndScreenHandler> implements IPrivacyHandler {

    protected _template: Template;
    private _isSwipeToCloseEnabled: boolean = false;
    private _privacy: AbstractPrivacy;
    private _callButtonEnabled: boolean = true;
    private _campaign: VastCampaign;
    private _seatId: number | undefined;
    private _showPrivacyDuringEndscreen: boolean;

    constructor(platform: Platform, parameters: IVastEndscreenParameters, privacy: AbstractPrivacy) {
        super(platform, 'vast-end-screen');

        this._campaign = parameters.campaign;
        this._template = new Template(VastEndScreenTemplate);
        this._seatId = parameters.seatId;
        this._showPrivacyDuringEndscreen = parameters.showPrivacyDuringEndscreen;

        if(this._campaign) {
            const landscape = this._campaign.getLandscape();
            const portrait = this._campaign.getPortrait();

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

        if(CustomFeatures.isTimehopApp(parameters.clientInfo.getGameId())) {
            this._isSwipeToCloseEnabled = true;

            this._bindings.push({
                event: 'swipe',
                listener: (event: Event) => this.onCloseEvent(event),
                selector: '.campaign-container, .game-background'
            });
        }

        if (this._showPrivacyDuringEndscreen) {
            this._privacy = privacy;
            this._privacy.render();
            this._privacy.hide();
            document.body.appendChild(this._privacy.container());
            this._privacy.addEventHandler(this);
        }
    }

    public render(): void {
        super.render();

        if (CustomFeatures.isTencentAdvertisement(this._seatId)) {
            const tencentAdTag = <HTMLElement>this._container.querySelector('.tencent-advertisement');
            if (tencentAdTag) {
                tencentAdTag.innerText = '广告';
            }
        }

        if (!this._showPrivacyDuringEndscreen) {
            (<HTMLElement>this._container.querySelector('.privacy-button')).style.display = 'none';
        }

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
        if (this._privacy) {
            this._privacy.removeEventHandler(this);
            if (this._privacy.container().parentElement) {
                this._privacy.container().parentElement!.removeChild(this._privacy.container());
            }
        }

        if (this.container().parentElement) {
            this.container().parentElement!.removeChild(this.container());
        }
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
