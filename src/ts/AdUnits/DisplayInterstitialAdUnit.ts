import { NativeBridge } from 'Native/NativeBridge';
import { AbstractAdUnit, IAdUnitParameters } from 'AdUnits/AbstractAdUnit';
import { FinishState } from 'Constants/FinishState';
import { IObserver2, IObserver1 } from 'Utilities/IObserver';
import { DisplayInterstitialCampaign } from 'Models/Campaigns/DisplayInterstitialCampaign';
import { DisplayInterstitial } from 'Views/DisplayInterstitial';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { Platform } from 'Constants/Platform';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { Placement } from 'Models/Placement';
import { DeviceInfo } from 'Models/DeviceInfo';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { Diagnostics } from 'Utilities/Diagnostics';
import { IWebPlayerWebSettingsAndroid, IWebPlayerWebSettingsIos } from 'Native/Api/WebPlayer';
import { Url } from 'Utilities/Url';
import { AndroidDeviceInfo } from 'Models/AndroidDeviceInfo';
import { AdUnitContainerSystemMessage, IAdUnitContainerListener } from 'AdUnits/Containers/AdUnitContainer';

export interface IDisplayInterstitialAdUnitParameters extends IAdUnitParameters<DisplayInterstitialCampaign> {
    view: DisplayInterstitial;
}

export class DisplayInterstitialAdUnit extends AbstractAdUnit implements IAdUnitContainerListener {

    private _operativeEventManager: OperativeEventManager;
    private _thirdPartyEventManager: ThirdPartyEventManager;
    private _view: DisplayInterstitial;
    private _options: any;
    private _campaign: DisplayInterstitialCampaign;
    private _placement: Placement;
    private _deviceInfo: DeviceInfo;
    private _receivedOnPageStart: boolean = false;
    private _clickEventHasBeenSent: boolean = false;
    private _handlingShouldOverrideUrlLoading: boolean = false;
    private _contentReady: boolean = false;

    private _shouldOverrideUrlLoadingObserver: IObserver2<string, string>;
    private _onPageStartedObserver: IObserver1<string>;

    private readonly _closeAreaMinRatio = 0.05;
    private readonly _closeAreaMinPixels = 50;

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
        this._onPageStartedObserver = this._nativeBridge.WebPlayer.onPageStarted.subscribe( (url) => this.onPageStarted(url));
        this._shouldOverrideUrlLoadingObserver = this._nativeBridge.WebPlayer.shouldOverrideUrlLoading.subscribe((url: string, method: string) => this.shouldOverrideUrlLoading(url, method));

        return this.setWebPlayerViews().then( () => {
            this._view.show();
            this.onStart.trigger();
            this._nativeBridge.Listener.sendStartEvent(this._placement.getId());
            this.sendStartEvents();
            this._container.addEventHandler(this);

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
        this._container.removeEventHandler(this);

        this._nativeBridge.WebPlayer.onPageStarted.unsubscribe(this._onPageStartedObserver);
        this._nativeBridge.WebPlayer.shouldOverrideUrlLoading.unsubscribe(this._shouldOverrideUrlLoadingObserver);

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

    public description(): string {
        return 'programmaticImage';
    }

    public onContainerShow(): void {
        if (this._contentReady) {
            return;
        }
        if(AbstractAdUnit.getAutoClose()) {
            setTimeout(() => {
                this.setFinishState(FinishState.COMPLETED);
                this.hide();
            }, AbstractAdUnit.getAutoCloseDelay());
        }
        const promises = [
            this._deviceInfo.getScreenWidth(),
            this._deviceInfo.getScreenHeight()
        ];
        Promise.all(promises).then(([screenWidth, screenHeight]) => {
            return this.setWebPlayerViewFrame(screenWidth, screenHeight)
                .then(() => this.setWebViewViewFrame(screenWidth, screenHeight))
                .then(() => this.setWebPlayerContent());
        });
    }

    public onContainerDestroy(): void {
        if(this.isShowing()) {
            this.onClose.trigger();
        }
    }

    public onContainerBackground(): void {
        // EMPTY
    }

    public onContainerForeground(): void {
        // EMPTY
    }

    public onContainerSystemMessage(message: AdUnitContainerSystemMessage): void {
        // EMPTY
    }

    private getScreenDensity(): number {
        if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
            return (<AndroidDeviceInfo>this._deviceInfo).getScreenDensity();
        }
        return 0;
    }

    private hasCreativeSize(): boolean {
        return this._campaign.getWidth() !== undefined && this._campaign.getHeight() !== undefined;
    }

    private setWebPlayerViewFrame(screenWidth: number, screenHeight: number): Promise<void> {
        let creativeWidth = screenWidth;
        let creativeHeight = screenHeight;

        if(this._nativeBridge.getPlatform() === Platform.ANDROID && this.hasCreativeSize()) {
            const screenDensity = this.getScreenDensity();
            creativeWidth = Math.floor(this.getAndroidViewSize(this._campaign.getWidth() || screenWidth, screenDensity));
            creativeHeight = Math.floor(this.getAndroidViewSize(this._campaign.getHeight() || screenHeight, screenDensity));
        }

        const xPos = Math.floor((screenWidth / 2) - (creativeWidth / 2));
        const yPos = Math.floor((screenHeight / 2) - (creativeHeight / 2));
        return this._container.setViewFrame('webplayer', xPos, yPos, creativeWidth, creativeHeight);
    }

    private setWebViewViewFrame(screenWidth: number, screenHeight: number): Promise<void> {
        let webviewAreaSize = Math.max( Math.min(screenWidth, screenHeight) * this._closeAreaMinRatio, this._closeAreaMinPixels );
        if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
            const screenDensity = this.getScreenDensity();
            webviewAreaSize = this.getAndroidViewSize(webviewAreaSize, screenDensity);
        }
        const webviewXPos = screenWidth - webviewAreaSize;
        const webviewYPos = 0;
        return this._container.setViewFrame('webview', Math.floor(webviewXPos), Math.floor(webviewYPos), Math.floor(webviewAreaSize), Math.floor(webviewAreaSize));
    }

    private onPageStarted(url: string): void {
        this._nativeBridge.Sdk.logDebug('DisplayInterstitialAdUnit: onPageStarted triggered for url: ' + url);
        if(!this._receivedOnPageStart) {
            this._receivedOnPageStart = true;
            return;
        }
        if(this._clickEventHasBeenSent) {
            return;
        }
        this._operativeEventManager.sendClick(this._placement);
        this._clickEventHasBeenSent = true;

        for (const trackingUrl of this._campaign.getTrackingUrlsForEvent('click')) {
            this._thirdPartyEventManager.sendEvent('display click', this._campaign.getSession().getId(), trackingUrl);
        }
    }

    private shouldOverrideUrlLoading(url: string, method: string): void {
        if (this._handlingShouldOverrideUrlLoading) {
            return;
        }
        this._handlingShouldOverrideUrlLoading = true;
        if (this._nativeBridge.getPlatform() === Platform.IOS && url === 'about:blank') {
            this.setWebplayerSettings(false).then( () => {
                this._handlingShouldOverrideUrlLoading = false;
            });
            return;
        }
        this._nativeBridge.Sdk.logDebug('DisplayInterstitialAdUnit: shouldOverrideUrlLoading triggered for url: "' + url);
        if (!url || !Url.isProtocolWhitelisted(url, this._nativeBridge.getPlatform())) {
            this._handlingShouldOverrideUrlLoading = false;
            return;
        }
        this.openUrlInBrowser(url);
    }

    private openUrlInBrowser(url: string): Promise<void> {
        let openPromise: Promise<void>;
        if (this._nativeBridge.getPlatform() === Platform.IOS) {
            openPromise = this._nativeBridge.UrlScheme.open(url);
        } else {
            openPromise = this._nativeBridge.Intent.launch({
                'action': 'android.intent.action.VIEW',
                'uri': url
            });
        }

        return Promise.resolve(openPromise).then( () => {
            this._handlingShouldOverrideUrlLoading = false;
        }).catch( (e) => {
            this._nativeBridge.Sdk.logWarning('DisplayInterstitialAdUnit: Cannot open url: "' + url + '": ' + e);
            this._handlingShouldOverrideUrlLoading = false;
        });
    }

    private unsetReferences(): void {
        delete this._view;
    }

    private sendStartEvents(): void {
        for (const url of (this._campaign).getTrackingUrlsForEvent('impression')) {
            this._thirdPartyEventManager.sendEvent('display impression', this._campaign.getSession().getId(), url);
        }
        this._operativeEventManager.sendStart(this._placement).then(() => {
            this.onStartProcessed.trigger();
        });
    }

    private setWebPlayerViews(): Promise<void> {
        const platform = this._nativeBridge.getPlatform();
        let webPlayerSettings: IWebPlayerWebSettingsAndroid | IWebPlayerWebSettingsIos;
        if (platform === Platform.ANDROID) {
            webPlayerSettings = {
                'setJavaScriptCanOpenWindowsAutomatically': [true],
                'setSupportMultipleWindows': [false]
            };
        } else {
            webPlayerSettings = {
                'javaScriptCanOpenWindowsAutomatically': true
            };
        }
        return this._nativeBridge.WebPlayer.setSettings(webPlayerSettings, {}).then( () => {
            return this._container.open(this, ['webplayer', 'webview'], false, this._forceOrientation, true, false, true, false, this._options).catch((e) => {
                this.hide();
            });
        });
    }

    private setWebPlayerData(data: string, mimeType: string, encoding: string): Promise<void> {
        return this._nativeBridge.WebPlayer.setData(data, mimeType, encoding).catch( (error) => {
            this._nativeBridge.Sdk.logError(JSON.stringify(error));
            Diagnostics.trigger('webplayer_set_data_error', new DiagnosticError(error, {data: data, mimeType: mimeType, encoding: encoding}));
            this.setFinishState(FinishState.ERROR);
            this.hide();
        });
    }

    private getAndroidViewSize(size: number, density: number): number {
        return size * (density / 160);
    }

    private setWebplayerSettings(shouldOverrideUrlLoadingReturnValue: boolean): Promise<void> {
        const eventSettings = {
            'onPageStarted': {'sendEvent': true},
            'shouldOverrideUrlLoading': {'sendEvent': true, 'returnValue': shouldOverrideUrlLoadingReturnValue, 'callSuper': false}
        };
        return this._nativeBridge.WebPlayer.setEventSettings(eventSettings);
    }

    private setWebPlayerContent(): Promise<void> {
        return this.setWebplayerSettings(true).then( () => {
            const markup = this._campaign.getDynamicMarkup();
            return this.setWebPlayerData(markup, 'text/html', 'UTF-8').then(() => {
                this._contentReady = true;
            });
        });
    }
}
