import { NativeBridge } from 'Native/NativeBridge';
import { AbstractAdUnit, IAdUnitParameters } from 'AdUnits/AbstractAdUnit';
import { FinishState } from 'Constants/FinishState';
import { IObserver0 } from 'Utilities/IObserver';
import { DisplayInterstitialCampaign } from 'Models/Campaigns/DisplayInterstitialCampaign';
import { DisplayInterstitial, IDisplayInterstitialHandler } from 'Views/DisplayInterstitial';
import { ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { Platform } from 'Constants/Platform';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';

export interface IDisplayInterstitialAdUnitParameters<T extends IDisplayInterstitialHandler> extends IAdUnitParameters {
    view: DisplayInterstitial;
    displayInterstitialEventHandler: { new(nativeBridge: NativeBridge, adUnit: AbstractAdUnit, parameters: IAdUnitParameters): T; };
}

export class DisplayInterstitialAdUnit extends AbstractAdUnit {

    private _operativeEventManager: OperativeEventManager;
    private _thirdPartyEventManager: ThirdPartyEventManager;
    private _displayInterstitialEventHandler: IDisplayInterstitialHandler;
    private _view: DisplayInterstitial;
    private _options: any;

    private _onShowObserver: IObserver0;
    private _onSystemKillObserver: IObserver0;

    constructor(nativeBridge: NativeBridge, parameters: IDisplayInterstitialAdUnitParameters<IDisplayInterstitialHandler>) {
        super(nativeBridge, ForceOrientation.NONE, parameters.container, parameters.placement, parameters.campaign);
        this._operativeEventManager = parameters.operativeEventManager;
        this._view = parameters.view;

        this._view.render();
        document.body.appendChild(this._view.container());

        this._options = parameters.options;
        this.setShowing(false);

        this._displayInterstitialEventHandler = new parameters.displayInterstitialEventHandler(nativeBridge, this, parameters);
        this._view.addHandler(this._displayInterstitialEventHandler);
    }

    public show(): Promise<void> {
        this.setShowing(true);
        this._view.show();
        this.onStart.trigger();
        this._nativeBridge.Listener.sendStartEvent(this._placement.getId());
        this.sendStartEvents();

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

        return this._container.close();
    }

    public isCached(): boolean {
        return false;
    }

    public description(): string {
        return 'programmaticImage';
    }

    public openLink(href: string): void {
        this._operativeEventManager.sendClick(this);

        for (let url of (<DisplayInterstitialCampaign>this.getCampaign()).getTrackingUrlsForEvent('click')) {
            url = url.replace(/%ZONE%/, this.getPlacement().getId());
            url = url.replace(/%SDK_VERSION%/, this._operativeEventManager.getClientInfo().getSdkVersion().toString());
            this._thirdPartyEventManager.sendEvent('display click', (<DisplayInterstitialCampaign>this.getCampaign()).getSession().getId(), url);
        }

        if (this.isWhiteListedLinkType(href)) {
            if(this._nativeBridge.getPlatform() === Platform.ANDROID) {
                this._nativeBridge.Intent.launch({
                    'action': 'android.intent.action.VIEW',
                    'uri': href
                });
            } else {
                this._nativeBridge.UrlScheme.open(href);
            }
        }
    }

    private isWhiteListedLinkType(href: string): boolean {
        const whiteListedProtocols = ['http', 'market', 'itunes'];
        for (const protocol of whiteListedProtocols) {
            if (href.indexOf(protocol) === 0) {
                return true;
            }
        }
        return false;
    }

    private onShow(): void {
        if(AbstractAdUnit.getAutoClose()) {
            setTimeout(() => {
                this.setFinishState(FinishState.COMPLETED);
                this.hide();
            }, AbstractAdUnit.getAutoCloseDelay());
        }
    }

    private onSystemKill(): void {
        if(this.isShowing()) {
            this.onClose.trigger();
        }
    }

    private unsetReferences(): void {
        delete this._view;
    }

    private sendStartEvents(): void {
        for (let url of (<DisplayInterstitialCampaign>this._campaign).getTrackingUrlsForEvent('impression')) {
            url = url.replace(/%ZONE%/, (<DisplayInterstitialCampaign>this.getCampaign()).getId());
            url = url.replace(/%SDK_VERSION%/, this._operativeEventManager.getClientInfo().getSdkVersion().toString());
            this._thirdPartyEventManager.sendEvent('display impression', (<DisplayInterstitialCampaign>this.getCampaign()).getSession().getId(), url);
        }
        this._operativeEventManager.sendStart(this);
    }
}
