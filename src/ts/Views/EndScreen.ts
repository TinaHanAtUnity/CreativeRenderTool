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

    constructor(nativeBridge: NativeBridge, campaign: Campaign, coppaCompliant: boolean, language: string) {
        super(nativeBridge, 'end-screen');
        this._coppaCompliant = coppaCompliant;
        this._gameName = campaign.getGameName();

        this._template = new Template(EndScreenTemplate, new Localization(language, 'endscreen'));

        if(campaign) {
            const adjustedRating: number = campaign.getRating() * 20;
            this._templateData = {
                'gameName': campaign.getGameName(),
                'gameIcon': campaign.getGameIcon(),
                'endScreenLandscape': campaign.getLandscapeUrl(),
                'endScreenPortrait': campaign.getPortraitUrl(),
                'rating': adjustedRating.toString(),
                'ratingCount': campaign.getRatingCount().toString(),
                'endscreenAlt': this.getEndscreenAlt(campaign)
            };
        }

        this._bindings = [
            {
                event: 'click',
                listener: (event: Event) => this.onDownloadEvent(event),
                selector: '.game-background, .btn-download, .store-button, .game-icon, .store-badge-container, .coc_cta'
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
            this.onClose.trigger();
        }

        this.triggerAnimations();
    }

    public hide(): void {
        super.hide();

        if(this._privacy) {
            this._privacy.hide();
            this._privacy.container().parentElement.removeChild(this._privacy.container());
            delete this._privacy;
        }
    }

    private getEndscreenAlt(campaign: Campaign) {
        const abGroup = campaign.getAbGroup();
        const gameId = campaign.getGameId();
        if((abGroup === 8 || abGroup === 9) && (gameId === 45236 || gameId === 45237)) {
            return 'animated';
        }
        if((abGroup === 10 || abGroup === 11) && (gameId === 45236 || gameId === 45237)) {
            return 'animated2';
        }
        return undefined;
    }

    private triggerAnimations() {
        const charsElement = <HTMLElement>this._container.querySelector('.cocchars');
        const logoElement = <HTMLElement>this._container.querySelector('.coclogo');
        if(charsElement) {
            charsElement.classList.add('cocchars2');
        }
        if(logoElement) {
            logoElement.classList.add('coclogo2');
        }
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
                this._privacy.container().parentElement.removeChild(this._privacy.container());
                delete this._privacy;
            }
        });
    }

}
