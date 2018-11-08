import { IBannerAdUnit } from 'Banners/AdUnits/IBannerAdUnit';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { BannerCampaign } from 'Banners/Models/BannerCampaign';
import { Placement } from 'Ads/Models/Placement';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { Template } from 'Core/Utilities/Template';
import { BannerViewType } from 'Banners/Native/Banner';
import { Platform } from 'Core/Constants/Platform';
import { Promises } from 'Core/Utilities/Promises';
import { IWebPlayerWebSettingsAndroid, IWebPlayerWebSettingsIos, IWebPlayerEventSettings } from 'Ads/Native/WebPlayer';

export interface IBannerAdUnitParameters {
    placement: Placement;
    campaign: BannerCampaign;
    clientInfo: ClientInfo;
    thirdPartyEventManager: ThirdPartyEventManager;
    webPlayerContainer: WebPlayerContainer;
}

export abstract class HTMLBannerAdUnit implements IBannerAdUnit {
    protected abstract _template: Template;
    protected _nativeBridge: NativeBridge;
    protected _campaign: BannerCampaign;
    private _placement: Placement;
    private _clientInfo: ClientInfo;
    private _thirdPartyEventManager: ThirdPartyEventManager;
    protected _webPlayerContainer: WebPlayerContainer;

    private _clickEventsSent = false;
    private _impressionEventsSent = false;

    constructor(nativeBridge: NativeBridge, parameters: IBannerAdUnitParameters) {
        this._nativeBridge = nativeBridge;
        this._placement = parameters.placement;
        this._campaign = parameters.campaign;
        this._clientInfo = parameters.clientInfo;
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
        this._webPlayerContainer = parameters.webPlayerContainer;
    }

    public getViews() {
        return [BannerViewType.BannerPlayer];
    }

    public onLoad(): Promise<void> {

        return this.setUpBannerPlayer()
            .then(() => {
                return this.getMarkup().then((markup) => {
                    const container = this._template.render({
                        markup
                    });
                    return new Promise<void>((resolve) => {
                        const observer = this._webPlayerContainer.onPageFinished.subscribe(() => {
                            this._webPlayerContainer.onPageFinished.unsubscribe(observer);
                            this.onDomContentLoaded().then(resolve);
                        });
                        this._webPlayerContainer.setData(container, 'text/html', 'UTF-8');
                    });
                });
            });
    }

    public onDestroy(): Promise<void> {
        return Promise.resolve();
    }

    public onShow(): Promise<void> {
        if (!this._impressionEventsSent) {
            this._impressionEventsSent = true;
            this.sendImpressionEvent();
        }
        return Promise.resolve();
    }

    public onHide(): Promise<void> {
        return Promise.resolve();
    }

    protected abstract getMarkup(): Promise<string>;
    protected abstract onDomContentLoaded(): Promise<void>;
    protected setEventSettings(eventSettings: IWebPlayerEventSettings): Promise<void> {
        return this._webPlayerContainer.setEventSettings(eventSettings);
    }

    protected onOpenURL(url: string) {
        if (url && url.indexOf('about:blank') === -1) {
            if (!this._clickEventsSent) {
                this._clickEventsSent = true;
                this.sendTrackingEvent('click');
            }
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

    protected sendTrackingEvent(eventName: string): void {
        const sdkVersion = this._clientInfo.getSdkVersion();
        const placementId = this._placement.getId();
        const sessionId = this._campaign.getSession().getId();

        const urls = this._campaign.getTrackingUrlsForEvent(eventName);
        for (let url of urls) {
            url = url.replace(/%ZONE%/, placementId);
            url = url.replace(/%SDK_VERSION%/, sdkVersion.toString());
            this._thirdPartyEventManager.sendWithGet(`banner ${eventName}`, sessionId, url, this._campaign.getUseWebViewUserAgentForTracking());
        }
    }

    private setUpBannerPlayer(): Promise<void> {
        return Promises.voidResult(Promise.all([
            this.setUpBannerPlayerSettings(),
            this.setUpBannerPlayerEvents()
        ]));
    }

    private setUpBannerPlayerEvents(): Promise<void> {
        let eventSettings: any;
        if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
            eventSettings = {
                onPageFinished: {
                    sendEvent: true
                }
            };
        } else {
            eventSettings = {
                onPageFinished: {
                    sendEvent: true
                }
            };
        }
        return this.setEventSettings(eventSettings);
    }

    private setUpBannerPlayerSettings(): Promise<void> {
        const platform = this._nativeBridge.getPlatform();
        let webPlayerSettings: IWebPlayerWebSettingsAndroid | IWebPlayerWebSettingsIos;
        if (platform === Platform.ANDROID) {
            webPlayerSettings = {
                setJavaScriptCanOpenWindowsAutomatically: [true],
                setSupportMultipleWindows: [false]
            };
        } else {
            webPlayerSettings = {
                javaScriptCanOpenWindowsAutomatically: true,
                scalesPagesToFit: true
            };
        }
        return this._webPlayerContainer.setSettings(webPlayerSettings, {});
    }

    private sendImpressionEvent() {
        this.sendTrackingEvent('impression');
        this._impressionEventsSent = true;
    }
}
