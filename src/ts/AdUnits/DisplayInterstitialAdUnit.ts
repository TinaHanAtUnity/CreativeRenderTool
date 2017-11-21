import { NativeBridge } from 'Native/NativeBridge';
import { AbstractAdUnit, IAdUnitParameters } from 'AdUnits/AbstractAdUnit';
import { FinishState } from 'Constants/FinishState';
import { IObserver0 } from 'Utilities/IObserver';
import { DisplayInterstitialCampaign } from 'Models/Campaigns/DisplayInterstitialCampaign';
import { DisplayInterstitial } from 'Views/DisplayInterstitial';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { Platform } from 'Constants/Platform';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { ViewConfiguration } from "./Containers/AdUnitContainer";
import { DeviceInfo } from 'Models/DeviceInfo';

export interface IDisplayInterstitialAdUnitParameters extends IAdUnitParameters<DisplayInterstitialCampaign> {
    view: DisplayInterstitial;
}

export class DisplayInterstitialAdUnit extends AbstractAdUnit<DisplayInterstitialCampaign> {

    private _operativeEventManager: OperativeEventManager;
    private _thirdPartyEventManager: ThirdPartyEventManager;
    private _view: DisplayInterstitial;
    private _options: any;
    private _deviceInfo: DeviceInfo;

    private _onShowObserver: IObserver0;
    private _onSystemKillObserver: IObserver0;

    constructor(nativeBridge: NativeBridge, parameters: IDisplayInterstitialAdUnitParameters) {
        super(nativeBridge, parameters);
        this._operativeEventManager = parameters.operativeEventManager;
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
        this._view = parameters.view;
        this._deviceInfo = parameters.deviceInfo;

        this._view.render();
        document.body.appendChild(this._view.container());

        this._options = parameters.options;
        this.setShowing(false);
    }

    public show(): Promise<void> {
        this.setShowing(true);
        return this.setWebPlayerViews().then( () => {
            this._view.show();
            this.onStart.trigger();
            this._nativeBridge.Listener.sendStartEvent(this._placement.getId());
            this.sendStartEvents();

            this._onShowObserver = this._container.onShow.subscribe(() => this.onShow());
            this._onSystemKillObserver = this._container.onSystemKill.subscribe(() => this.onSystemKill());

            // Display ads are always completed.
            this.setFinishState(FinishState.COMPLETED);
            this._nativeBridge.Sdk.logDebug("MBNET will be set");
            return this.setWebPlayerUrl("https://mbnet.fi").then( () => {
                this._nativeBridge.Sdk.logDebug("MBNET should be loading!");
            });

        });
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

        for (let url of this._campaign.getTrackingUrlsForEvent('click')) {
            url = url.replace(/%ZONE%/, this.getPlacement().getId());
            url = url.replace(/%SDK_VERSION%/, this._operativeEventManager.getClientInfo().getSdkVersion().toString());
            this._thirdPartyEventManager.sendEvent('display click', this._campaign.getSession().getId(), url);
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
        for (let url of (this._campaign).getTrackingUrlsForEvent('impression')) {
            url = url.replace(/%ZONE%/, (this.getCampaign()).getId());
            url = url.replace(/%SDK_VERSION%/, this._operativeEventManager.getClientInfo().getSdkVersion().toString());
            this._thirdPartyEventManager.sendEvent('display impression', (this.getCampaign()).getSession().getId(), url);
        }
        this._operativeEventManager.sendStart(this);
    }

    private setWebPlayerViews(): Promise<void> {
        return Promise.all([
            this._deviceInfo.getScreenWidth(),
            this._deviceInfo.getScreenHeight()
        ]).then(([screenWidth, screenHeight]) => {
            const closeAreaSizePercent = 0.1;
            const webviewXSize = screenWidth * closeAreaSizePercent;
            const webviewYSize = screenHeight * closeAreaSizePercent;
            const webviewXPos = screenWidth - webviewXSize;
            const webviewYPos = 0;
            return this._container.open(this, ['webplayer', 'webview'], false, this._forceOrientation, true, false, true, false, this._options).then( () => {
                const onShowObserver = this._container.onShow.subscribe(() => {
                    return this._container.setViewFrame('webview', Math.floor(webviewXPos), Math.floor(webviewYPos), Math.floor(webviewXSize), Math.floor(webviewYSize)).then(() => {
                        return this._container.setViewFrame('webplayer', Math.floor(screenWidth), Math.floor(screenHeight), Math.floor(screenWidth), Math.floor(screenHeight)).then(() => {
                            this._container.onShow.unsubscribe(onShowObserver);
                        });
                    });
                });
            });
        });
    }


    private setWebPlayerUrl(url: string): Promise<void> {
        // TODO: prepare for exception if the view for webplayer does not exist and handle gracefully
        if(this._nativeBridge.getPlatform() === Platform.IOS) {
            return this._nativeBridge.IosAdUnit.setWebPlayerUrl(url);
        } else {
            return this._nativeBridge.AndroidAdUnit.setWebPlayerUrl(url);
        }
    }

    private setWebPlayerData(data: string, mimeType: string, encoding: string): Promise<void> {
        // TODO: prepare for exception if the view for webplayer does not exist and handle gracefully
        if(this._nativeBridge.getPlatform() === Platform.IOS) {
            return this._nativeBridge.IosAdUnit.setWebPlayerData(data, mimeType, encoding);
        } else {
            return this._nativeBridge.AndroidAdUnit.setWebPlayerData(data, mimeType, encoding);
        }
    }
}
