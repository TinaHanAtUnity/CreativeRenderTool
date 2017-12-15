import { NativeBridge } from 'Native/NativeBridge';
import { AbstractAdUnit, IAdUnitParameters } from 'AdUnits/AbstractAdUnit';
import { FinishState } from 'Constants/FinishState';
import { IObserver0 } from 'Utilities/IObserver';
import { DisplayInterstitialCampaign } from 'Models/Campaigns/DisplayInterstitialCampaign';
import { DisplayInterstitial } from 'Views/DisplayInterstitial';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { Platform } from 'Constants/Platform';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { DeviceInfo } from 'Models/DeviceInfo';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { Diagnostics } from 'Utilities/Diagnostics';

export interface IDisplayInterstitialAdUnitParameters extends IAdUnitParameters<DisplayInterstitialCampaign> {
    view: DisplayInterstitial;
}

// TODO: Open questions:
// - Do we want to use the clickThroughUrl? How should it be used?
// - What will the campaign content look like? (for parser)

export class DisplayInterstitialAdUnit extends AbstractAdUnit<DisplayInterstitialCampaign> {

    private _operativeEventManager: OperativeEventManager;
    private _thirdPartyEventManager: ThirdPartyEventManager;
    private _view: DisplayInterstitial;
    private _options: any;
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

    // TODO: do we need this?
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
                    this.setWebPlayerContent();
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
        this._operativeEventManager.sendClick(this);
        this._clickEventHasBeenSent = true;

        for (let trackingUrl of this._campaign.getTrackingUrlsForEvent('click')) {
            trackingUrl = trackingUrl.replace(/%ZONE%/, this.getPlacement().getId());
            trackingUrl = trackingUrl.replace(/%SDK_VERSION%/, this._operativeEventManager.getClientInfo().getSdkVersion().toString());
            this._thirdPartyEventManager.sendEvent('display click', this._campaign.getSession().getId(), trackingUrl);
        }
    }

    private unsetReferences(): void {
        delete this._view;
    }

    private sendStartEvents(): void {
        for (let url of (this._campaign).getTrackingUrlsForEvent('impression')) {
            url = url.replace(/ /, (this.getCampaign()).getId());
            url = url.replace(/%SDK_VERSION%/, this._operativeEventManager.getClientInfo().getSdkVersion().toString());
            this._nativeBridge.Sdk.logDebug("todo: remove - sendStartEvents - sending " + url);
            this._thirdPartyEventManager.sendEvent('display impression', (this.getCampaign()).getSession().getId(), url);
        }
        this._operativeEventManager.sendStart(this);
    }

    private setWebPlayerViews(): Promise<void> {
        return this._nativeBridge.WebPlayer.setSettings({}, {}).then( () => {
            this._nativeBridge.Sdk.logDebug("DisplayInterstitalAdUnit: WebPlayer settings have been set");
            return this._container.open(this, ['webplayer', 'webview'], false, this._forceOrientation, true, false, true, false, this._options);
        });
    }

    private setWebPlayerUrl(url: string): Promise<void> {
        return this._nativeBridge.WebPlayer.setUrl(url).catch( (error) => {
            this._nativeBridge.Sdk.logError(JSON.stringify(error));
            Diagnostics.trigger('webplayer_set_url_error', new DiagnosticError(error, { url: url}));
            this.setFinishState(FinishState.ERROR);
            this.hide();
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
        const eventSettings = { 'onPageStarted': {'sendEvent':true} };
        this._nativeBridge.WebPlayer.onPageStarted.subscribe( (url) => this.onPageStarted(url));
        return this._nativeBridge.WebPlayer.setEventSettings(eventSettings);
    }

    private setWebPlayerContent(): Promise<void> {
        const markupUrl = this._campaign.getMarkupUrl();
        const markupBaseUrl = this._campaign.getMarkupBaseUrl();

        return this.setWebplayerSettings().then( () => {
            if (markupUrl) {
                return this.setWebPlayerUrl(markupUrl);
            }
            const markup = this._campaign.getDynamicMarkup();
            if (markup) {
                if(markupBaseUrl){
                    return this.setWebPlayerData(markup, 'text/html', 'UTF-8', markupBaseUrl);
                }
                return this.setWebPlayerData(markup, 'text/html', 'UTF-8');
            }
            this._nativeBridge.Sdk.logError("Display Interstitial: Neither markupUrl or Markup was defined in campaign");
            Diagnostics.trigger('display_interstitial_campaign_error', {markupUrl: markupUrl, markup: markup});
            this.setFinishState(FinishState.ERROR);
            this.hide();
            return Promise.reject(new Error("Display Interstitial: Neither markupUrl or Markup was defined in campaign"));
        });
    }
}
