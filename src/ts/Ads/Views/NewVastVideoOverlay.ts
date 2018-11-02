import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { AbstractPrivacy, IPrivacyHandler } from 'Ads/Views/AbstractPrivacy';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { NewVideoOverlay } from './NewVideoOverlay';
import { ABGroup } from 'Core/Models/ABGroup';

export class NewVastVideoOverlay extends NewVideoOverlay implements IPrivacyHandler {

    private _seatId: number | undefined;
    private _hasEndcard: boolean;
    private _gdprPopupClicked: boolean = false;
    private _showGDPRBanner: boolean;

    constructor(nativeBridge: NativeBridge, muted: boolean, language: string, gameId: string, privacy: AbstractPrivacy, showGDPRBanner: boolean, abGroup: ABGroup, hasEndcard: boolean, seatId: number | undefined) {
        super(nativeBridge, muted, language, gameId, privacy, abGroup, true);

        this._seatId = seatId;
        this._hasEndcard = hasEndcard;
        this._showGDPRBanner = showGDPRBanner;
    }

    public hide() {
        super.hide();
        if (!this._gdprPopupClicked) {
            this._handlers.forEach(handler => handler.onGDPRPopupSkipped());
        }
    }

    public choosePrivacyShown(): void {
        if (!this._gdprPopupClicked && this._showGDPRBanner) {
            this._container.classList.add('show-gdpr-banner');
            this._container.classList.remove('show-gdpr-button');
        } else {
            this._container.classList.remove('show-gdpr-banner');
            this._container.classList.add('show-gdpr-button');
        }
    }

    public render(): void {
        super.render();
        this.choosePrivacyShown();

        if (CustomFeatures.isTencentAdvertisement(this._seatId)) {
            const tencentAdTag = <HTMLElement>this._container.querySelector('.tencent-advertisement');
            if (tencentAdTag) {
                tencentAdTag.innerText = '广告';
            }
        }
    }

    protected onGDPRPopupEvent(event: Event) {
        super.onGDPRPopupEvent(event);
        if (!this._gdprPopupClicked) {
            this._gdprPopupClicked = true;
            this.choosePrivacyShown();
        }
    }

    protected cleanUpPrivacy() {
        // Only delete if control doesn't need to be transferred to endscreen
        if (!this._hasEndcard && this._privacy) {
            this._privacy.hide();
            document.body.removeChild(this._privacy.container());
            delete this._privacy;
        }
    }
}
