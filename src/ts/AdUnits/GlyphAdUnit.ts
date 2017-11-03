import { NativeBridge } from 'Native/NativeBridge';
import { AbstractAdUnit, IAdUnitParameters } from 'AdUnits/AbstractAdUnit';
import { GlyphCampaign } from 'Models/Campaigns/GlyphCampaign';
import { GlyphView, IGlyphEventHandler } from 'Views/GlyphView';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { FinishState } from 'Constants/FinishState';
export interface IGlyphAdUnitParameters extends IAdUnitParameters<GlyphCampaign> {
    view: GlyphView;
}
export class GlyphAdUnit extends AbstractAdUnit<GlyphCampaign> implements IGlyphEventHandler {
    private _operativeEventManager: OperativeEventManager;
    private _view: GlyphView;
    private _options: any;

    constructor(nativeBridge: NativeBridge, parameters: IGlyphAdUnitParameters) {
        super(nativeBridge, parameters);
        this._operativeEventManager = parameters.operativeEventManager;
        this._view = parameters.view;
        this._options = parameters.options;
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

    public onSkip() {
        this.setFinishState(FinishState.SKIPPED);
        this.hide();
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
}
