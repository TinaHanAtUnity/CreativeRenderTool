import { NativeBridge } from 'Native/NativeBridge';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { Campaign } from 'Models/Campaign';
import { Placement } from 'Models/Placement';
import { FinishState } from 'Constants/FinishState';
import { IObserver0 } from 'Utilities/IObserver';
import { SessionManager } from 'Managers/SessionManager';
import { MRAID, IOrientationProperties } from 'Views/MRAID';
import { AdUnitContainer, ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';

export class MRAIDAdUnit extends AbstractAdUnit {

    private _sessionManager: SessionManager;
    private _mraid: MRAID;
    private _options: any;
    private _orientationProperties: IOrientationProperties;

    private _onShowObserver: IObserver0;
    private _onSystemKillObserver: IObserver0;

    constructor(nativeBridge: NativeBridge, container: AdUnitContainer, sessionManager: SessionManager, placement: Placement, campaign: Campaign, mraid: MRAID, options: any) {
        super(nativeBridge, container, placement, campaign);
        this._sessionManager = sessionManager;
        this._mraid = mraid;

        this._orientationProperties = {
            allowOrientationChange: true,
            forceOrientation: ForceOrientation.NONE
        };

        mraid.onOrientationProperties.subscribe((properties) => {
            if(this.isShowing()) {
                container.reorient(properties.allowOrientationChange, properties.forceOrientation);
            } else {
                this._orientationProperties = properties;
            }
        });

        this._options = options;
        this.setShowing(false);
    }

    public show(): Promise<void> {
        this.setShowing(true);
        this._mraid.show();
        this.onStart.trigger();
        this._nativeBridge.Listener.sendStartEvent(this._placement.getId());
        this._sessionManager.sendStart(this);

        this._onShowObserver = this._container.onShow.subscribe(() => this.onShow());
        this._onSystemKillObserver = this._container.onSystemKill.subscribe(() => this.onSystemKill());

        return this._container.open(this, false, this._orientationProperties.allowOrientationChange, this._orientationProperties.forceOrientation, true, this._options);
    }

    public hide(): Promise<void> {
        if(!this.isShowing()) {
            return Promise.resolve();
        }
        this.setShowing(false);

        this._container.onShow.unsubscribe(this._onShowObserver);
        this._container.onSystemKill.unsubscribe(this._onSystemKillObserver);

        this._mraid.hide();

        this.onFinish.trigger();
        this.onClose.trigger();
        this._mraid.container().parentElement!.removeChild(this._mraid.container());
        this.unsetReferences();

        this._nativeBridge.Listener.sendFinishEvent(this._placement.getId(), this.getFinishState());

        return this._container.close();
    }

    public description(): string {
        return 'mraid';
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
        delete this._mraid;
    }
}
