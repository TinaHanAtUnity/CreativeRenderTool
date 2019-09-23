import { IBannerAdUnit } from 'Banners/AdUnits/IBannerAdUnit';
import { BannerCampaign } from 'Banners/Models/BannerCampaign';
import { ThirdPartyEventManager, TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { Template } from 'Core/Utilities/Template';
import { BannerViewType } from 'Banners/Native/BannerApi';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { Promises } from 'Core/Utilities/Promises';
import { IWebPlayerWebSettingsAndroid, IWebPlayerWebSettingsIos, IWebPlayerEventSettings } from 'Ads/Native/WebPlayer';
import { ProgrammaticTrackingService, BannerMetric } from 'Ads/Utilities/ProgrammaticTrackingService';
import { IBannerNativeApi } from 'Banners/IBannerModule';
import { GameSessionCounters } from 'Ads/Utilities/GameSessionCounters';

export interface IBannerAdUnitParameters {
    platform: Platform;
    core: ICoreApi;
    campaign: BannerCampaign;
    thirdPartyEventManager: ThirdPartyEventManager;
    webPlayerContainer: WebPlayerContainer;
    programmaticTrackingService: ProgrammaticTrackingService;
    bannerNativeApi: IBannerNativeApi;
    placementId: string;
    bannerAdViewId: string;
}

export abstract class HTMLBannerAdUnit implements IBannerAdUnit {
    protected abstract _template: Template;
    protected _campaign: BannerCampaign;
    protected _platform: Platform;
    protected _core: ICoreApi;
    private _thirdPartyEventManager: ThirdPartyEventManager;
    private _programmaticTrackingService: ProgrammaticTrackingService;
    protected _webPlayerContainer: WebPlayerContainer;
    private _bannerNativeApi: IBannerNativeApi;
    private _placementId: string;
    private _bannerAdViewId: string;

    private _clickEventsSent = false;
    private _impressionEventsSent = false;
    private _leaveApplicationEventTriggered = false;

    constructor(parameters: IBannerAdUnitParameters) {
        this._platform = parameters.platform;
        this._core = parameters.core;
        this._campaign = parameters.campaign;
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
        this._webPlayerContainer = parameters.webPlayerContainer;
        this._programmaticTrackingService = parameters.programmaticTrackingService;
        this._bannerNativeApi = parameters.bannerNativeApi;
        this._placementId = parameters.placementId;
        this._bannerAdViewId = parameters.bannerAdViewId;
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
        GameSessionCounters.addStart(this._campaign);
        GameSessionCounters.addView(this._campaign);
        if (!this._impressionEventsSent) {
            this._programmaticTrackingService.reportMetric(BannerMetric.BannerAdImpression);
            this.sendTrackingEvent(TrackingEvent.IMPRESSION);
            this._impressionEventsSent = true;
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
                this.sendTrackingEvent(TrackingEvent.CLICK);
                this._bannerNativeApi.BannerListenerApi.sendClickEvent(this._bannerAdViewId);
            }
            if (this._platform === Platform.IOS) {
                this._core.iOS!.UrlScheme.open(url).then(() => {
                    if (!this._leaveApplicationEventTriggered) {
                        this._leaveApplicationEventTriggered = true;
                        this._bannerNativeApi.BannerListenerApi.sendLeaveApplicationEvent(this._bannerAdViewId);
                    }
                });
            } else if (this._platform === Platform.ANDROID) {
                this._core.Android!.Intent.launch({
                    'action': 'android.intent.action.VIEW',
                    'uri': url
                }).then(() => {
                    if (!this._leaveApplicationEventTriggered) {
                        this._leaveApplicationEventTriggered = true;
                        this._bannerNativeApi.BannerListenerApi.sendLeaveApplicationEvent(this._bannerAdViewId);
                    }
                });
            }
        }
    }

    protected sendTrackingEvent(event: TrackingEvent) {
        this._thirdPartyEventManager.sendTrackingEvents(this._campaign, event, 'banner', this._campaign.getUseWebViewUserAgentForTracking());
    }

    private setUpBannerPlayer(): Promise<void> {
        return Promises.voidResult(Promise.all([
            this.setUpBannerPlayerSettings(),
            this.setUpBannerPlayerEvents()
        ]));
    }

    private setUpBannerPlayerEvents(): Promise<void> {
        let eventSettings: IWebPlayerEventSettings;
        if (this._platform === Platform.ANDROID) {
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
        const platform = this._platform;
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
}
