import EndScreenTemplate from 'html/EndScreen.html';

import { NativeBridge } from 'Native/NativeBridge';
import { View } from 'Views/View';
import { Template } from 'Utilities/Template';
import { Observable0, Observable1 } from 'Utilities/Observable';
import { Campaign } from 'Models/Campaign';
import { Privacy } from 'Views/Privacy';
import { Localization } from 'Utilities/Localization';
import { Platform } from 'Constants/Platform';

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
        this._bindings = [
            {
                event: 'click',
                listener: (event: Event) => this.onCloseEvent(event),
                selector: '.btn-close-region'
            }
        ];

        if(campaign) {
            let adjustedRating: number = campaign.getRating() * 20;
            this._templateData = {
                'gameName': campaign.getGameName(),
                'gameIcon': campaign.getGameIcon(),
                'endScreenLandscape': campaign.getLandscapeUrl(),
                'endScreenPortrait': campaign.getPortraitUrl(),
                'rating': adjustedRating.toString(),
                'ratingCount': campaign.getRatingCount().toString()
            };
            let cid = '123';
            if(cid === '123') {
                this._templateData['mz'] = true;
            } else {
                this._bindings.push({
                    event: 'click',
                    listener: (event: Event) => this.onDownloadEvent(event),
                    selector: '.game-background, .btn-download, .store-button, .game-icon, .store-badge-container'
                });
                this._bindings.push({
                    event: 'click',
                    listener: (event: Event) => this.onPrivacyEvent(event),
                    selector: '.privacy-button'
                });
            }
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
        let nameContainer: HTMLElement = <HTMLElement>this._container.querySelector('.name-container');
        if(nameContainer) {
            nameContainer.innerHTML = this._gameName + ' ';
        }

        let playableUrl: string | undefined;
        if(this._nativeBridge.getPlatform() === Platform.ANDROID) {
            // playableUrl = 'https://static.applifier.com/playables/SMA_android/index_android.html';
            playableUrl = 'https://static.applifier.com/playables/SG_android/index_android.html';
        } else if(this._nativeBridge.getPlatform() === Platform.IOS) {
            // playableUrl = 'https://static.applifier.com/playables/SMA_ios/index_ios.html';
            playableUrl = 'https://static.applifier.com/playables/SG_ios/index_ios.html';
        }
        if(playableUrl) {
            let iframe = <HTMLIFrameElement>document.getElementById('playable');
            iframe.src = playableUrl;

            window.addEventListener('message', (event: MessageEvent) => {
                if(event.data && event.data === 'playableClick') {
                    this._nativeBridge.Intent.launch({
                        'action': 'android.intent.action.VIEW',
                        'uri': 'market://details?id=com.machinezone.gow'
                    });
                }
            }, false);

            window.addEventListener('resize', (event: Event) => {
                iframe.contentWindow.postMessage({
                    innerWidth: window.innerWidth,
                    innerHeight: window.innerHeight
                }, '*');
            }, false);
        }
    }

    public hide(): void {
        super.hide();

        if(this._privacy) {
            this._privacy.hide();
            this._privacy.container().parentElement.removeChild(this._privacy.container());
            delete this._privacy;
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
