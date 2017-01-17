import { NativeBridge } from 'Native/NativeBridge';
import { ThirdParty } from 'Views/ThirdParty';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { Campaign } from 'Models/Campaign';
import { Placement } from 'Models/Placement';
import { FinishState } from 'Constants/FinishState';
import { IObserver0 } from 'Utilities/IObserver';
import { SessionManager } from 'Managers/SessionManager';
import { AdUnitContainer } from 'AdUnits/Containers/AdUnitContainer';

export class HtmlAdUnit extends AbstractAdUnit {

    private _sessionManager: SessionManager;
    private _thirdParty: ThirdParty;
    private _isShowing: boolean;
    private _options: any;
    private _finishState: FinishState;

    private _onShowObserver: IObserver0;
    private _onSystemKillObserver: IObserver0;

    constructor(nativeBridge: NativeBridge, container: AdUnitContainer, sessionManager: SessionManager, placement: Placement, campaign: Campaign, thirdParty: ThirdParty, options: any) {
        super(nativeBridge, container, placement, campaign);
        this._sessionManager = sessionManager;
        this._thirdParty = thirdParty;
        this._isShowing = false;
        this._options = options;
        this._finishState = FinishState.COMPLETED;
    }

    public show(): Promise<void> {
        this._isShowing = true;
        this._thirdParty.show();
        this.onStart.trigger();
        this._nativeBridge.Listener.sendStartEvent(this._placement.getId());
        this._sessionManager.sendStart(this);

        this._onShowObserver = this._container.onShow.subscribe(() => this.onShow());
        this._onSystemKillObserver = this._container.onSystemKill.subscribe(() => this.onSystemKill());

        return this._container.open(this, false, !this._placement.useDeviceOrientationForVideo(), true, this._options);
    }

    public hide(): Promise<void> {
        this._isShowing = false;

        this._container.onShow.unsubscribe(this._onShowObserver);
        this._container.onSystemKill.unsubscribe(this._onSystemKillObserver);

        this._thirdParty.hide();

        this._sessionManager.sendThirdQuartile(this);
        this._sessionManager.sendView(this);

        this.onFinish.trigger();
        this.onClose.trigger();
        this._thirdParty.container().parentElement!.removeChild(this._thirdParty.container());
        this.unsetReferences();

        this._nativeBridge.Listener.sendFinishEvent(this._placement.getId(), this._finishState);

        return this._container.close();
    }

    public isShowing(): boolean {
        return this._isShowing;
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
        if(this._isShowing) {
            this._finishState = FinishState.SKIPPED;
            this.hide();
        }
    }

    private unsetReferences() {
        delete this._thirdParty;
    }
}
