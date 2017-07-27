import EndScreenTemplate from 'html/EndScreen.html';

import { NativeBridge } from 'Native/NativeBridge';
import { View } from 'Views/View';
import { Template } from 'Utilities/Template';
import { Observable0, Observable1 } from 'Utilities/Observable';
import { Privacy } from 'Views/Privacy';
import { Localization } from 'Utilities/Localization';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { PerformanceCampaign } from 'Models/PerformanceCampaign';

export class EndScreen extends View {

    public readonly onDownload = new Observable0();
    public readonly onPrivacy = new Observable1<string>();
    public readonly onClose = new Observable0();

    private _coppaCompliant: boolean;
    private _gameName: string;
    private _privacy: Privacy;
    private _localization: Localization;
    private _isMasterClassCampaign = false;

    private downloadButton: HTMLElement;

    constructor(nativeBridge: NativeBridge, campaign: PerformanceCampaign, coppaCompliant: boolean, language: string) {
        super(nativeBridge, 'end-screen');
        this._coppaCompliant = coppaCompliant;
        this._gameName = campaign.getGameName();
        this._localization = new Localization(language, 'endscreen');

        if (campaign.getId() === '58e2c6139b4fd70d2454b051') {
            this._isMasterClassCampaign = true;
        }

        this._template = new Template(EndScreenTemplate, this._localization);

        const buildCss = (): string => {
            const left = Math.random() * 90;
            const top = Math.random() * 110 + 10;
            const size = Math.random() * 50 + 5;
            const blur = Math.random() * size / 20;
            const duration = size / 3.25;

            return `left: ${left}%; top: ${top}%; -webkit-animation-duration: ${duration}s;animation-duration: ${duration}s;-webkit-filter: blur(${blur}px);filter: blur(${blur}px); height: ${size}px; width: ${size}px`;
        };

        if (campaign) {
            const adjustedRating: number = campaign.getRating() * 20;
            this._templateData = {
                'gameName': campaign.getGameName(),
                'gameIcon': campaign.getGameIcon().getUrl(),
                // NOTE! Landscape orientation should use a portrait image and portrait orientation should use a landscape image
                'endScreenLandscape': campaign.getPortrait().getUrl(),
                'endScreenPortrait': campaign.getLandscape().getUrl(),
                'rating': adjustedRating.toString(),
                'ratingCount': this._localization.abbreviate(campaign.getRatingCount()),
                'endscreenAlt': this.getEndscreenAlt(campaign),
                'buildCSS': buildCss
            };
        }

        this._bindings = [
            {
                event: 'click',
                listener: (event: Event) => this.onDownloadEvent(event),
                selector: '.game-background, .game-icon'
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
                event: 'touchstart',
                listener: (event: Event) => this.onTouchStart(event),
                selector: '.btn-download, .download-text'
            },
            {
                event: 'touchend',
                listener: (event: Event) => this.onDownloadEvent(event),
                selector: '.btn-download, .download-text'
            }
        ];
    }

    public render(): void {
        super.render();

        if(this._isMasterClassCampaign) {
            const downloadText: HTMLElement = <HTMLElement>this._container.querySelector('.download-text');
            downloadText.innerHTML = 'Find Out More';
        }

        this.downloadButton = <HTMLElement>this._container.querySelector('.btn-download');
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

        // TODO: not optimal way to tell the animation to start only when endcard is visible
        // should be good enough for a/b testing
        // maybe set it only if a/b testing campaign is on
        this._container.classList.add('active-animation');

        if(AbstractAdUnit.getAutoClose()) {
           setTimeout(() => {
               this.onClose.trigger();
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

    private getEndscreenAlt(campaign: PerformanceCampaign) {
        if (this._isMasterClassCampaign) {
            return 'masterclass';
        }

        /*
        * Pseudo code
        * TODO: Support proper a/b functionality
        * */
        if ('thirsty-button') {
            return 'thirsty-button';
        }

        if ('pulse-animation') {
            return 'pulse-animation';
        }

        return undefined;
    }

    private onDownloadEvent(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        this.downloadButton.classList.remove('active');
        this.onDownload.trigger();
    }

    private onCloseEvent(event: Event): void {
        event.preventDefault();
        this.onClose.trigger();
    }

    private onPrivacyEvent(event: Event): void {
        event.preventDefault();
        this._privacy = new Privacy(this._nativeBridge, this._coppaCompliant);
        this._privacy.render();
        document.body.appendChild(this._privacy.container());
        this._privacy.onPrivacy.subscribe((url) => {
            this.onPrivacy.trigger(url);
        });
        this._privacy.onClose.subscribe(() => {
            if(this._privacy) {
                this._privacy.hide();
                this._privacy.container().parentElement!.removeChild(this._privacy.container());
                delete this._privacy;
            }
        });
    }

    private onTouchStart(event: Event) {
        event.preventDefault();
        this.downloadButton.classList.add('active');
    }
}
