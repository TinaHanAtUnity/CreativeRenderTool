import { AbstractAdUnit, IAdUnitParameters } from 'AdUnits/AbstractAdUnit';
import { NativeBridge } from 'Native/NativeBridge';
import { BannerCampaign } from 'AdTypes/Banner/Models/Campaigns/BannerCampaign';
import { DeviceInfo } from 'Models/DeviceInfo';
import { AndroidDeviceInfo } from 'Models/AndroidDeviceInfo';
import { IosDeviceInfo } from 'Models/IosDeviceInfo';
import { Placement } from 'Models/Placement';
import { ClientInfo } from 'Models/ClientInfo';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { IObserver2, IObserver0, IObserver1 } from 'Utilities/IObserver';
import { IWebPlayerWebSettingsAndroid, IWebPlayerWebSettingsIos, IWebPlayerEventSettings } from 'Native/Api/WebPlayer';
import { Platform } from 'Constants/Platform';
import { Promises } from 'Utilities/Promises';
import { BannerViewType } from 'Native/Api/Banner';
import BannerContainer from 'html/banner/BannerContainer.html';
import { Template } from 'Utilities/Template';
import { WebPlayerContainer } from 'Utilities/WebPlayer/WebPlayerContainer';

export interface IBannerAdUnitParameters extends IAdUnitParameters<BannerCampaign> {
}

export const StandardBannerWidth = 320;
export const StandardBannerHeight = 50;

export class BannerAdUnit extends AbstractAdUnit {
    private _deviceInfo: DeviceInfo;
    private _campaign: BannerCampaign;
    private _placement: Placement;
    private _clientInfo: ClientInfo;
    private _thirdPartyEventManager: ThirdPartyEventManager;
    private _webPlayerContainer: WebPlayerContainer;
    private _template: Template;

    private _impressionEventsSent = false;
    private _onBannerShowObserver: IObserver0;
    private _urlLoadingObserver: IObserver2<string, string>;
    private _onCreateWebViewObserver: IObserver1<string>;

    constructor(nativeBridge: NativeBridge, parameters: IBannerAdUnitParameters) {
        super(nativeBridge, parameters);
        this._placement = parameters.placement;
        this._campaign = parameters.campaign;
        this._deviceInfo = parameters.deviceInfo;
        this._clientInfo = parameters.clientInfo;
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
        this._webPlayerContainer = parameters.webPlayerContainer!;
        this._template = new Template(BannerContainer);
    }

    public show(): Promise<void> {
        const markup = decodeURIComponent(this._campaign.getMarkup()!);
        const container = this._template.render({
            markup
        });
        return this.setUpBannerPlayer()
            .then(() => this.isOpened())
            .then((isOpened) => {
                if (isOpened) {
                    return Promise.resolve();
                } else {
                    return this.getBannerSize()
                        .then(([width, height]) => this.loadBanner(width, height));
                }
            })
            .then(() => {
                return new Promise((resolve) => {
                    const observer = this._webPlayerContainer.onPageFinished.subscribe(() => {
                        this._webPlayerContainer.onPageFinished.unsubscribe(observer);
                        this.setUpBannerPlayerEvents(true).then(() => resolve());
                    });
                    this._webPlayerContainer.setData(container!, 'text/html', 'UTF-8');
                });
            })
            .then(() => this.onBannerLoaded());
    }

    public hide(): Promise<void> {
        this._webPlayerContainer.shouldOverrideUrlLoading.unsubscribe(this._urlLoadingObserver);
        this._webPlayerContainer.onCreateWebView.unsubscribe(this._onCreateWebViewObserver);
        this._nativeBridge.Banner.onBannerOpened.unsubscribe(this._onBannerShowObserver);
        return Promise.resolve();
    }

    public description(): string {
        return 'banner';
    }

    private setUpBannerPlayer(): Promise<void> {
        if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
            this._urlLoadingObserver = this._webPlayerContainer.shouldOverrideUrlLoading.subscribe((url) => {
                this.onOpenURL(url);
            });
        } else {
            this._onCreateWebViewObserver = this._webPlayerContainer.onCreateWebView.subscribe((url) => {
                this.onOpenURL(url);
            });
        }
        this._onBannerShowObserver = this._nativeBridge.Banner.onBannerOpened.subscribe(() => {
            this.onShow();
        });
        return Promises.voidResult(Promise.all([
            this.setUpBannerPlayerSettings(),
            this.setUpBannerPlayerEvents(false)
        ]));
    }

    private setUpBannerPlayerEvents(sendOverrideURLEvent: boolean): Promise<void> {
        let eventSettings: any;
        if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
            eventSettings = {
                'onPageFinished': { 'sendEvent': true },
                'shouldOverrideUrlLoading': { 'sendEvent': sendOverrideURLEvent, 'returnValue': true }
            };
        } else {
            eventSettings = {
                'onPageFinished': { 'sendEvent': true },
                'onCreateWindow': { 'sendEvent': sendOverrideURLEvent }
            };
        }
        return this._webPlayerContainer.setEventSettings(eventSettings);
    }

    private setUpBannerPlayerSettings(): Promise<void> {
        const platform = this._nativeBridge.getPlatform();
        let webPlayerSettings: IWebPlayerWebSettingsAndroid | IWebPlayerWebSettingsIos;
        if (platform === Platform.ANDROID) {
            webPlayerSettings = {
                'setJavaScriptCanOpenWindowsAutomatically': [true],
                'setSupportMultipleWindows': [false]
            };
        } else {
            webPlayerSettings = {
                'javaScriptCanOpenWindowsAutomatically': true,
                'scalesPagesToFit': true
            };
        }
        return this._webPlayerContainer.setSettings(webPlayerSettings, {});
    }

    private onShow() {
        return this.getBannerSize().then(([width, height]) => {
            if (!this._impressionEventsSent) {
                this.sendImpressionEvent();
            }
            this._nativeBridge.Banner.setViewFrame(BannerViewType.BannerPlayer, 0, 0, Math.floor(width), Math.floor(height));
        });
    }

    private getBannerSize(): Promise<[number, number]> {
        let width = StandardBannerWidth;
        let height = StandardBannerHeight;
        if (this._deviceInfo instanceof AndroidDeviceInfo) {
            const density = this._deviceInfo.getScreenDensity();
            width = Math.floor(width * (density / 160.0));
            height = Math.floor(height * (density / 160.0));
        } else if (this._deviceInfo instanceof IosDeviceInfo) {
            width = Math.floor(StandardBannerWidth);
            height = Math.floor(StandardBannerHeight);
        }
        const dimensions: [number, number] = [width, height];
        return Promise.resolve(dimensions);
    }

    private onBannerLoaded() {
        this.setShowing(true);
        return this.isOpened().then((isOpened) => {
           if (isOpened) {
               this.sendImpressionEvent();
           }
        });
    }

    private sendImpressionEvent() {
        this.sendTrackingEvent('impression');
        this._impressionEventsSent = true;
    }

    private sendTrackingEvent(eventName: string): void {
        const sdkVersion = this._clientInfo.getSdkVersion();
        const placementId = this._placement.getId();
        const sessionId = this._campaign.getSession().getId();

        const urls = this._campaign.getTrackingUrlsForEvent(eventName);
        for (let url of urls) {
            url = url.replace(/%ZONE%/, placementId);
            url = url.replace(/%SDK_VERSION%/, sdkVersion.toString());
            this._thirdPartyEventManager.sendEvent(`banner ${eventName}`, sessionId, url, this._campaign.getUseWebViewUserAgentForTracking());
        }
    }

    private onOpenURL(url: string) {
        if (url && url.indexOf('about:blank') === -1) {
            this.sendTrackingEvent('click');
            if (this._nativeBridge.getPlatform() === Platform.IOS) {
                this._nativeBridge.UrlScheme.open(url);
            } else if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
                this._nativeBridge.Intent.launch({
                    'action': 'android.intent.action.VIEW',
                    'uri': url
                });
            }
        }
    }

    private isOpened(): Promise<boolean> {
        if (this._nativeBridge.getPlatform() === Platform.IOS) {
            return this._nativeBridge.Banner.isOpened();
        } else {
            return new Promise<boolean>((resolve, reject) => {
                const observer = this._nativeBridge.Banner.onBannerAttachedState.subscribe((attached) => {
                    this._nativeBridge.Banner.onBannerAttachedState.unsubscribe(observer);
                    resolve(attached);
                });
                this._nativeBridge.Banner.isOpened().catch(reject);
            });
        }
    }

    private loadBanner(width: number, height: number): Promise<void> {
        return new Promise((resolve, reject) => {
            const observer = this._nativeBridge.Banner.onBannerLoaded.subscribe(() => {
                this._nativeBridge.Banner.onBannerLoaded.unsubscribe(observer);
                resolve();
            });
            this._nativeBridge.Banner.load([BannerViewType.BannerPlayer], this._placement.getBannerStyle() || 'bottomcenter', width, height).catch(reject);
        });
    }
}
