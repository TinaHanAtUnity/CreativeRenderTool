import { NativeBridge } from 'Native/NativeBridge';
import { ThirdParty } from 'Views/ThirdParty';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { Campaign } from 'Models/Campaign';
import { Placement } from 'Models/Placement';

export class ThirdPartyAdUnit extends AbstractAdUnit {

    private _thirdParty: ThirdParty;
    private _isShowing: boolean;

    constructor(nativeBridge: NativeBridge, placement: Placement, campaign: Campaign, thirdParty: ThirdParty) {
        super(nativeBridge, placement, campaign);
        this._thirdParty = thirdParty;
        this._isShowing = false;
    }

    public show(): Promise<void> {
        this._isShowing = true;
        this._thirdParty.show();
        this.onStart.trigger();
        return Promise.resolve(void(0));
    }

    public hide(): Promise<void> {
        this._isShowing = false;
        this._thirdParty.hide();
        this.onFinish.trigger();
        this.onClose.trigger();
        this._thirdParty.container().parentElement.removeChild(this._thirdParty.container());
        this.unsetReferences();
        return Promise.resolve(void(0));
    }

    public isShowing(): boolean {
        return this._isShowing;
    }

    private unsetReferences() {
        delete this._thirdParty;
    }

}
