import { IAdMobEventHandler } from 'Ads/Views/AdMobView';
import { AdMobAdUnit } from 'Ads/AdUnits/AdMobAdUnit';
import { NativeBridge } from 'Common/Native/NativeBridge';
import { Platform } from 'Common/Constants/Platform';
import { FinishState } from 'Common/Constants/FinishState';
import { Timer } from 'Core/Utilities/Timer';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { Request } from 'Core/Utilities/Request';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Session } from 'Ads/Models/Session';
import { AdMobSignalFactory } from 'Ads/AdMob/AdMobSignalFactory';
import { Url } from 'Core/Utilities/Url';
import { IOpenableIntentsRequest, ITouchInfo } from 'Ads/Views/AFMABridge';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { AdMobCampaign } from 'Ads/Models/Campaigns/AdMobCampaign';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { AdMobSignal } from 'Ads/Models/AdMobSignal';
import { AdMobOptionalSignal } from 'Ads/Models/AdMobOptionalSignal';
import { Configuration } from 'Core/Models/Configuration';
import { GdprManager } from 'Ads/Managers/GdprManager';
import { GDPREventHandler } from 'Ads/EventHandlers/GDPREventHandler';
import { Promises } from 'Core/Utilities/Promises';

export interface IAdMobEventHandlerParameters {
    adUnit: AdMobAdUnit;
    request: Request;
    nativeBridge: NativeBridge;
    session: Session;
    thirdPartyEventManager: ThirdPartyEventManager;
    adMobSignalFactory: AdMobSignalFactory;
    clientInfo: ClientInfo;
    campaign: AdMobCampaign;
    configuration: Configuration;
    gdprManager: GdprManager;
}

export class AdMobEventHandler extends GDPREventHandler implements IAdMobEventHandler {
    // Abstracted for testing
    public static setLoadTimeout(timeout: number) {
        AdMobEventHandler._loadTimeout = timeout;
    }
    private static _loadTimeout: number = 5000;
    private _adUnit: AdMobAdUnit;
    private _nativeBridge: NativeBridge;
    private _timeoutTimer: Timer;
    private _request: Request;
    private _session: Session;
    private _thirdPartyEventManager: ThirdPartyEventManager;
    private _adMobSignalFactory: AdMobSignalFactory;
    private _campaign: AdMobCampaign;
    private _clientInfo: ClientInfo;

    constructor(parameters: IAdMobEventHandlerParameters) {
        super(parameters.gdprManager, parameters.configuration);
        this._adUnit = parameters.adUnit;
        this._nativeBridge = parameters.nativeBridge;
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
        if (this._nativeBridge.getPlatform() === Platform.IOS) {
            this._nativeBridge.UrlScheme.open(url);
        } else {
            this._nativeBridge.Intent.launch({
                action: 'android.intent.action.VIEW',
                uri: url
            });
        }
    }

    public onAttribution(url: string, touchInfo: ITouchInfo): Promise<void> {
        const userAgent = this.getUserAgentHeader();
        const headers: Array<[string, string]> = [
            ['User-Agent', userAgent]
        ];
        const isMsPresent = Url.getQueryParameter(url, 'ms');
        let urlPromise;
        if (isMsPresent) {
            urlPromise = Promise.resolve(url);
        } else {
            urlPromise = this.createClickUrl(url, touchInfo);
        }
        return urlPromise.then((clickUrl) => {
            // voidResult transforms promise to Promise<void>
            return Promises.voidResult(this._thirdPartyEventManager.sendEvent('admob click', this._session.getId(), clickUrl, true, headers));
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
        if (this._nativeBridge.getPlatform() === Platform.IOS) {
            this._adUnit.getContainer().reorient(true, forceOrientation);
        } else {
            this._adUnit.getContainer().reorient(allowOrientation, forceOrientation);
        }
    }

    public onOpenableIntentsRequest(request: IOpenableIntentsRequest): void {
        this._nativeBridge.Intent.canOpenIntents(request.intents).then((results) => {
            this._adUnit.sendOpenableIntentsResponse({
                id: request.id,
                results: results
            });
        });
    }

    public onTrackingEvent(event: string, data?: any) {
        this._adUnit.sendTrackingEvent(event);
        if (event === 'error') {
            Diagnostics.trigger('admob_ad_error', data, this._campaign.getSession());
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
