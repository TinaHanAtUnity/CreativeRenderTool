import EndScreenTemplate from 'html/EndScreen.html';
import IPhoneXEndScreenTemplate from 'html/IPhoneXEndScreen.html';

import { NativeBridge } from 'Native/NativeBridge';
import { View } from 'Views/View';
import { Template } from 'Utilities/Template';
import { IPrivacyHandler, AbstractPrivacy } from 'Views/AbstractPrivacy';
import { Localization } from 'Utilities/Localization';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { Campaign } from 'Models/Campaign';
import { IEndScreenDownloadParameters } from 'EventHandlers/EndScreenEventHandler';
import { AdUnitStyle } from 'Models/AdUnitStyle';
import { CustomFeatures } from 'Utilities/CustomFeatures';
import { ABGroup, IPhoneXEndScreenTest } from 'Models/ABGroup';
import { IGDPREventHandler } from 'EventHandlers/GDPREventHandler';

export interface IEndScreenHandler extends IGDPREventHandler {
    onEndScreenDownload(parameters: IEndScreenDownloadParameters): void;
    onEndScreenClose(): void;
    onKeyEvent(keyCode: number): void;
}

const IPHONE_X_STYLES_ID = 'iphone-x-styles';

export abstract class EndScreen extends View<IEndScreenHandler> implements IPrivacyHandler {

    protected _localization: Localization;
    protected _adUnitStyle?: AdUnitStyle;
    private _gameName: string | undefined;
    private _privacy: AbstractPrivacy;
    private _isSwipeToCloseEnabled: boolean = false;
    private _abGroup: ABGroup;
    private _showGDPRBanner: boolean = false;
    private _gdprPopupClicked = false;
    private _campaignId: string | undefined;
    private _osVersion: string | undefined;

    constructor(nativeBridge: NativeBridge, language: string, gameId: string, gameName: string | undefined, abGroup: ABGroup, privacy: AbstractPrivacy, showGDPRBanner: boolean, adUnitStyle?: AdUnitStyle, campaignId?: string, osVersion?: string) {
        super(nativeBridge, 'end-screen');
        this._localization = new Localization(language, 'endscreen');
        this._abGroup = abGroup;
        this._gameName = gameName;
        this._privacy = privacy;
        this._adUnitStyle = adUnitStyle;
        this._showGDPRBanner = showGDPRBanner;
        this._campaignId = campaignId;
        this._osVersion = osVersion;

        this._template = new Template(this.getTemplate(), this._localization);

        this._template = new Template(this.getTemplate(), this._localization);

        this._bindings = [
            {
                event: 'click',
                listener: (event: Event) => this.onDownloadEvent(event),
                selector: '.game-background, .download-container, .game-icon'
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
            },
            {
                event: 'click',
                listener: (event: Event) => this.onPrivacyEvent(event),
                selector: '.gdpr-link'
            }
        ];

        if (CustomFeatures.isTimehopApp(gameId)) {
            this._isSwipeToCloseEnabled = true;

            this._bindings.push({
                event: 'swipe',
                listener: (event: Event) => this.onCloseEvent(event),
                selector: '.campaign-container, .game-background, .btn.download'
            });
        }

        this._privacy.render();
        this._privacy.hide();
        document.body.appendChild(this._privacy.container());
        this._privacy.addEventHandler(this);
    }

    public render(): void {
        super.render();

        if (this._isSwipeToCloseEnabled) {
            (<HTMLElement>this._container.querySelector('.btn-close-region')).style.display = 'none';
        }

        const ctaButtonColor = this._adUnitStyle && this._adUnitStyle.getCTAButtonColor() ? this._adUnitStyle.getCTAButtonColor() : undefined;
        if (ctaButtonColor) {
            (<HTMLElement>this._container.querySelector('.download-container')).style.background = ctaButtonColor;
        }

        const endScreenAlt = this.getEndscreenAlt();
        if (typeof endScreenAlt === 'string') {
            this._container.classList.add(endScreenAlt);

            // Need this to modify the #gdpr-privacy
            if (endScreenAlt === IPHONE_X_STYLES_ID) {
                document.body.classList.add(endScreenAlt);
            }
        }

        if (this._showGDPRBanner) {
            this._container.classList.add('show-gdpr-banner');
        }
    }

    public show(): void {
        super.show();

        // todo: the following hack prevents game name from overflowing to more than two lines in the endscreen
        // for some reason webkit-line-clamp is not applied without some kind of a hack
        // this is very strange because identical style works fine in 1.5
        // this is most certainly not a proper solution to this problem but without this hack, sometimes game name
        // would prevent download button from showing which completely breaks layout and monetization
        // therefore this should be treated as an emergency fix and a proper fix needs to be figured out later
        const nameContainer: HTMLElement = <HTMLElement>this._container.querySelector('.name-container');
        nameContainer.innerHTML = this._gameName + ' ';

        if (AbstractAdUnit.getAutoClose()) {
            setTimeout(() => {
                this._handlers.forEach(handler => handler.onEndScreenClose());
            }, AbstractAdUnit.getAutoCloseDelay());
        }

        this._container.classList.add('on-show');
    }

    public hide(): void {
        super.hide();

        if (this._showGDPRBanner && !this._gdprPopupClicked) {
            this._handlers.forEach(handler => handler.onGDPRPopupSkipped());
        }

        if (this._privacy) {
            this._privacy.hide();
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

    public onGDPROptOut(optOutEnabled: boolean): void {
        // do nothing
    }

    protected getEndscreenAlt(campaign?: Campaign) {
        if (this.useIPhoneXStyle()) {
            return IPHONE_X_STYLES_ID;
        }

        return undefined;
    }

    protected abstract onDownloadEvent(event: Event): void;

    private onCloseEvent(event: Event): void {
        event.preventDefault();
        this._handlers.forEach(handler => handler.onEndScreenClose());
    }

    private onPrivacyEvent(event: Event): void {
        event.preventDefault();

        if (this._showGDPRBanner) {
            this._gdprPopupClicked = true;
        }
        this._privacy.show();
    }

    private isIPhoneX(): boolean {
        const isIPhone: boolean = /iPhone/.test(navigator.userAgent);

        if (!isIPhone) {
            return false;
        }

        const ratio: number = window.devicePixelRatio;
        const screenSize = {
            height: window.screen.height * ratio,
            width: window.screen.width * ratio
        };

        return (screenSize.height === 1125 && screenSize.width === 2436) || (screenSize.height === 2436 && screenSize.width === 1125);
    }

    private useIPhoneXStyle(): boolean {
        return IPhoneXEndScreenTest.isValid(this._abGroup) && this.isIPhoneX();
    }

    private getTemplate() {
        if (this.useIPhoneXStyle()) {
            return IPhoneXEndScreenTemplate;
        }

        return EndScreenTemplate;
    }
}
