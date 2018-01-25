import { NativeBridge } from 'Native/NativeBridge';
import { AbstractAdUnit, IAdUnitParameters } from 'AdUnits/AbstractAdUnit';
import { FinishState } from 'Constants/FinishState';
import { IObserver0 } from 'Utilities/IObserver';
import { DisplayInterstitialCampaign } from 'Models/Campaigns/DisplayInterstitialCampaign';
import { DisplayInterstitial } from 'Views/DisplayInterstitial';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { Platform } from 'Constants/Platform';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { Placement } from 'Models/Placement';
import { DeviceInfo } from 'Models/DeviceInfo';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { Diagnostics } from 'Utilities/Diagnostics';
import { IWebPlayerWebSettingsAndroid } from "../Native/Api/WebPlayer";

export interface IDisplayInterstitialAdUnitParameters extends IAdUnitParameters<DisplayInterstitialCampaign> {
    view: DisplayInterstitial;
}

export class DisplayInterstitialAdUnit extends AbstractAdUnit {

    private _operativeEventManager: OperativeEventManager;
    private _thirdPartyEventManager: ThirdPartyEventManager;
    private _view: DisplayInterstitial;
    private _options: any;
    private _campaign: DisplayInterstitialCampaign;
    private _placement: Placement;
    private _deviceInfo: DeviceInfo;
    private _receivedOnPageStart: boolean = false;
    private _clickEventHasBeenSent: boolean = false;

    private _onShowObserver: IObserver0;
    private _onSystemKillObserver: IObserver0;

    constructor(nativeBridge: NativeBridge, parameters: IDisplayInterstitialAdUnitParameters) {
        super(nativeBridge, parameters);
        this._operativeEventManager = parameters.operativeEventManager;
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
        this._view = parameters.view;
        this._campaign = parameters.campaign;
        this._placement = parameters.placement;
        this._deviceInfo = parameters.deviceInfo;

        this._view.render();
        document.body.appendChild(this._view.container());

        this._options = parameters.options;
        this.setShowing(false);
    }

    public show(): Promise<void> {
        this.setShowing(true);
        this._container.onShow.subscribe(() => this.onShow);

        return this.setWebPlayerViews().then( () => {
            this._view.show();
            this.onStart.trigger();
            this._nativeBridge.Listener.sendStartEvent(this._placement.getId());
            this.sendStartEvents();

            this._onShowObserver = this._container.onShow.subscribe(() => this.onShow());
            this._onSystemKillObserver = this._container.onSystemKill.subscribe(() => this.onSystemKill());

            // Display ads are always completed.
            this.setFinishState(FinishState.COMPLETED);
            return Promise.resolve();
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
        return this._container.close().then( () => {
            return this._nativeBridge.WebPlayer.clearSettings().then( () => {
                this.onClose.trigger();
            });
        });
    }

    public isCached(): boolean {
        return false;
    }

    public description(): string {
        return 'programmaticImage';
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
        Promise.all([
            this._deviceInfo.getScreenWidth(),
            this._deviceInfo.getScreenHeight()
        ]).then(([screenWidth, screenHeight]) => {
            const closeAreaSizePercent = 0.1;
            const webviewAreaSize = Math.min(screenWidth, screenHeight) * closeAreaSizePercent;
            const webviewXPos = screenWidth - webviewAreaSize;
            const webviewYPos = 0;
            // TODO: leave the webplayer running in background, don't reopen on return
            this._container.setViewFrame('webview', Math.floor(webviewXPos), Math.floor(webviewYPos), Math.floor(webviewAreaSize), Math.floor(webviewAreaSize)).then(() => {
                return this._container.setViewFrame('webplayer', Math.floor(screenWidth), Math.floor(screenHeight), Math.floor(screenWidth), Math.floor(screenHeight)).then(() => {
                    return this.setWebPlayerContent();
                });
            });
        });
    }

    private onSystemKill(): void {
        if(this.isShowing()) {
            this.onClose.trigger();
        }
    }

    private onPageStarted(url: string): void {
        this._nativeBridge.Sdk.logDebug("DisplayInterstitialAdUnit: onPageStarted triggered for url: " + url);
        if(!this._receivedOnPageStart) {
            this._receivedOnPageStart = true;
            return;
        }
        if(this._clickEventHasBeenSent) {
            return;
        }
        this._operativeEventManager.sendClick(this._campaign.getSession(), this._placement, this._campaign);
        this._clickEventHasBeenSent = true;

        for (let trackingUrl of this._campaign.getTrackingUrlsForEvent('click')) {
            trackingUrl = trackingUrl.replace(/%ZONE%/, this._placement.getId());
            trackingUrl = trackingUrl.replace(/%SDK_VERSION%/, this._operativeEventManager.getClientInfo().getSdkVersion().toString());
            this._thirdPartyEventManager.sendEvent('display click', this._campaign.getSession().getId(), trackingUrl);
        }
    }

    private shouldOverrideUrlLoading(url: string, method: string): void {
        this._nativeBridge.Sdk.logDebug("DisplayInterstitialAdUnit: shouldOverrideUrlLoading triggered for url: " + url);
        this._nativeBridge.WebPlayer.setUrl(url);
    }

    private unsetReferences(): void {
        delete this._view;
    }

    private sendStartEvents(): void {
        for (let url of (this._campaign).getTrackingUrlsForEvent('impression')) {
            url = url.replace(/%ZONE%/, this._campaign.getId());
            url = url.replace(/%SDK_VERSION%/, this._operativeEventManager.getClientInfo().getSdkVersion().toString());
            this._nativeBridge.Sdk.logDebug("todo: remove - sendStartEvents - sending " + url);
            this._thirdPartyEventManager.sendEvent('display impression', this._campaign.getSession().getId(), url);
        }
        this._operativeEventManager.sendStart(this._campaign.getSession(), this._placement, this._campaign).then(() => {
            this.onStartProcessed.trigger();
        });
    }

    private setWebPlayerViews(): Promise<void> {
        // TODO: support also iOS!
        const webPlayerSettingsAndroid: IWebPlayerWebSettingsAndroid = {"setJavaScriptCanOpenWindowsAutomatically": [true],
            "setSupportMultipleWindows": [false]};
        return this._nativeBridge.WebPlayer.setSettings(webPlayerSettingsAndroid,{}).then( () => {
            this._nativeBridge.Sdk.logDebug("DisplayInterstitalAdUnit: WebPlayer settings have been set");
            return this._container.open(this, ['webplayer', 'webview'], false, this._forceOrientation, true, false, true, false, this._options).catch((e) => {
                this.hide();
            });
        });
    }

    private setWebPlayerData(data: string, mimeType: string, encoding: string, markupBaseUrl?: string): Promise<void> {
        let dataPromise: Promise<void>;
        if(markupBaseUrl) {
            dataPromise = this._nativeBridge.WebPlayer.setDataWithUrl(markupBaseUrl, data, mimeType, encoding);
        } else {
            dataPromise = this._nativeBridge.WebPlayer.setData(data, mimeType, encoding);
        }

        return dataPromise.catch( (error) => {
            this._nativeBridge.Sdk.logError(JSON.stringify(error));
            Diagnostics.trigger('webplayer_set_data_error', new DiagnosticError(error, {data: data, mimeType: mimeType, encoding: encoding}));
            this.setFinishState(FinishState.ERROR);
            this.hide();
        });
    }

    private setWebplayerSettings(): Promise<void> {
        const eventSettings = { 'onPageStarted': {'sendEvent': true},
            'shouldOverrideUrlLoading': {'sendEvent': true, 'returnValue': true}
        };
        this._nativeBridge.WebPlayer.onPageStarted.subscribe( (url) => this.onPageStarted(url));
        this._nativeBridge.WebPlayer.shouldOverrideUrlLoading.subscribe( (url: string, method: string) => this.shouldOverrideUrlLoading(url, method));
        return this._nativeBridge.WebPlayer.setEventSettings(eventSettings);
    }

    // TODO: we only have content in current auction response, dump the url stuff
    private setWebPlayerContent(): Promise<void> {
        return this.setWebplayerSettings().then( () => {
            const markup = this._campaign.getDynamicMarkup();
            return this.setWebPlayerData(markup, 'text/html', 'UTF-8');
        });
    }
}
