import EndScreenTemplate from 'html/EndScreen.html';
import SquareEndScreenTemplate from 'html/SquareEndScreen.html';
import FancyEndScreenTemplate from 'html/FancyEndScreen.html';

import { NativeBridge } from 'Native/NativeBridge';
import { View } from 'Views/View';
import { Template } from 'Utilities/Template';
import { IPrivacyHandler, Privacy } from 'Views/Privacy';
import { Localization } from 'Utilities/Localization';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { Campaign } from 'Models/Campaign';
import { IEndScreenDownloadParameters } from 'EventHandlers/EndScreenEventHandler';
import { AdUnitStyle } from 'Models/AdUnitStyle';
import { CustomFeatures } from 'Utilities/CustomFeatures';
import { SquareEndScreenUtilities } from 'Utilities/SquareEndScreenUtilities';

export interface IEndScreenHandler {
    onEndScreenDownload(parameters: IEndScreenDownloadParameters): void;
    onEndScreenPrivacy(url: string): void;
    onEndScreenClose(): void;
    onKeyEvent(keyCode: number): void;
}

const GDPR_OPT_OUT_BASE  = 'gdpr-pop-up-base';

const SQUARE_END_SCREEN = 'square-end-screen';

const FANCY_END_SCREEN = 'fancy-end-screen';
// TODO: Use actual group
const FANCY_END_SCREEN_AB_GROUP = 5;

export abstract class EndScreen extends View<IEndScreenHandler> implements IPrivacyHandler {

    protected _localization: Localization;
    protected _adUnitStyle?: AdUnitStyle;
    private _coppaCompliant: boolean;
    private _gameName: string | undefined;
    private _privacy: Privacy;
    private _isSwipeToCloseEnabled: boolean = false;
    private _abGroup: number;
    private _showOptOutPopup: boolean;
    private _gdprPopupClicked = false;
    private _campaignId: string | undefined;
    private _osVersion: string | undefined;

    constructor(nativeBridge: NativeBridge, coppaCompliant: boolean, language: string, gameId: string, gameName: string | undefined, abGroup: number, adUnitStyle?: AdUnitStyle, showOptOutPopup: boolean = false, campaignId?: string, osVersion?: string) {
        super(nativeBridge, 'end-screen');
        this._coppaCompliant = coppaCompliant;
        this._localization = new Localization(language, 'endscreen');
        this._abGroup = abGroup;
        this._gameName = gameName;
        this._adUnitStyle = adUnitStyle;
        this._showOptOutPopup = showOptOutPopup;
        this._campaignId = campaignId;
        this._osVersion = osVersion;

        this._template = new Template(this.getTemplate(), this._localization);

        this._template = new Template(this.getTemplate(), this._localization);

        this._bindings = [
            {
                event: 'click',
                listener: (event: Event) => this.onDownloadEvent(event),
                selector: '.game-background, .download-container, .game-icon, .game-image'
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
                listener: (event: Event) => this.onOptOutPopupEvent(event),
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
    }

    public render(): void {
        super.render();

        if (this._isSwipeToCloseEnabled) {
            (<HTMLElement>this._container.querySelector('.btn-close-region')).style.display = 'none';
        }

        const ctaButtonColor = this._adUnitStyle && this._adUnitStyle.getCTAButtonColor() ? this._adUnitStyle.getCTAButtonColor() : undefined;
        if (ctaButtonColor && !this.getEndscreenAlt()) {
            (<HTMLElement>this._container.querySelector('.download-container')).style.background = ctaButtonColor;
        }

        const endScreenAlt = this.getEndscreenAlt();
        if (typeof endScreenAlt === 'string') {
            this._container.classList.add(endScreenAlt);
            document.documentElement.classList.add(endScreenAlt);
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

        if (this._privacy) {
            this._privacy.hide();
            this._privacy.container().parentElement!.removeChild(this._privacy.container());
            delete this._privacy;
        }
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
        this._handlers.forEach(handler => handler.onEndScreenPrivacy(url));
    }

    protected getEndscreenAlt(campaign?: Campaign) {
        const campaignId = campaign ? campaign.getId() : this._campaignId;
        const platform = this._nativeBridge.getPlatform();
        if (SquareEndScreenUtilities.useSquareEndScreenAlt(this._abGroup, platform, campaignId, this._osVersion)) {
            return SQUARE_END_SCREEN;
        }

        if (this._abGroup === FANCY_END_SCREEN_AB_GROUP) {
            return FANCY_END_SCREEN;
        }

        // TODO return undefined
        return FANCY_END_SCREEN;
    }

    protected abstract onDownloadEvent(event: Event): void;

    private onCloseEvent(event: Event): void {
        event.preventDefault();
        this._handlers.forEach(handler => handler.onEndScreenClose());
    }

    private onPrivacyEvent(event: Event): void {
        event.preventDefault();
        this._privacy = new Privacy(this._nativeBridge, this._coppaCompliant);
        this._privacy.render();
        document.body.appendChild(this._privacy.container());
        this._privacy.addEventHandler(this);
    }

    private onOptOutPopupEvent(event: Event) {
        event.preventDefault();

        this._gdprPopupClicked = true;

        this._privacy = new Privacy(this._nativeBridge, this._coppaCompliant);
        this._privacy.render();
        document.body.appendChild(this._privacy.container());
        this._privacy.addEventHandler(this);
    }

    private getTemplate() {
        if (this.getEndscreenAlt() === SQUARE_END_SCREEN) {
            return SquareEndScreenTemplate;
        }  else if (this.getEndscreenAlt() === FANCY_END_SCREEN) {
            return FancyEndScreenTemplate;
        }

        return EndScreenTemplate;
    }
}
