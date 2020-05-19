import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { IEndScreenDownloadParameters } from 'Ads/EventHandlers/EndScreenEventHandler';
import { IGDPREventHandler } from 'Ads/EventHandlers/GDPREventHandler';
import { AdUnitStyle } from 'Ads/Models/AdUnitStyle';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { AbstractPrivacy, IPrivacyHandlerView } from 'Ads/Views/AbstractPrivacy';
import { ABGroup } from 'Core/Models/ABGroup';
import { Localization } from 'Core/Utilities/Localization';
import { View } from 'Core/Views/View';
import EndScreenTemplate from 'html/EndScreen.html';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';

export interface IEndScreenParameters {
    platform: Platform;
    core: ICoreApi;
    apiLevel?: number;
    language: string;
    gameId: string;
    targetGameName: string | undefined;
    abGroup: ABGroup;
    privacy: AbstractPrivacy;
    showGDPRBanner: boolean;
    adUnitStyle?: AdUnitStyle;
    campaignId?: string;
    osVersion?: string;
    hidePrivacy?: boolean;
}

export interface IEndScreenHandler extends IGDPREventHandler {
    onEndScreenDownload(parameters: IEndScreenDownloadParameters): void;
    onEndScreenClose(): void;
    onKeyEvent(keyCode: number): void;
}

export abstract class EndScreen extends View<IEndScreenHandler> implements IPrivacyHandlerView {

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
    private _apiLevel?: number;
    private _hidePrivacy: boolean = false;

    constructor(parameters: IEndScreenParameters) {
        super(parameters.platform, 'end-screen');
        this._localization = new Localization(parameters.language, 'endscreen');
        this._abGroup = parameters.abGroup;
        this._gameName = parameters.targetGameName;
        this._privacy = parameters.privacy;
        this._adUnitStyle = parameters.adUnitStyle;
        this._showGDPRBanner = parameters.showGDPRBanner;
        this._campaignId = parameters.campaignId;
        this._osVersion = parameters.osVersion;
        this._apiLevel = parameters.apiLevel;
        this._hidePrivacy = parameters.hidePrivacy || false;

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
                selector: '.privacy-button, .gdpr-link, .icon-gdpr'
            }
        ];

        if (CustomFeatures.isTimehopApp(parameters.gameId)) {
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
            (<HTMLElement> this._container.querySelector('.btn-close-region')).style.display = 'none';
        }

        const ctaButtonColor = this._adUnitStyle && this._adUnitStyle.getCTAButtonColor() ? this._adUnitStyle.getCTAButtonColor() : undefined;
        const downloadContainer = <HTMLElement> this._container.querySelector('.download-container');

        if (ctaButtonColor && downloadContainer) {
            downloadContainer.style.background = ctaButtonColor;
        }

        const endScreenAlt = this.getEndscreenAlt();
        if (typeof endScreenAlt === 'string') {
            this._container.classList.add(endScreenAlt);
            document.documentElement.classList.add(endScreenAlt);
        }

        if (this._showGDPRBanner) {
            this._container.classList.add('show-gdpr-banner');
        }

        // Android <= 4.4.4
        if (this._platform === Platform.ANDROID && this._apiLevel! <= 19) {
            this._container.classList.add('old-androids');
        }

        // hide privacy icon for China
        if (this._hidePrivacy) {
            this._container.classList.add('hidePrivacyButton');
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
        const nameContainer: HTMLElement = <HTMLElement> this._container.querySelector('.name-container');
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

    protected getEndscreenAlt(): string | undefined {
        return undefined;
    }

    protected getTemplate() {
        return EndScreenTemplate;
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
            this._container.classList.remove('show-gdpr-banner');
        }

        this._privacy.show();
    }
}
