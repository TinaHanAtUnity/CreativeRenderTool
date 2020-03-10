import { AbstractAdUnit, IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { View } from 'Core/Views/View';
import { VastCampaign } from 'VAST/Models/VastCampaign';

export interface IVastEndScreenHandler {
    onVastEndScreenClick(): void;
    onVastEndScreenClose(): void;
    onVastEndScreenShow(): void;
    onKeyEvent(keyCode: number): void;
}

export class VastEndScreen extends View<IVastEndScreenHandler> {

    protected _isSwipeToCloseEnabled: boolean = false;
    protected _campaign: VastCampaign;
    protected _country: string | undefined;
    protected _hidePrivacy: boolean = false;
    protected _callButtonEnabled: boolean = true;

    constructor(parameters: IAdUnitParameters<VastCampaign>) {
        super(parameters.platform, 'vast-end-screen');

        this._campaign = parameters.campaign;
        this._country = parameters.coreConfig.getCountry();
        this._hidePrivacy = parameters.adsConfig.getHidePrivacy() || false;
    }

    public render(): void {
        super.render();

        const chinaAdvertisementElement: HTMLElement | null = this._container.querySelector('.china-advertisement');
        if (this._country === 'CN' && chinaAdvertisementElement) {
            chinaAdvertisementElement.style.display = 'block';
        }

        if (this._isSwipeToCloseEnabled) {
            (<HTMLElement> this._container.querySelector('.btn-close-region')).style.display = 'none';
        }

        // hide privacy icon for China
        if (this._hidePrivacy) {
            this._container.classList.add('hidePrivacyButton');
        }
    }

    public show(): void {
        super.show();

        this._handlers.forEach(handler => handler.onVastEndScreenShow());

        if (AbstractAdUnit.getAutoClose()) {
            setTimeout(() => {
                this._handlers.forEach(handler => handler.onVastEndScreenClose());
            }, AbstractAdUnit.getAutoCloseDelay());
        }
    }

    public remove(): void {
        const container = this.container();
        if (container && container.parentElement) {
            container.parentElement.removeChild(this.container());
        }
    }

    public setCallButtonEnabled(value: boolean) {
        if (this._callButtonEnabled !== value) {
            this._callButtonEnabled = value;
        }
    }

}
