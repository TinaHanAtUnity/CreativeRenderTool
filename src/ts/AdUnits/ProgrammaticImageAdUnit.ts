import { NativeBridge } from 'Native/NativeBridge';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { Placement } from 'Models/Placement';
import { FinishState } from 'Constants/FinishState';
import { IObserver0 } from 'Utilities/IObserver';
import { SessionManager } from 'Managers/SessionManager';
import { ProgrammaticImageCampaign } from 'Models/ProgrammaticImageCampaign';
import { ProgrammaticImage } from 'Views/ProgrammaticImage';
import { AdUnitContainer, ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';

export class ProgrammaticImageAdUnit extends AbstractAdUnit {
    private _sessionManager: SessionManager;
    private _view: ProgrammaticImage;
    private _options: any;

    private _onShowObserver: IObserver0;
    private _onSystemKillObserver: IObserver0;

    constructor(nativeBridge: NativeBridge, container: AdUnitContainer, sessionManager: SessionManager, placement: Placement, campaign: ProgrammaticImageCampaign, view: ProgrammaticImage, options: any) {
        super(nativeBridge, ForceOrientation.NONE, container, placement, campaign);
        this._sessionManager = sessionManager;
        this._view = view;

        this._options = options;
        this.setShowing(false);
    }

    public show(): Promise<void> {
        this.setShowing(true);
        this._view.show();
        this.onStart.trigger();
        this._nativeBridge.Listener.sendStartEvent(this._placement.getId());
        this._sessionManager.sendStart(this);

        this._onShowObserver = this._container.onShow.subscribe(() => this.onShow());
        this._onSystemKillObserver = this._container.onSystemKill.subscribe(() => this.onSystemKill());

        return this._container.open(this, false, true, this._forceOrientation, true, this._options);
    }

    public hide(): Promise<void> {
        if(!this.isShowing()) {
            return Promise.resolve();
        }
        this.setShowing(false);

        this._container.onShow.unsubscribe(this._onShowObserver);
        this._container.onSystemKill.unsubscribe(this._onSystemKillObserver);

        this._view.hide();

        const finishState = this.getFinishState();
        if(finishState === FinishState.COMPLETED) {
            this._sessionManager.sendThirdQuartile(this);
            this._sessionManager.sendView(this);
        } else if(finishState === FinishState.SKIPPED) {
            this._sessionManager.sendSkip(this);
        }

        this.onFinish.trigger();
        this._view.container().parentElement!.removeChild(this._view.container());
        this.unsetReferences();

        this._nativeBridge.Listener.sendFinishEvent(this._placement.getId(), this.getFinishState());

        return this._container.close().then(() => {
            this.onClose.trigger();
        });
    }

    public isCached(): boolean {
        return true;
    }

    public description(): string {
        return 'programmaticImage';
    }

    private onShow() {
        if(AbstractAdUnit.getAutoClose()) {
            setTimeout(() => {
                this.setFinishState(FinishState.COMPLETED);
                this.hide();
            }, AbstractAdUnit.getAutoCloseDelay());
        }
    }

    private onSystemKill() {
        if(this.isShowing()) {
            this.setFinishState(FinishState.SKIPPED);
            this.hide();
        }
    }

    private unsetReferences() {
        delete this._view;
    }
}
