import { NativeBridge } from 'Native/NativeBridge';
import { ThirdParty } from 'Views/ThirdParty';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { Campaign } from 'Models/Campaign';
import { Placement } from 'Models/Placement';
import { FinishState } from 'Constants/FinishState';
import { IObserver0 } from 'Utilities/IObserver';
import { SessionManager } from 'Managers/SessionManager';
import { AdUnitContainer, ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';

export class HtmlAdUnit extends AbstractAdUnit {

    private _sessionManager: SessionManager;
    private _thirdParty: ThirdParty;
    private _options: any;

    private _onShowObserver: IObserver0;
    private _onSystemKillObserver: IObserver0;

    constructor(nativeBridge: NativeBridge, container: AdUnitContainer, sessionManager: SessionManager, placement: Placement, campaign: Campaign, thirdParty: ThirdParty, options: any) {
        super(nativeBridge, container, placement, campaign);
        this._sessionManager = sessionManager;
        this._thirdParty = thirdParty;
        this._options = options;
    }

    public show(): Promise<void> {
        this.setShowing(true);
        this._thirdParty.show();
        this.onStart.trigger();
        this._nativeBridge.Listener.sendStartEvent(this._placement.getId());
        this._sessionManager.sendStart(this);

        this._onShowObserver = this._container.onShow.subscribe(() => this.onShow());
        this._onSystemKillObserver = this._container.onSystemKill.subscribe(() => this.onSystemKill());

        return this._container.open(this, false, true, ForceOrientation.NONE, true, this._options);
    }

    public hide(): Promise<void> {
        this.setShowing(false);
        this.setFinishState(FinishState.COMPLETED);

        this._container.onShow.unsubscribe(this._onShowObserver);
        this._container.onSystemKill.unsubscribe(this._onSystemKillObserver);

        this._thirdParty.hide();

        this._sessionManager.sendThirdQuartile(this);
        this._sessionManager.sendView(this);

        this.onFinish.trigger();
        this.onClose.trigger();
        this._thirdParty.container().parentElement!.removeChild(this._thirdParty.container());
        this.unsetReferences();

        this._nativeBridge.Listener.sendFinishEvent(this._placement.getId(), this.getFinishState());

        return this._container.close();
    }

    public description(): string {
        return 'playable';
    }

    private onShow() {
        if(AbstractAdUnit.getAutoClose()) {
            setTimeout(() => {
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
        delete this._thirdParty;
    }
}
