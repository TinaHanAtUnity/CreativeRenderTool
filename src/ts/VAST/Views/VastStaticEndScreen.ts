import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { AbstractPrivacy, IPrivacyHandlerView } from 'Ads/Views/AbstractPrivacy';
import { Template } from 'Core/Utilities/Template';
import VastStaticEndScreenTemplate from 'html/VastStaticEndScreen.html';
import { VastEndScreen } from 'VAST/Views/VastEndScreen';
import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { AdUnitContainer, ViewConfiguration } from 'Ads/AdUnits/Containers/AdUnitContainer';

export class VastStaticEndScreen extends VastEndScreen implements IPrivacyHandlerView {

    private _privacy: AbstractPrivacy;
    private _adUnitContainer: AdUnitContainer;

    constructor(parameters: IAdUnitParameters<VastCampaign>, attachTap?: boolean | undefined) {
        super(parameters, attachTap);

        this._privacy = parameters.privacy;
        this._template = new Template(VastStaticEndScreenTemplate);
        this._adUnitContainer = parameters.container;
        const landscape = this._campaign.getStaticLandscape();
        const portrait = this._campaign.getStaticPortrait();

        this._templateData = {
            'endScreenLandscape': (landscape ? landscape.getUrl() : (portrait ? portrait.getUrl() : undefined)),
            'endScreenPortrait': (portrait ? portrait.getUrl() : (landscape ? landscape.getUrl() : undefined))
        };

        this._bindings = [
            {
                event: 'click',
                listener: (event: Event) => this.onClickEvent(event),
                selector: '.game-background'
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

        if (CustomFeatures.isTimehopApp(parameters.clientInfo.getGameId())) {
            this._isSwipeToCloseEnabled = true;

            this._bindings.push({
                event: 'swipe',
                listener: (event: Event) => this.onCloseEvent(event),
                selector: '.campaign-container, .game-background'
            });
        }
    }

    public show(): Promise<void> {
        return this._adUnitContainer.reconfigure(ViewConfiguration.ENDSCREEN).then(() => {
            this._adUnitContainer.reorient(false, this._adUnitContainer.getLockedOrientation()).then(() => {
                super.show();
            });
        });
    }

    public remove(): void {
        super.remove();
        if (this._privacy) {
            this._privacy.hide();
            const privacyContainer = this._privacy.container();
            if (privacyContainer && privacyContainer.parentElement) {
                privacyContainer.parentElement.removeChild(privacyContainer);
            }
            delete this._privacy;
        }
    }

    public onPrivacyClose(): void {
        if (this._privacy) {
            this._privacy.hide();
        }
    }

    private onCloseEvent(event: Event): void {
        event.preventDefault();
        this._handlers.forEach(handler => handler.onVastEndScreenClose());
    }

    private onClickEvent(event: Event): void {
        if (!this._callButtonEnabled) {
            return;
        }
        event.preventDefault();
        this._handlers.forEach(handler => handler.onVastEndScreenClick());
    }

    private onPrivacyEvent(event: Event): void {
        event.preventDefault();
        this._privacy.show();
    }
}
