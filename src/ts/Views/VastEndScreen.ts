import VastEndScreenTemplate from 'html/VastEndScreen.html';

import { NativeBridge } from 'Native/NativeBridge';
import { View } from 'Views/View';
import { Template } from 'Utilities/Template';
import { Observable0, Observable1 } from 'Utilities/Observable';
import { Campaign } from 'Models/Campaign';
import { Privacy } from 'Views/Privacy';
import { Localization } from 'Utilities/Localization';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';

export class VastEndScreen extends View {

    public onClick: Observable0 = new Observable0();
    public onClose: Observable0 = new Observable0();

    private _coppaCompliant: boolean;
    private _gameName: string;
    private _privacy: Privacy;

    constructor(nativeBridge: NativeBridge, campaign: Campaign, coppaCompliant: boolean, language: string) {
        super(nativeBridge, 'end-screen');
        this._coppaCompliant = coppaCompliant;
        this._gameName = campaign.getGameName();

        this._template = new Template(VastEndScreenTemplate, new Localization(language, 'endscreen'));

        if(campaign) {
            this._templateData = {
                'endScreenLandscape': campaign.getLandscapeUrl(),
                'endScreenPortrait': campaign.getPortraitUrl()
            };
        }

        this._bindings = [
            {
                event: 'click',
                listener: (event: Event) => this.onClickEvent(event),
                selector: '.game-background, .btn-download, .store-button, .game-icon, .store-badge-container'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onCloseEvent(event),
                selector: '.btn-close-region'
            }
        ];
    }

    public show(): void {
        super.show();

        if(AbstractAdUnit.getAutoClose()) {
            this.onClose.trigger();
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

    private onCloseEvent(event: Event): void {
        event.preventDefault();
        this.onClose.trigger();
    }

    private onClickEvent(event: Event): void {
        event.preventDefault();
        this.onClick.trigger();
    }

}
