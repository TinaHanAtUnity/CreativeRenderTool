import { NativeBridge } from 'Native/NativeBridge';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { Placement } from 'Models/Placement';
import { FinishState } from 'Constants/FinishState';
import { IObserver0 } from 'Utilities/IObserver';
import { Observable1, Observable0 } from 'Utilities/Observable';
import { SessionManager } from 'Managers/SessionManager';
import { DisplayInterstitialCampaign } from 'Models/DisplayInterstitialCampaign';
import { DisplayInterstitial } from 'Views/DisplayInterstitial';
import { AdUnitContainer, ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';

export class DisplayInterstitialAdUnit extends AbstractAdUnit {
    public onRedirect = new Observable1<string>();
    public onSkip = new Observable0();

    private _sessionManager: SessionManager;
    private _view: DisplayInterstitial;
    private _options: any;

    private _onShowObserver: IObserver0;
    private _onSystemKillObserver: IObserver0;

    constructor(nativeBridge: NativeBridge, container: AdUnitContainer, sessionManager: SessionManager, placement: Placement, campaign: DisplayInterstitialCampaign, view: DisplayInterstitial, options: any) {
        super(nativeBridge, ForceOrientation.NONE, container, placement, campaign);
        this._sessionManager = sessionManager;
        this._view = view;

        this._options = options;
        this.setShowing(false);

        view.onClick.subscribe((href) => this.onRedirect.trigger(href));
    }

    public show(): Promise<void> {
        this.setShowing(true);
        this._view.show();
        this.onStart.trigger();
        this._nativeBridge.Listener.sendStartEvent(this._placement.getId());
        this._sessionManager.sendStart(this);

        this._onShowObserver = this._container.onShow.subscribe(() => this.onShow());
        this._onSystemKillObserver = this._container.onSystemKill.subscribe(() => this.onSystemKill());

        // Display ads are always completed.
        this.setFinishState(FinishState.COMPLETED);

        return this._container.open(this, false, false, this._forceOrientation, true, false, true, false, this._options);
    }

    public hide(): Promise<void> {
        if(!this.isShowing()) {
            return Promise.resolve();
        }
        this.setShowing(false);

        this._container.onShow.unsubscribe(this._onShowObserver);
        this._container.onSystemKill.unsubscribe(this._onSystemKillObserver);

        this._view.hide();

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
