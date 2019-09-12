import {
    AnalyticsProtocol,
    IAnalyticsMonetizationExtras,
    IAnalyticsObject,
    IAnalyticsCommonObjectV1
} from 'Analytics/AnalyticsProtocol';
import { AnalyticsStorage } from 'Analytics/AnalyticsStorage';
import { IAnalyticsManager } from 'Analytics/IAnalyticsManager';
import { IAnalyticsApi } from 'Analytics/IAnalytics';
import { Platform } from 'Core/Constants/Platform';
import { ICore } from 'Core/ICore';
import { JaegerUtilities } from 'Core/Jaeger/JaegerUtilities';
import { FocusManager } from 'Core/Managers/FocusManager';
import { RequestManager } from 'Core/Managers/RequestManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { PurchasingFailureReason } from 'Promo/Models/PurchasingFailureReason';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { Promises } from 'Core/Utilities/Promises';
import { StoreTransaction } from 'Store/Models/StoreTransaction';

export class AnalyticsManager implements IAnalyticsManager {

    private _platform: Platform;
    private _analytics: IAnalyticsApi;
    private _request: RequestManager;
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;
    private _configuration: CoreConfiguration;
    private _adsConfiguration: AdsConfiguration;
    private _analyticsUserId: string;
    private _analyticsSessionId: number;
    private _storage: AnalyticsStorage;
    private _focusManager: FocusManager;

    private _backgroundTimestamp: number;
    private _topActivity: string;

    private _endpoint: string = 'https://thind.unityads.unity3d.com';
    private _newSessionThreshold: number = 1800000; // 30 minutes in milliseconds

    private _adsAnalyticsSessionId: string;
    private _latestAppStartTime: number;

    public static getPurchasingFailureReason(reason: string): PurchasingFailureReason {
        switch (reason) {
            case 'NOT_SUPPORTED':
                return PurchasingFailureReason.ProductUnavailable;
            case 'ITEM_UNAVAILABLE':
                return PurchasingFailureReason.ProductUnavailable;
            case 'USER_CANCELLED':
                return PurchasingFailureReason.UserCancelled;
            case 'NETWORK_ERROR':
            case 'SERVER_ERROR':
            case 'UNKNOWN_ERROR':
            default:
                return PurchasingFailureReason.Unknown;
        }
    }

    constructor(core: ICore, analytics: IAnalyticsApi, adsConfiguration: AdsConfiguration, analyticsStorage: AnalyticsStorage) {
        this._platform = core.NativeBridge.getPlatform();
        this._analytics = analytics;
        this._focusManager = core.FocusManager;
        this._request = core.RequestManager;
        this._clientInfo = core.ClientInfo;
        this._deviceInfo = core.DeviceInfo;
        this._configuration = core.Config;
        this._adsConfiguration = adsConfiguration;
        this._storage = analyticsStorage;

        this._analytics.Analytics.addExtras({
            'unity_monetization_extras': JSON.stringify(this.buildMonetizationExtras())
        });
        this._adsAnalyticsSessionId = JaegerUtilities.uuidv4();
    }

    public init(): Promise<void> {
        if (this._clientInfo.isReinitialized()) {
            return Promise.all([
                this._storage.getUserId(),
                this._storage.getSessionId(this._clientInfo.isReinitialized())
            ]).then(([userId, sessionId]) => {
                this._analyticsUserId = userId;
                this._analyticsSessionId = sessionId;
                this.subscribeListeners();
            });
        } else {
            return Promise.all([
                this._storage.getUserId(),
                this._storage.getSessionId(this._clientInfo.isReinitialized()),
                this._storage.getAppVersion(),
                this._storage.getOsVersion()
            ]).then(([userId, sessionId, appVersion, osVersion]) => {
                this._analyticsUserId = userId;
                this._analyticsSessionId = sessionId;
                this._storage.setIds(userId, sessionId);

                this.sendNewSession();

                let updateDeviceInfo: boolean = false;
                if (appVersion) {
                    if (this._clientInfo.getApplicationVersion() !== appVersion) {
                        this.sendAppUpdate();
                        updateDeviceInfo = true;
                    }
                } else {
                    this.sendNewInstall();
                    updateDeviceInfo = true;
                }

                if (osVersion) {
                    if (this._deviceInfo.getOsVersion() !== osVersion) {
                        updateDeviceInfo = true;
                    }
                }

                if (updateDeviceInfo) {
                    this._storage.setVersions(this._clientInfo.getApplicationVersion(), this._deviceInfo.getOsVersion());
                }

                this.subscribeListeners();
            });
        }
    }

    public getGameSessionId(): number {
        return this._analyticsSessionId;
    }

    public onTransactionSuccess(transaction: StoreTransaction): Promise<void> {
        return this.sendTransaction(transaction);
    }

    private subscribeListeners(): void {
        this._focusManager.onAppForeground.subscribe(() => this.onAppForeground());
        this._focusManager.onAppBackground.subscribe(() => this.onAppBackground());
        this._focusManager.onActivityResumed.subscribe((activity) => this.onActivityResumed(activity));
        this._focusManager.onActivityPaused.subscribe((activity) => this.onActivityPaused(activity));
    }

    private sendNewSession(): void {
        const appStartEvent = AnalyticsProtocol.createAppStartEvent();
        this._latestAppStartTime = appStartEvent.msg.ts;
        this.send(appStartEvent);
    }

    private sendAppRunning(): void {
        this.send(AnalyticsProtocol.createAppRunningEvent(this._latestAppStartTime));
    }

    private sendNewInstall(): void {
        this.send(AnalyticsProtocol.createAppInstallEvent(this._clientInfo, this._latestAppStartTime));
    }

    private sendAppUpdate(): void {
        this.send(AnalyticsProtocol.createAppUpdateEvent(this._clientInfo, this._latestAppStartTime));
    }

    private sendTransaction(transaction: StoreTransaction): Promise<void> {
        return this.send(AnalyticsProtocol.createTransactionEvent(transaction, this._platform));
    }

    private onAppForeground(): void {
        if (this._backgroundTimestamp && Date.now() - this._backgroundTimestamp > this._newSessionThreshold) {
            this._storage.getSessionId(false).then(sessionId => {
                this._analyticsSessionId = sessionId;
                this._storage.setIds(this._analyticsUserId, this._analyticsSessionId);
                this.sendNewSession();
            });
        }
    }

    private onAppBackground(): void {
        this._backgroundTimestamp = Date.now();
        this.sendAppRunning();
    }

    private onActivityResumed(activity: string): void {
        if (this._topActivity === activity && this._backgroundTimestamp && Date.now() - this._backgroundTimestamp > this._newSessionThreshold) {
            this._storage.getSessionId(false).then(sessionId => {
                this._analyticsSessionId = sessionId;
                this._storage.setIds(this._analyticsUserId, this._analyticsSessionId);
                this.sendNewSession();
            });
        }

        this._topActivity = activity;
    }

    private onActivityPaused(activity: string): void {
        if (this._topActivity === activity || !this._topActivity) {
            this._backgroundTimestamp = Date.now();
            this.sendAppRunning();
        }

        if (!this._topActivity) {
            this._topActivity = activity;
        }
    }

    protected send<T>(event: IAnalyticsObject<T>): Promise<void> {
        const common: IAnalyticsCommonObjectV1 = AnalyticsProtocol.getCommonObject(this._platform, this._adsAnalyticsSessionId, this._analyticsUserId, this._analyticsSessionId, this._clientInfo, this._deviceInfo, this._configuration, this._adsConfiguration);
        const data: string = JSON.stringify(common) + '\n' + JSON.stringify(event) + '\n';

        return Promises.voidResult(this._request.post(this._endpoint, data));
    }

    private buildMonetizationExtras(): IAnalyticsMonetizationExtras {
        return {
            gamer_token: this._configuration.getToken(),
            game_id: this._clientInfo.getGameId()
        };
    }
}
