import EndScreenTemplate from 'html/EndScreen.html';
import LunarEndScreen from 'html/LunarEndScreen.html';

import { NativeBridge } from 'Native/NativeBridge';
import { View } from 'Views/View';
import { Template } from 'Utilities/Template';
import { IPrivacyHandler, Privacy } from 'Views/Privacy';
import { Localization } from 'Utilities/Localization';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { Campaign } from 'Models/Campaign';
import { IEndScreenDownloadParameters } from 'EventHandlers/EndScreenEventHandler';

export interface IEndScreenHandler {
    onEndScreenDownload(parameters: IEndScreenDownloadParameters): void;
    onEndScreenPrivacy(url: string): void;
    onEndScreenClose(): void;
    onKeyEvent(keyCode: number): void;
}

const lunarEndScreenId = "lunar-end-screen";

export abstract class EndScreen extends View<IEndScreenHandler> implements IPrivacyHandler {

    protected _localization: Localization;
    private _coppaCompliant: boolean;
    private _gameName: string | undefined;
    private _privacy: Privacy;
    private _isSwipeToCloseEnabled: boolean = false;
    private _abGroup: number;

    constructor(nativeBridge: NativeBridge, coppaCompliant: boolean, language: string, gameId: string, gameName: string | undefined, abGroup: number) {
        super(nativeBridge, 'end-screen');
        this._coppaCompliant = coppaCompliant;
        this._localization = new Localization(language, 'endscreen');
        this._abGroup = abGroup;
        this._gameName = gameName;

        if (this.getEndscreenAlt() === lunarEndScreenId) {
            this._template = new Template(LunarEndScreen, this._localization);
        } else {
            this._template = new Template(EndScreenTemplate, this._localization);
        }

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
                event: 'swipe',
                listener: (event: Event) => this.onPetEvent(event),
                selector: '#the-dog',
                ignoreLength: true
            }
        ];

        if (gameId === '1300023' || gameId === '1300024') {
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

        const endScreenAlt = this.getEndscreenAlt();
        if (typeof endScreenAlt === "string") {
            this._container.classList.add(endScreenAlt);
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

        if (this.getEndscreenAlt() === lunarEndScreenId) {
            /* Run animation when end screen is shown */
            this._container.classList.add("run-animation");
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
        if(this._abGroup === 5 || this._abGroup === 6) {
            return lunarEndScreenId;
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
        this._privacy = new Privacy(this._nativeBridge, this._coppaCompliant);
        this._privacy.render();
        document.body.appendChild(this._privacy.container());
        this._privacy.addEventHandler(this);
    }

    private onPetEvent(event: Event): void {
        event.preventDefault();

        if (!this._container.classList.contains("active")) {
            this._container.classList.add("active");
        }

        const headEl: HTMLElement = <HTMLElement>this._container.querySelector('#head');
        headEl.classList.add("nod");
        setTimeout(() => {
            if (typeof headEl !== "undefined" && headEl.classList && headEl.classList.contains("nod")) {
                headEl.classList.remove("nod");
            }
        }, 150);
    }
}
