import { AdMobAdUnit } from 'AdMob/AdUnits/AdMobAdUnit';
import { AdMobCampaign } from 'AdMob/Models/AdMobCampaign';
import { AdMobOptionalSignal } from 'AdMob/Models/AdMobOptionalSignal';
import { AdMobSignal } from 'AdMob/Models/AdMobSignal';
import { AdMobSignalFactory } from 'AdMob/Utilities/AdMobSignalFactory';
import { IAdMobEventHandler } from 'AdMob/Views/AdMobView';
import { IOpenableIntentsRequest, ITouchInfo } from 'AdMob/Views/AFMABridge';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { GDPREventHandler } from 'Ads/EventHandlers/GDPREventHandler';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { ThirdPartyEventManager, TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { Session } from 'Ads/Models/Session';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { FinishState } from 'Core/Constants/FinishState';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { RequestManager } from 'Core/Managers/RequestManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { Promises } from 'Core/Utilities/Promises';
import { Timer } from 'Core/Utilities/Timer';
import { Url } from 'Core/Utilities/Url';
import { Diagnostics } from 'Core/Utilities/Diagnostics';

export interface IAdMobEventHandlerParameters {
    adUnit: AdMobAdUnit;
    request: RequestManager;
    platform: Platform;
    core: ICoreApi;
    session: Session;
    thirdPartyEventManager: ThirdPartyEventManager;
    adMobSignalFactory: AdMobSignalFactory;
    clientInfo: ClientInfo;
    campaign: AdMobCampaign;
    coreConfig: CoreConfiguration;
    adsConfig: AdsConfiguration;
    privacyManager: UserPrivacyManager;
}

export class AdMobEventHandler extends GDPREventHandler implements IAdMobEventHandler {
    // Abstracted for testing
    public static setLoadTimeout(timeout: number) {
        AdMobEventHandler._loadTimeout = timeout;
    }
    private static _loadTimeout: number = 5000;
    private _adUnit: AdMobAdUnit;
    private _platform: Platform;
    private _core: ICoreApi;
    private _timeoutTimer: Timer;
    private _request: RequestManager;
    private _session: Session;
    private _thirdPartyEventManager: ThirdPartyEventManager;
    private _adMobSignalFactory: AdMobSignalFactory;
    private _campaign: AdMobCampaign;
    private _clientInfo: ClientInfo;

    constructor(parameters: IAdMobEventHandlerParameters) {
        super(parameters.privacyManager, parameters.coreConfig, parameters.adsConfig);
        this._adUnit = parameters.adUnit;
        this._platform = parameters.platform;
        this._core = parameters.core;
        this._request = parameters.request;
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
        this._session = parameters.session;
        this._adMobSignalFactory = parameters.adMobSignalFactory;
        this._campaign = parameters.campaign;
        this._clientInfo = parameters.clientInfo;
        this._timeoutTimer = new Timer(() => this.onFailureToLoad(), AdMobEventHandler._loadTimeout);
    }

    public onClose(): void {
        this._adUnit.hide();
    }

    public onOpenURL(url: string): void {
        const isAboutPage = url.indexOf('mobile-about') !== -1;

        if (!isAboutPage) {
            this._adUnit.sendClickEvent();
        }
        if (this._platform === Platform.IOS) {
            this._core.iOS!.UrlScheme.open(url);
        } else {
            this._core.Android!.Intent.launch({
                action: 'android.intent.action.VIEW',
                uri: url
            });
        }
    }

    public onAttribution(url: string, touchInfo: ITouchInfo): Promise<void> {
        const userAgent = this.getUserAgentHeader();
        const headers: [string, string][] = [
            ['User-Agent', userAgent]
        ];
        const isMsPresent = Url.getQueryParameter(url, 'ms');
        let urlPromise;
        if (isMsPresent) {
            urlPromise = Promise.resolve(url);
        } else {
            urlPromise = this.createClickUrl(url, touchInfo);
        }
        return urlPromise.then((attributionUrl) => {
            // Separate event from Click for generated for Admob Attribution
            return Promises.voidResult(this._thirdPartyEventManager.sendWithGet('admob click attribution', this._session.getId(), attributionUrl, true, headers));
        });
   }

    public onGrantReward(): void {
        this._adUnit.sendRewardEvent();
        this._adUnit.setFinishState(FinishState.COMPLETED);
    }

    public onVideoStart(): void {
        // this._timeoutTimer.stop();
        this._adUnit.sendStartEvent();
    }

    public onShow(): void {
        // this._timeoutTimer.start();
    }

    public onSetOrientationProperties(allowOrientation: boolean, forceOrientation: Orientation) {
        if (this._platform === Platform.IOS) {
            this._adUnit.getContainer().reorient(true, forceOrientation);
        } else {
            this._adUnit.getContainer().reorient(allowOrientation, forceOrientation);
        }
    }

    public onOpenableIntentsRequest(request: IOpenableIntentsRequest): void {
        this._core.Android!.Intent.canOpenIntents(request.intents).then((results) => {
            this._adUnit.sendOpenableIntentsResponse({
                id: request.id,
                results: results
            });
        });
    }

    public onTrackingEvent(event: string, data?: unknown) {
        // TODO: Man test that this works
        if (event in TrackingEvent) {
            this._adUnit.sendTrackingEvent(<TrackingEvent>event);
            if (event === TrackingEvent.ERROR) {
                SessionDiagnostics.trigger('admob_ad_error', data, this._campaign.getSession());
            } else if (event === TrackingEvent.STALLED) {
                Diagnostics.trigger('admob_ad_video_stalled', {
                    data: data
                });
            }
        }
    }

    public onClickSignalRequest(touchInfo: ITouchInfo) {
        return this.getClickSignal(touchInfo).then((signal) => {
            const response = {
                encodedClickSignal: signal.getBase64ProtoBufNonEncoded(),
                rvdt: this._adUnit.getRequestToViewTime()
            };
            this._adUnit.sendClickSignalResponse(response);
        });
    }

    private getClickSignal(touchInfo: ITouchInfo): Promise<AdMobSignal> {
        return this._adMobSignalFactory.getClickSignal(touchInfo, this._adUnit).then((signal) => {
            return signal;
        });
    }

    private getOptionalSignal(): Promise<AdMobOptionalSignal> {
        return this._adMobSignalFactory.getOptionalSignal().then((signal) => {
            return signal;
        });
    }

    private getUserAgentHeader(): string {
        const userAgent = navigator.userAgent || 'Unknown ';
        return `${userAgent} (Unity ${this._clientInfo.getSdkVersion()})`;
    }

    private onFailureToLoad(): void {
        this._adUnit.setFinishState(FinishState.ERROR);
        this._adUnit.hide();
    }

    private createClickUrl(url: string, touchInfo: ITouchInfo): Promise<string> {
        return this.getClickSignal(touchInfo).then((signal) => {
            return Url.addParameters(url, {
                ms: signal.getBase64ProtoBufNonEncoded(),
                rvdt: this._adUnit.getRequestToViewTime()
            });
        });
    }
}
