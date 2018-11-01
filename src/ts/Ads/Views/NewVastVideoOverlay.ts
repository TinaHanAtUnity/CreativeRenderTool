import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { AbstractPrivacy, IPrivacyHandler } from 'Ads/Views/AbstractPrivacy';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { NewVideoOverlay } from './NewVideoOverlay';

export class NewVastVideoOverlay extends NewVideoOverlay implements IPrivacyHandler {

    private _seatId: number | undefined;
    private _hasEndcard: boolean;

    constructor(nativeBridge: NativeBridge, muted: boolean, language: string, gameId: string, privacy: AbstractPrivacy, showGDPRBanner: boolean, hasEndcard: boolean, seatId: number | undefined) {
        super(nativeBridge, muted, language, gameId, privacy, showGDPRBanner, true, true);

        this._seatId = seatId;
        this._hasEndcard = hasEndcard;
    }

    public hide() {
        super.hide();

        if (!this._hasEndcard && this._privacy) {
            this._privacy.hide();
            document.body.removeChild(this._privacy.container());
            delete this._privacy;
        }
    }

    public render(): void {
        super.render();

        if (CustomFeatures.isTencentAdvertisement(this._seatId)) {
            const tencentAdTag = <HTMLElement>this._container.querySelector('.tencent-advertisement');
            if (tencentAdTag) {
                tencentAdTag.innerText = '广告';
            }
        }
    }
}
