import EndScreenTemplate from 'html/EndScreen.html';

import { NativeBridge } from 'Native/NativeBridge';
import { View } from 'Views/View';
import { Template } from 'Utilities/Template';
import { Observable0, Observable1 } from 'Utilities/Observable';
import { Privacy } from 'Views/Privacy';
import { Localization } from 'Utilities/Localization';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { Campaign } from 'Models/Campaign';
import { PerformanceCampaign } from 'Models/Campaigns/PerformanceCampaign';
import { MRAIDCampaign } from 'Models/Campaigns/MRAIDCampaign';

export class EndScreen extends View {

    public readonly onDownload = new Observable0();
    public readonly onPrivacy = new Observable1<string>();
    public readonly onClose = new Observable0();

    private _coppaCompliant: boolean;
    private _gameName: string;
    private _privacy: Privacy;
    private _localization: Localization;
    private _isSwipeToCloseEnabled: boolean = false;

    constructor(nativeBridge: NativeBridge, campaign: Campaign, coppaCompliant: boolean, language: string, gameId: string) {
        super(nativeBridge, 'end-screen');
        this._coppaCompliant = coppaCompliant;
        this._localization = new Localization(language, 'endscreen');

        this._template = new Template(EndScreenTemplate, this._localization);

        /* TODO: Why is there a check for campaign */
        if(campaign && campaign instanceof PerformanceCampaign) {
            this._gameName = campaign.getGameName();

            const adjustedRating: number = campaign.getRating() * 20;
            this._templateData = {
                'gameName': campaign.getGameName(),
                'gameIcon': campaign.getGameIcon().getUrl(),
                // NOTE! Landscape orientation should use a portrait image and portrait orientation should use a landscape image
                'endScreenLandscape': campaign.getPortrait().getUrl(),
                'endScreenPortrait': campaign.getLandscape().getUrl(),
                'rating': adjustedRating.toString(),
                'ratingCount': this._localization.abbreviate(campaign.getRatingCount()),
                'endscreenAlt': this.getEndscreenAlt(campaign)
            };
        } else if(campaign && campaign instanceof MRAIDCampaign) {
            const gameName = campaign.getGameName();
            if(gameName) {
                this._gameName = gameName;
            }
            this._templateData = {
                'gameName': campaign.getGameName(),
                'endscreenAlt': this.getEndscreenAlt(campaign)
            };
            const gameIcon = campaign.getGameIcon();
            if(gameIcon) {
                this._templateData.gameIcon = gameIcon.getUrl();
            }
            const rating = campaign.getRating();
            if(rating) {
                const adjustedRating: number = rating * 20;
                this._templateData.rating = adjustedRating.toString();
            }
            const ratingCount = campaign.getRatingCount();
            if(ratingCount) {
                this._templateData.ratingCount = this._localization.abbreviate(ratingCount);
            }
            const portrait = campaign.getPortrait();
            if(portrait) {
                this._templateData.endScreenLandscape = portrait.getUrl();
            }
            const landscape = campaign.getLandscape();
            if(landscape) {
                this._templateData.endScreenPortrait = landscape.getUrl();
            }
        }

        this._bindings = [
            {
                event: 'click',
                listener: (event: Event) => this.onDownloadEvent(event),
                selector: '.game-background, .btn-download, .game-icon'
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

        if(gameId === '1300023' || gameId === '1300024') {
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

        if(this._isSwipeToCloseEnabled) {
            (<HTMLElement>this._container.querySelector('.btn-close-region')).style.display = 'none';
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

        if(AbstractAdUnit.getAutoClose()) {
           setTimeout(() => {
               this.onClose.trigger();
           }, AbstractAdUnit.getAutoCloseDelay());
        }
    }

    public hide(): void {
        super.hide();

        if(this._privacy) {
            this._privacy.hide();
            this._privacy.container().parentElement!.removeChild(this._privacy.container());
            delete this._privacy;
        }
    }

    private getEndscreenAlt(campaign: Campaign) {
        return undefined;
    }

    private onDownloadEvent(event: Event): void {
        event.preventDefault();
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
}
