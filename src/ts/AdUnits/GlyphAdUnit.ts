import { NativeBridge } from 'Native/NativeBridge';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { Placement } from 'Models/Placement';
import { GlyphCampaign } from 'Models/Campaigns/GlyphCampaign';
import { GlyphView } from 'Views/GlyphView';
import { AdUnitContainer, ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { FinishState } from 'Constants/FinishState';

export class GlyphAdUnit extends AbstractAdUnit {
    private _operativeEventManager: OperativeEventManager;
    private _view: GlyphView;
    private _options: any;

    constructor(nativeBridge: NativeBridge, container: AdUnitContainer, operativeEventManager: OperativeEventManager, placement: Placement, campaign: GlyphCampaign, view: GlyphView, options: any) {
        super(nativeBridge, ForceOrientation.NONE, container, placement, campaign);
        this._operativeEventManager = operativeEventManager;
        this._view = view;

        this._options = options;

        this._view.onSkip.subscribe(() => this.onSkip());
    }

    public show(): Promise<void> {
        return this._container.open(this, true, false, this._forceOrientation, true, false, true, false, this._options).then(() => {
            this.onShow();
            this.showView();
        });
    }

    public hide(): Promise<void> {
        this.onHide();
        this.hideView();
        return this._container.close();
    }

    public isCached(): boolean {
        return false;
    }

    public description(): string {
        return 'Glyph';
    }

    private onShow() {
        this.setShowing(true);
    }

    private showView() {
        this._view.show();
        document.body.appendChild(this._view.container());
    }

    private onHide() {
        this.setShowing(false);
        this._nativeBridge.Listener.sendFinishEvent(this._placement.getId(), this.getFinishState());
        this.onClose.trigger();
    }

    private hideView() {
        this._view.hide();
        document.body.removeChild(this._view.container());
    }

    private onSkip() {
        this.setFinishState(FinishState.SKIPPED);
        this.hide();
    }
}
