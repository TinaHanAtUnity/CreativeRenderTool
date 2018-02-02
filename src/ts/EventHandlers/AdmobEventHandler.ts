import { IAdMobEventHandler } from 'Views/AdMobView';
import { AdMobAdUnit } from 'AdUnits/AdMobAdUnit';
import { NativeBridge } from 'Native/NativeBridge';
import { Platform } from 'Constants/Platform';
import { FinishState } from 'Constants/FinishState';
import { Timer } from 'Utilities/Timer';
import { ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';
import { Request } from 'Utilities/Request';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { Session } from 'Models/Session';
import { AdMobSignalFactory } from 'AdMob/AdMobSignalFactory';
import { Url } from 'Utilities/Url';
import { SdkStats } from 'Utilities/SdkStats';
import { ITouchInfo, IOpenableIntentsRequest } from 'Views/AFMABridge';
import { Diagnostics } from 'Utilities/Diagnostics';
import { AdMobCampaign } from 'Models/Campaigns/AdMobCampaign';

export interface IAdMobEventHandlerParameters {
    adUnit: AdMobAdUnit;
    request: Request;
    nativeBridge: NativeBridge;
    session: Session;
    thirdPartyEventManager: ThirdPartyEventManager;
    adMobSignalFactory: AdMobSignalFactory;
    campaign: AdMobCampaign;
}

export class AdMobEventHandler implements IAdMobEventHandler {
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

    constructor(parameters: IAdMobEventHandlerParameters) {
        this._adUnit = parameters.adUnit;
        this._nativeBridge = parameters.nativeBridge;
        this._request = parameters.request;
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
        this._session = parameters.session;
        this._adMobSignalFactory = parameters.adMobSignalFactory;
        this._campaign = parameters.campaign;
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
        return this.createClickUrl(url, touchInfo).then((clickUrl) => {
            return new Promise<void>((resolve, reject) => {
                this._thirdPartyEventManager.sendEvent('admob click', this._session.getId(), clickUrl, true).then(() => resolve()).catch(reject);
            });
        });
   }

    public onGrantReward(): void {
        this._adUnit.sendRewardEvent();
        this._adUnit.setFinishState(FinishState.COMPLETED);
    }

    public onVideoStart(): void {
        // this._timeoutTimer.stop();
        this._adUnit.sendStartEvent();
        this._adUnit.sendImpressionEvent();
    }

    public onShow(): void {
        // this._timeoutTimer.start();
    }

    public onSetOrientationProperties(allowOrientation: boolean, forceOrientation: ForceOrientation) {
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

    private onFailureToLoad(): void {
        this._adUnit.setFinishState(FinishState.ERROR);
        this._adUnit.hide();
    }

    private createClickUrl(url: string, touchInfo: ITouchInfo): Promise<string> {
        return this._adMobSignalFactory.getClickSignal(touchInfo, this._adUnit).then((signal) => {
            return Url.addParameters(url, {
                ms: signal.getBase64ProtoBufNonEncoded(),
                rvdt: this._adUnit.getStartTime() - SdkStats.getAdRequestTimestamp()
            });
        });
    }
}
