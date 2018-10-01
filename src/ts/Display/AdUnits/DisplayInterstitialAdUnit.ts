import { AbstractAdUnit, IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { AdUnitContainerSystemMessage, IAdUnitContainerListener } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { IOperativeEventParams, OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Placement } from 'Ads/Models/Placement';
import { IWebPlayerWebSettingsAndroid, IWebPlayerWebSettingsIos } from 'Ads/Native/WebPlayer';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { FinishState } from 'Core/Constants/FinishState';
import { Platform } from 'Core/Constants/Platform';
import { DiagnosticError } from 'Core/Errors/DiagnosticError';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { IObserver1, IObserver2 } from 'Core/Utilities/IObserver';
import { Url } from 'Core/Utilities/Url';
import { DisplayInterstitialCampaign } from 'Display/Models/DisplayInterstitialCampaign';
import { DisplayInterstitial } from 'Display/Views/DisplayInterstitial';

export interface IDisplayInterstitialAdUnitParameters extends IAdUnitParameters<DisplayInterstitialCampaign> {
    view: DisplayInterstitial;
}

export class DisplayInterstitialAdUnit extends AbstractAdUnit implements IAdUnitContainerListener {

    private _operativeEventManager: OperativeEventManager;
    private _thirdPartyEventManager: ThirdPartyEventManager;
    private _view: DisplayInterstitial;
    private _options: unknown;
    private _campaign: DisplayInterstitialCampaign;
    private _placement: Placement;
    private _deviceInfo: DeviceInfo;
    private _clientInfo: ClientInfo;
    private _receivedOnPageStart: boolean = false;
    private _clickEventHasBeenSent: boolean = false;
    private _handlingShouldOverrideUrlLoading: boolean = false;
    private _contentReady: boolean = false;
    private _webPlayerContainer: WebPlayerContainer;

    private _shouldOverrideUrlLoadingObserver: IObserver2<string, string>;
    private _onPageStartedObserver: IObserver1<string>;

    private _privacyShowing = false;
    private _topWebViewAreaHeight: number;
    private readonly _topWebViewAreaMinHeight = 60;

    constructor(nativeBridge: NativeBridge, parameters: IDisplayInterstitialAdUnitParameters) {
        super(nativeBridge, parameters);
        this._operativeEventManager = parameters.operativeEventManager;
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
        this._view = parameters.view;
        this._campaign = parameters.campaign;
        this._placement = parameters.placement;
        this._deviceInfo = parameters.deviceInfo;
        this._clientInfo = parameters.clientInfo;
        this._webPlayerContainer = parameters.webPlayerContainer!;

        this._view.render();
        document.body.appendChild(this._view.container());

        this._options = parameters.options;
        this.setShowing(false);

        if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
            this._topWebViewAreaHeight = Math.floor(this.getAndroidViewSize(this._topWebViewAreaMinHeight, this.getScreenDensity()));
        } else {
            this._topWebViewAreaHeight = this._topWebViewAreaMinHeight;
        }
    }

    public show(): Promise<void> {
        this.setShowing(true);
        this._onPageStartedObserver = this._webPlayerContainer.onPageStarted.subscribe((url) => this.onPageStarted(url));
        this._shouldOverrideUrlLoadingObserver = this._webPlayerContainer.shouldOverrideUrlLoading.subscribe((url: string, method: string) => this.shouldOverrideUrlLoading(url, method));

        return this.setWebPlayerViews().then(() => {
            this._view.show();
            this.onStart.trigger();
            this._nativeBridge.Listener.sendStartEvent(this._placement.getId());
            this.sendStartEvents();
            this._container.addEventHandler(this);
            this.setupPrivacyObservers();
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

        this._webPlayerContainer.onPageStarted.unsubscribe(this._onPageStartedObserver);
        this._webPlayerContainer.shouldOverrideUrlLoading.unsubscribe(this._shouldOverrideUrlLoadingObserver);

        this._view.hide();
        this.onFinish.trigger();

        this._view.container().parentElement!.removeChild(this._view.container());
        this.unsetReferences();

        this._nativeBridge.Listener.sendFinishEvent(this._placement.getId(), this.getFinishState());
        return this._container.close().then(() => {
            return this._webPlayerContainer.clearSettings().then(() => {
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
                .then(() => this.setWebViewViewFrame(screenWidth, screenHeight, this._privacyShowing))
                .then(() => this.setWebPlayerContent());
        });
    }

    public onContainerDestroy(): void {
        if(this.isShowing()) {
            this.onClose.trigger();
        }
    }

    public onContainerBackground(): void {
        if(this.isShowing() && CustomFeatures.isSimejiJapaneseKeyboardApp(this._clientInfo.getGameId())) {
            this.hide();
        }
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

    private setWebViewViewFrame(screenWidth: number, screenHeight: number, shouldFullScreen: boolean): Promise<void> {
        if (shouldFullScreen) {
            return this._container.setViewFrame('webview', 0, 0, screenWidth, screenHeight);
        } else {
            return this._container.setViewFrame('webview', 0, 0, screenWidth, this._topWebViewAreaHeight);
        }
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

        this._operativeEventManager.sendClick(this.getOperativeEventParams());
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
            this.setWebplayerSettings(false).then(() => {
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

        return Promise.resolve(openPromise).then(() => {
            this._handlingShouldOverrideUrlLoading = false;
        }).catch((e) => {
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
        this._operativeEventManager.sendStart(this.getOperativeEventParams()).then(() => {
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
        return this._webPlayerContainer.setSettings(webPlayerSettings, {}).then(() => {
            return this._container.open(this, ['webplayer', 'webview'], false, this._forceOrientation, true, false, true, false, this._options).catch((e) => {
                this.hide();
            });
        });
    }

    private setWebPlayerData(data: string, mimeType: string, encoding: string): Promise<void> {
        return this._webPlayerContainer.setData(data, mimeType, encoding).catch((error) => {
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
        return this._webPlayerContainer.setEventSettings(eventSettings);
    }

    private setWebPlayerContent(): Promise<void> {
        return this.setWebplayerSettings(true).then(() => {
            const markup = this._campaign.getDynamicMarkup();
            return this.setWebPlayerData(markup, 'text/html', 'UTF-8').then(() => {
                this._contentReady = true;
            });
        });
    }

    private getOperativeEventParams(): IOperativeEventParams {
        return {
            placement: this._placement
        };
    }

    private setupPrivacyObservers(): void {
        if (this._view.onPrivacyClosed) {
            this._view.onPrivacyClosed.subscribe(() => {
                this._privacyShowing = false;
                Promise.all([this._deviceInfo.getScreenWidth(), this._deviceInfo.getScreenHeight()]).then(([width, height]) => {
                    this.setWebViewViewFrame(width, height, false);
                });
            });
        }

        if (this._view.onPrivacyOpened) {
            this._view.onPrivacyOpened.subscribe(() => {
                this._privacyShowing = true;
                Promise.all([this._deviceInfo.getScreenWidth(), this._deviceInfo.getScreenHeight()]).then(([width, height]) => {
                    this.setWebViewViewFrame(width, height, true);
                });
            });
        }
    }
}
