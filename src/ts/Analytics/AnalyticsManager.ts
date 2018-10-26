import {
    AnalyticsAdCompleteEvent,
    AnalyticsGenericEvent,
    AnalyticsIapPurchaseFailedEvent,
    AnalyticsIapTransactionEvent,
    AnalyticsItemAcquiredEvent,
    AnalyticsItemSpentEvent,
    AnalyticsLevelFailedEvent,
    AnalyticsLevelUpEvent,
    AnalyticsProtocol,
    IAnalyticsCommonObject,
    IAnalyticsMonetizationExtras,
    IAnalyticsObject
} from 'Analytics/AnalyticsProtocol';
import { AnalyticsStorage } from 'Analytics/AnalyticsStorage';
import { IAnalyticsApi } from 'Analytics/IAnalytics';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { JaegerUtilities } from 'Core/Jaeger/JaegerUtilities';
import { FocusManager } from 'Core/Managers/FocusManager';
import { INativeResponse, RequestManager } from 'Core/Managers/RequestManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { PurchasingFailureReason } from 'Promo/Models/PurchasingFailureReason';

interface IAnalyticsEventWrapper {
    identifier: string;
    event: AnalyticsGenericEvent;
    posting: boolean;
}

export class AnalyticsManager {

    private static storageAnalyticsQueueKey: string = 'analytics.event.queue';

    private _platform: Platform;
    private _core: ICoreApi;
    private _analytics: IAnalyticsApi;
    private _request: RequestManager;
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;
    private _configuration: CoreConfiguration;
    private _userId: string;
    private _sessionId: number;
    private _storage: AnalyticsStorage;
    private _focusManager: FocusManager;

    private _bgTimestamp: number;
    private _topActivity: string;

    private _endpoint: string;
    private _cdpEndpoint: string;
    private _newSessionTreshold: number = 1800000; // 30 minutes in milliseconds

    private _analyticsEventQueue: {[key: string]: IAnalyticsEventWrapper};

    public static getPurchasingFailureReason(reason: string): PurchasingFailureReason {
        switch(reason) {
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

    constructor(platform: Platform, core: ICoreApi, analytics: IAnalyticsApi, request: RequestManager, clientInfo: ClientInfo, deviceInfo: DeviceInfo, configuration: CoreConfiguration, focusManager: FocusManager, analyticsStorage: AnalyticsStorage) {
        this._platform = platform;
        this._core = core;
        this._analytics = analytics;
        this._focusManager = focusManager;
        this._request = request;
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
        this._configuration = configuration;
        this._storage = analyticsStorage;

        this._endpoint = 'https://prd-lender.cdp.internal.unity3d.com/v1/events';
        this._cdpEndpoint = 'https://cdp.cloud.unity3d.com/v1/events';

        this._analyticsEventQueue = {};
        this._analytics.Analytics.onPostEvent.subscribe((eventData) => this.onPostEvent(eventData));
        this._analytics.Analytics.addExtras({
            'unity_monetization_extras': JSON.stringify(this.buildMonetizationExtras())
        });
    }

    public init(): Promise<void> {
        if(this._clientInfo.isReinitialized()) {
            const promises: Array<Promise<any>> = [];
            promises.push(this._storage.getUserId());
            promises.push(this._storage.getSessionId(this._clientInfo.isReinitialized()));

            return Promise.all(promises).then(([userId, sessionId, appVersion, osVersion]) => {
                this._userId = userId;
                this._sessionId = sessionId;

                this.subscribeListeners();
            });
        } else {
            const promises: Array<Promise<any>> = [];
            promises.push(this._storage.getUserId());
            promises.push(this._storage.getSessionId(this._clientInfo.isReinitialized()));
            promises.push(this._storage.getAppVersion());
            promises.push(this._storage.getOsVersion());

            return Promise.all(promises).then(([userId, sessionId, appVersion, osVersion]) => {
                this._userId = userId;
                this._sessionId = sessionId;
                this._storage.setIds(userId, sessionId);

                this.sendNewSession();

                let updateDeviceInfo: boolean = false;
                if(appVersion) {
                    if (this._clientInfo.getApplicationVersion() !== appVersion) {
                        this.sendAppUpdate();
                        updateDeviceInfo = true;
                    }
                } else {
                    this.sendNewInstall();
                    updateDeviceInfo = true;
                }

                if(osVersion) {
                    if (this._deviceInfo.getOsVersion() !== osVersion) {
                        updateDeviceInfo = true;
                    }
                }

                if(updateDeviceInfo) {
                    this.sendDeviceInfo();
                    this._storage.setVersions(this._clientInfo.getApplicationVersion(), this._deviceInfo.getOsVersion());
                }

                this.subscribeListeners();
            });
        }
    }

    public getGameSessionId(): number {
        return this._sessionId;
    }

    // add IapTransaction to queue manually. Here for purchasing logic.
    public onIapTransaction(productId: string, receipt: string, currency: string, price: number): Promise<void[]> {
        const event: AnalyticsIapTransactionEvent | undefined = this.createIapTransactionEvent(productId, receipt, currency, price);
        if (event) {
            const analyticsEvent: IAnalyticsEventWrapper = {
                identifier: JaegerUtilities.uuidv4(),
                event: event,
                posting: false
            };
            this._analyticsEventQueue[analyticsEvent.identifier] = analyticsEvent;
            return this.flushEvents();
        } else {
            this._core.Sdk.logError(`AnalyticsManager: Unable to create AnalyticsIapTransactionEvent with fields : productId: ${productId} : receipt: ${receipt} : currency: ${currency} : price: ${price}`);
            return Promise.reject(new Error(`AnalyticsManager: Unable to create AnalyticsIapTransactionEvent with fields : productId: ${productId} : receipt: ${receipt} : currency: ${currency} : price: ${price}`));
        }
    }

    public onPurchaseFailed(productId: string, reason: string, price: number | undefined, currency: string | undefined) {
        const failReason: PurchasingFailureReason = AnalyticsManager.getPurchasingFailureReason(reason);
        const event: AnalyticsIapPurchaseFailedEvent | undefined = this.createIapPurchaseFailedEvent(productId, failReason, price, currency);
        if (event) {
            const analyticsEvent: IAnalyticsEventWrapper = {
                identifier: JaegerUtilities.uuidv4(),
                event: event,
                posting: false
            };
            this._analyticsEventQueue[analyticsEvent.identifier] = analyticsEvent;
            this.flushEvents();
        } else {
            this._core.Sdk.logError(`AnalyticsManager: Unable to create AnalyticsIapFailedEvent with fields : productId: ${productId} : reason: ${reason} : currency: ${currency} : price: ${price}`);
        }
    }

    private createIapTransactionEvent(productId: string, receipt: string, currency: string, price: number): AnalyticsIapTransactionEvent | undefined {
        if (productId && receipt && currency && price) {
            return <AnalyticsIapTransactionEvent>{
                type: 'analytics.transaction.v1',
                msg: {
                    ts: new Date().getTime(),
                    productid: productId,
                    amount: price,
                    currency: currency,
                    transactionid: 0,
                    iap_service: false,
                    promo: true,
                    receipt: receipt,
                    unity_monetization_extras: JSON.stringify(this.buildMonetizationExtras())
                }
            };
        } else {
            return undefined;
        }
    }

    private createIapPurchaseFailedEvent(productId: string, reason: PurchasingFailureReason, price: number | undefined, currency: string | undefined): AnalyticsIapPurchaseFailedEvent | undefined {
        if (productId && reason && price && currency) {
            return <AnalyticsIapPurchaseFailedEvent>{
                type: 'analytics.custom.v1',
                msg: {
                    ts: new Date().getTime(),
                    name: 'unity.PurchaseFailed',
                    custom_params: {
                        productID: productId,
                        reason: PurchasingFailureReason[reason],
                        price: price,
                        currency: currency
                    }
                }
            };
        } else {
            return undefined;
        }
    }

    private subscribeListeners(): void {
        this._focusManager.onAppForeground.subscribe(() => this.onAppForeground());
        this._focusManager.onAppBackground.subscribe(() => this.onAppBackground());
        this._focusManager.onActivityResumed.subscribe((activity) => this.onActivityResumed(activity));
        this._focusManager.onActivityPaused.subscribe((activity) => this.onActivityPaused(activity));
    }

    private sendNewSession(): void {
        this.send(AnalyticsProtocol.getStartObject());
    }

    private sendAppRunning(): void {
        this.send(AnalyticsProtocol.getRunningObject(Math.round((this._bgTimestamp - this._clientInfo.getInitTimestamp()) / 1000)));
    }

    private sendNewInstall(): void {
        this.send(AnalyticsProtocol.getInstallObject(this._clientInfo));
    }

    private sendAppUpdate(): void {
        this.send(AnalyticsProtocol.getUpdateObject(this._clientInfo));
    }

    private sendDeviceInfo(): void {
        AnalyticsProtocol.getDeviceInfoObject(this._platform, this._core, this._clientInfo, this._deviceInfo).then(deviceInfoObject => {
            this.send(deviceInfoObject);
        });
    }

    private onAppForeground(): void {
        if(this._bgTimestamp && Date.now() - this._bgTimestamp > this._newSessionTreshold) {
            this._storage.getSessionId(false).then(sessionId => {
                this._sessionId = sessionId;
                this._storage.setIds(this._userId, this._sessionId);
                this.sendNewSession();
            });
        }
    }

    private onAppBackground(): void {
        this._bgTimestamp = Date.now();
        this.sendAppRunning();
    }

    private onActivityResumed(activity: string): void {
        if(this._topActivity === activity && this._bgTimestamp && Date.now() - this._bgTimestamp > this._newSessionTreshold) {
            this._storage.getSessionId(false).then(sessionId => {
                this._sessionId = sessionId;
                this._storage.setIds(this._userId, this._sessionId);
                this.sendNewSession();
            });
        }

        this._topActivity = activity;
    }

    private onActivityPaused(activity: string): void {
        if(this._topActivity === activity || !this._topActivity) {
            this._bgTimestamp = Date.now();
            this.sendAppRunning();
        }

        if(!this._topActivity) {
            this._topActivity = activity;
        }
    }

    private onPostEvent(events: AnalyticsGenericEvent[]) {
        const operations: Promise<void>[] = [];
        for (const event of events) {
            const parsePromise = this.parseAnalyticsEvent(event).then((parsedEvent: AnalyticsGenericEvent | null) => {
                if (parsedEvent) {
                    const analyticsEvent: IAnalyticsEventWrapper = {
                        identifier: JaegerUtilities.uuidv4(),
                        event: parsedEvent,
                        posting: false
                    };
                    this._analyticsEventQueue[analyticsEvent.identifier] = analyticsEvent;
                }
            });
            operations.push(parsePromise);
        }
        // TODO when es6 is enabled use .finally
        Promise.all(operations).then(() => {
            this.flushEvents();
        }).catch(() => {
            this.flushEvents();
        });
    }

    private send(event: IAnalyticsObject): Promise<INativeResponse> {
        const common: IAnalyticsCommonObject = AnalyticsProtocol.getCommonObject(this._platform, this._userId, this._sessionId, this._clientInfo, this._deviceInfo, this._configuration);
        const data: string = JSON.stringify(common) + '\n' + JSON.stringify(event) + '\n';

        return this._request.post(this._endpoint, data);
    }

    private sendEvents(events: IAnalyticsEventWrapper[]): Promise<void> {
        const common: IAnalyticsCommonObject = AnalyticsProtocol.getCommonObject(this._platform, this._userId, this._sessionId, this._clientInfo, this._deviceInfo, this._configuration);
        const data: string = JSON.stringify(common) + '\n' + events.map((event: IAnalyticsEventWrapper) => {
            return JSON.stringify(event.event);
        }).join('\n');

        return this._request.post(this._cdpEndpoint, data).then(() => {
            // remove successfully sent events
            for (const event of events) {
                delete this._analyticsEventQueue[event.identifier];
            }
        }).catch((error: Error) => {
            events.map((value: IAnalyticsEventWrapper) => {
                value.posting = false;
            });
            this._core.Sdk.logError(error.message);
            throw error;
        });
    }

    private flushEvents(): Promise<void[]> {
        let batch: IAnalyticsEventWrapper[]  = [];
        const batchSize = 10;
        const promises: Promise<void>[] = [];
        for (const key of Object.keys(this._analyticsEventQueue)) {
            const event = this._analyticsEventQueue[key];
            if (batch.length === batchSize) {
                // send events and reset batch
                promises.push(this.sendEvents(batch));
                batch = [];
            }
            if (!event.posting) {
                event.posting = true;
                batch.push(event);
            }
        }
        if (batch.length > 0) {
            promises.push(this.sendEvents(batch));
        }
        return Promise.all(promises);
    }

    private buildMonetizationExtras(): IAnalyticsMonetizationExtras {
        return {
            gamer_token: this._configuration.getToken(),
            game_id: this._clientInfo.getGameId()
        };
    }

    private parseAnalyticsEvent(event: AnalyticsGenericEvent): Promise<AnalyticsGenericEvent | null> {
        try {
            if (this.isItemAcquired(<AnalyticsItemAcquiredEvent>event)) {
                return this.buildItemAcquired(<AnalyticsItemAcquiredEvent>event);
            } else if (this.isItemSpent(<AnalyticsItemSpentEvent>event)) {
                return this.buildItemSpent(<AnalyticsItemSpentEvent>event);
            } else if (this.isLevelFailed(<AnalyticsLevelFailedEvent> event)) {
                return this.buildLevelFailed(<AnalyticsLevelFailedEvent> event);
            } else if (this.isLevelUp(<AnalyticsLevelUpEvent> event)) {
                return this.buildLevelUp(<AnalyticsLevelUpEvent> event);
            } else if (this.isAdComplete(<AnalyticsAdCompleteEvent> event)) {
                return this.buildAdComplete(<AnalyticsAdCompleteEvent> event);
            } else if (this.isIapTransaction(<AnalyticsIapTransactionEvent> event)) {
                return this.buildIapTransaction(<AnalyticsIapTransactionEvent> event);
            } else {
                this._core.Sdk.logError('parseAnalyticsEvent was not able to parse event');
                return Promise.resolve(null);
            }
        } catch(error) {
            this._core.Sdk.logError(error);
            return Promise.resolve(null);
        }
    }

    private buildIapTransaction(event: AnalyticsIapTransactionEvent): Promise<AnalyticsIapTransactionEvent> {
        event.msg.unity_monetization_extras = JSON.stringify(this.buildMonetizationExtras());
        event.msg.transactionid = 0; // this field has been deprecated so just filling with 0
        // this field is to denote if analytics events are being sent from IAP
        event.msg.iap_service = false; // this field should always be false when events are sent from the ads sdk.
        return Promise.resolve(event);
    }

    private isIapTransaction(event: AnalyticsIapTransactionEvent): boolean {
        if (event && event.msg && event.type === 'analytics.transaction.v1') {
            const msg = event.msg;
            if (!msg.ts) {
                throw new Error('AnalyticsIapTransactionEvent is missing field : "ts"');
            }
            if (!msg.productid) {
                throw new Error('AnalyticsIapTransactionEvent is missing field : "productid"');
            }
            if (!msg.amount) {
                throw new Error('AnalyticsIapTransactionEvent is missing field : "amount"');
            }
            if (!msg.currency) {
                throw new Error('AnalyticsIapTransactionEvent is missing field : "currency"');
            }
            if (msg.promo === null || msg.promo === undefined) {
                throw new Error('AnalyticsIapTransactionEvent is missing field : "promo"');
            }
            if (!msg.receipt) {
                throw new Error('AnalyticsIapTransactionEvent is missing field : "receipt"');
            }
            return true;
        }
        return false;
    }

    private buildAdComplete(event: AnalyticsAdCompleteEvent): Promise<AnalyticsAdCompleteEvent> {
        const currentTime = new Date().getTime();
        event.msg.t_since_start = (currentTime - event.msg.ts) * 1000; // convert milliseconds to microseconds
        event.msg.custom_params.unity_monetization_extras = JSON.stringify(this.buildMonetizationExtras());
        return Promise.resolve(event);
    }

    private isAdComplete(event: AnalyticsAdCompleteEvent): boolean {
        if (event && event.msg && event.type === 'analytics.custom.v1') {
            const msg = event.msg;
            if (msg.ts && msg.name && msg.custom_params && msg.name === 'ad_complete') {
                const customParams = msg.custom_params;
                if (customParams.rewarded === undefined || customParams.rewarded === null) {
                    throw new Error('AnalyticsAdCompleteEvent is missing field : "rewarded"');
                }
                if (!customParams.network) {
                    throw new Error('AnalyticsAdCompleteEvent is missing field : "network"');
                }
                if (!customParams.placement_id) {
                    throw new Error('AnalyticsAdCompleteEvent is missing field : "placement_id"');
                }
                return true;
            }
        }
        return false;
    }

    private buildLevelFailed(event: AnalyticsLevelFailedEvent): Promise<AnalyticsLevelFailedEvent> {
        const currentTime = new Date().getTime();
        event.msg.t_since_start = (currentTime - event.msg.ts) * 1000; // convert milliseconds to microseconds
        event.msg.custom_params.unity_monetization_extras = JSON.stringify(this.buildMonetizationExtras());
        return Promise.resolve(event);
    }

    private isLevelFailed(event: AnalyticsLevelFailedEvent): boolean {
        if (event && event.msg && event.type === 'analytics.custom.v1') {
            const msg = event.msg;
            if (msg.ts && msg.name && msg.custom_params && msg.name === 'level_fail') {
                const customParams = msg.custom_params;
                if (!customParams.level_index) {
                    throw new Error('AnalyticsLevelFailedEvent is missing field : "level_index"');
                }
                return true;
            }
        }
        return false;
    }

    private buildLevelUp(event: AnalyticsLevelUpEvent): Promise<AnalyticsLevelUpEvent> {
        const currentTime = new Date().getTime();
        event.msg.t_since_start = (currentTime - event.msg.ts) * 1000; // convert milliseconds to microseconds
        event.msg.custom_params.unity_monetization_extras = JSON.stringify(this.buildMonetizationExtras());
        return Promise.resolve(event);
    }

    private isLevelUp(event: AnalyticsLevelUpEvent): boolean {
        if (event && event.msg && event.type === 'analytics.custom.v1') {
            const msg = event.msg;
            if (msg.ts && msg.name && msg.custom_params && msg.name === 'level_up') {
                const customParams = msg.custom_params;
                if (!customParams.new_level_index) {
                    throw new Error('AnalyticsLevelUpEvent is missing field : "new_level_index"');
                }
                return true;
            }
        }
        return false;
    }

    private buildItemSpent(event: AnalyticsItemSpentEvent): Promise<AnalyticsItemSpentEvent> {
        const currentTime = new Date().getTime();
        event.msg.t_since_start = (currentTime - event.msg.ts) * 1000; // convert milliseconds to microseconds
        event.msg.custom_params.unity_monetization_extras = JSON.stringify(this.buildMonetizationExtras());
        return Promise.resolve(event);
    }

    private isItemSpent(event: AnalyticsItemSpentEvent): boolean {
        if (event && event.msg && event.type && event.type === 'analytics.custom.v1') {
            const msg = event.msg;
            if (msg.ts && msg.name && msg.custom_params && msg.name === 'item_spent') {
                const customParams = msg.custom_params;
                if (!customParams.currency_type) {
                    throw new Error('AnalyticsItemSpentEvent is missing field : "currency_type"');
                }
                if (!customParams.transaction_context) {
                    throw new Error('AnalyticsItemSpentEvent is missing field : "transaction_context"');
                }
                if (!customParams.amount) {
                    throw new Error('AnalyticsItemSpentEvent is missing field : "amount"');
                }
                if (!customParams.item_id) {
                    throw new Error('AnalyticsItemSpentEvent is missing field : "item_id"');
                }
                if (!customParams.balance) {
                    throw new Error('AnalyticsItemSpentEvent is missing field : "balance"');
                }
                if (!customParams.item_type) {
                    throw new Error('AnalyticsItemSpentEvent is missing field : "item_type"');
                }
                if (!customParams.level) {
                    throw new Error('AnalyticsItemSpentEvent is missing field : "level"');
                }
                if (!customParams.transaction_id) {
                    throw new Error('AnalyticsItemSpentEvent is missing field : "transaction_id"');
                }
                return true;
            }
        }
        return false;
    }

    private buildItemAcquired(event: AnalyticsItemAcquiredEvent): Promise<AnalyticsItemAcquiredEvent> {
        const currentTime = new Date().getTime();
        event.msg.t_since_start = (currentTime - event.msg.ts) * 1000; // convert milliseconds to microseconds
        event.msg.custom_params.unity_monetization_extras = JSON.stringify(this.buildMonetizationExtras());
        return Promise.resolve(event);
    }

    private isItemAcquired(event: AnalyticsItemAcquiredEvent): boolean {
        if (event && event.msg && event.type && event.type === 'analytics.custom.v1') {
            const msg = event.msg;
            if (msg.ts && msg.name && msg.custom_params && msg.name === 'item_acquired') {
                const customParams = msg.custom_params;
                if (!customParams.currency_type) {
                    throw new Error('AnalyticsItemAcquiredEvent is missing field : "currency_type"');
                }
                if (!customParams.transaction_context) {
                    throw new Error('AnalyticsItemAcquiredEvent is missing field : "transaction_context"');
                }
                if (!customParams.amount) {
                    throw new Error('AnalyticsItemAcquiredEvent is missing field : "amount"');
                }
                if (!customParams.item_id) {
                    throw new Error('AnalyticsItemAcquiredEvent is missing field : "item_id"');
                }
                if (!customParams.balance) {
                    throw new Error('AnalyticsItemAcquiredEvent is missing field : "balance"');
                }
                if (!customParams.item_type) {
                    throw new Error('AnalyticsItemAcquiredEvent is missing field : "item_type"');
                }
                if (!customParams.level) {
                    throw new Error('AnalyticsItemAcquiredEvent is missing field : "level"');
                }
                if (!customParams.transaction_id) {
                    throw new Error('AnalyticsItemAcquiredEvent is missing field : "transaction_id"');
                }
                return true;
            }
        }
        return false;
    }
}
