import EndScreenTemplate from 'html/EndScreen.html';

import { NativeBridge } from 'Native/NativeBridge';
import { View } from 'Views/View';
import { Template } from 'Utilities/Template';
import { Observable0, Observable1 } from 'Utilities/Observable';
import { Campaign } from 'Models/Campaign';
import { Privacy } from 'Views/Privacy';
import { Localization } from 'Utilities/Localization';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';

export class EndScreen extends View {

    public onDownload: Observable0 = new Observable0();
    public onPrivacy: Observable1<string> = new Observable1();
    public onClose: Observable0 = new Observable0();

    private _coppaCompliant: boolean;
    private _gameName: string;
    private _privacy: Privacy;
    private _localization: Localization;

    constructor(nativeBridge: NativeBridge, campaign: Campaign, coppaCompliant: boolean, language: string) {
        super(nativeBridge, 'end-screen');
        this._coppaCompliant = coppaCompliant;
        this._gameName = campaign.getGameName();
        this._localization = new Localization(language, 'endscreen');

        this._template = new Template(EndScreenTemplate, this._localization);

        if(campaign) {
            const adjustedRating: number = campaign.getRating() * 20;
            this._templateData = {
                'gameName': campaign.getGameName(),
                'gameIcon': campaign.getGameIcon(),
                // NOTE! Landscape orientation should use a portrait image and portrait orientation should use a landscape image
                'endScreenLandscape': campaign.getPortraitUrl(),
                'endScreenPortrait': campaign.getLandscapeUrl(),
                'rating': adjustedRating.toString(),
                'ratingCount': this._localization.abbreviate(campaign.getRatingCount()),
                'endscreenAlt': this.getEndscreenAlt(campaign)
            };
        }

        this._bindings = [
            {
                event: 'click',
                listener: (event: Event) => this.onDownloadEvent(event),
                selector: '.game-background, .btn-download, .store-button, .game-icon, .store-badge-container'
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
        //const abGroup = campaign.getAbGroup();
        //if(abGroup === 10 || abGroup === 11) {
            return 'chinesenewyear';
        //}
        //return undefined;
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
