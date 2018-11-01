import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { AbstractPrivacy, IPrivacyHandler } from 'Ads/Views/AbstractPrivacy';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { NewVideoOverlay } from './NewVideoOverlay';
import { ABGroup } from 'Core/Models/ABGroup';

export class NewVastVideoOverlay extends NewVideoOverlay implements IPrivacyHandler {

    private _seatId: number | undefined;
    private _hasEndcard: boolean;

    constructor(nativeBridge: NativeBridge, muted: boolean, language: string, gameId: string, privacy: AbstractPrivacy, showGDPRBanner: boolean, abGroup: ABGroup, hasEndcard: boolean, seatId: number | undefined) {
        super(nativeBridge, muted, language, gameId, privacy, showGDPRBanner, abGroup, true);

        this._seatId = seatId;
        this._hasEndcard = hasEndcard;
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

    protected cleanUpPrivacy() {
        // Only delete if control doesn't need to be transferred to endscreen
        if (!this._hasEndcard && this._privacy) {
            this._privacy.hide();
            document.body.removeChild(this._privacy.container());
            delete this._privacy;
        }
    }
}
