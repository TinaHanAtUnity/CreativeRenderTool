import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { AbstractPrivacy, IPrivacyHandlerView } from 'Ads/Views/AbstractPrivacy';
import { Platform } from 'Core/Constants/Platform';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { Template } from 'Core/Utilities/Template';
import { View } from 'Core/Views/View';
import VastStaticEndScreenTemplate from 'html/VastStaticEndScreen.html';
import VastIframeEndScreenTemplate from 'html/VastIframeEndScreen.html';
import VastHTMLEndScreenTemplate from 'html/VastHTMLEndScreen.html';
import { VastCampaign } from 'VAST/Models/VastCampaign';

export interface IVastEndScreenHandler {
    onVastEndScreenClick(): void;
    onVastEndScreenClose(): void;
    onVastEndScreenShow(): void;
    onKeyEvent(keyCode: number): void;
}

export interface IVastEndscreenParameters {
    campaign: VastCampaign;
    clientInfo: ClientInfo;
    country: string | undefined;
    hidePrivacy?: boolean;
}

export class VastEndScreen extends View<IVastEndScreenHandler> implements IPrivacyHandlerView {

    private _isSwipeToCloseEnabled: boolean = false;
    private _privacy: AbstractPrivacy;
    private _callButtonEnabled: boolean = true;
    private _campaign: VastCampaign;
    private _country: string | undefined;
    private _hidePrivacy: boolean = false;

    constructor(platform: Platform, parameters: IVastEndscreenParameters, privacy: AbstractPrivacy) {
        super(platform, 'vast-end-screen');

        this._campaign = parameters.campaign;
        this._country = parameters.country;
        this._privacy = privacy;
        this._hidePrivacy = parameters.hidePrivacy || false;

        if (this._campaign.hasHtmlEndscreen()) {
            this._template = new Template(VastHTMLEndScreenTemplate);
            this._templateData = {
                'endScreenHtmlContent': (this._campaign.getVast().getHtmlCompanionResourceContent() ? this._campaign.getVast().getHtmlCompanionResourceContent() : undefined)
            };
        } else if (this._campaign.hasIframeEndscreen()) {
            this._template = new Template(VastIframeEndScreenTemplate);
            this._templateData = {
                'endScreenurl': (this._campaign.getVast().getIframeCompanionResourceUrl() ? this._campaign.getVast().getIframeCompanionResourceUrl() : undefined)
            };
        } else if (this._campaign.hasStaticEndscreen()) {
            this._template = new Template(VastStaticEndScreenTemplate);
            const landscape = this._campaign.getStaticLandscape();
            const portrait = this._campaign.getStaticPortrait();

            this._templateData = {
                'endScreenLandscape': (landscape ? landscape.getUrl() : (portrait ? portrait.getUrl() : undefined)),
                'endScreenPortrait': (portrait ? portrait.getUrl() : (landscape ? landscape.getUrl() : undefined))
            };
        } else {
            this._template = new Template(VastStaticEndScreenTemplate);
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

        if (CustomFeatures.isTimehopApp(parameters.clientInfo.getGameId())) {
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

        const chinaAdvertisementElement: HTMLElement | null = this._container.querySelector('.china-advertisement');
        if (this._country === 'CN' && chinaAdvertisementElement) {
            chinaAdvertisementElement.style.display = 'block';
        }

        if (this._isSwipeToCloseEnabled) {
            (<HTMLElement> this._container.querySelector('.btn-close-region')).style.display = 'none';
        }

        // hide privacy icon for China
        if (this._hidePrivacy) {
            this._container.classList.add('hidePrivacyButton');
        }
    }

    public show(): void {
        super.show();

        this._handlers.forEach(handler => handler.onVastEndScreenShow());

        if (AbstractAdUnit.getAutoClose()) {
            setTimeout(() => {
                this._handlers.forEach(handler => handler.onVastEndScreenClose());
            }, AbstractAdUnit.getAutoCloseDelay());
        }
    }

    public remove(): void {
        if (this._privacy) {
            this._privacy.hide();
            const privacyContainer = this._privacy.container();
            if (privacyContainer && privacyContainer.parentElement) {
                privacyContainer.parentElement.removeChild(privacyContainer);
            }
            delete this._privacy;
        }

        const container = this.container();
        if (container && container.parentElement) {
            container.parentElement.removeChild(this.container());
        }
    }

    public onPrivacyClose(): void {
        if (this._privacy) {
            this._privacy.hide();
        }
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
