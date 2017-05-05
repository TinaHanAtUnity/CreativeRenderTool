import { NativeBridge } from 'Native/NativeBridge';
import { ClientInfo } from 'Models/ClientInfo';
import { DeviceInfo } from 'Models/DeviceInfo';
import { AnalyticsStorage, IIAPInstrumentation } from 'Analytics/AnalyticsStorage';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { Request, INativeResponse } from 'Utilities/Request';
import { AnalyticsProtocol, IAnalyticsObject, IAnalyticsCommonObject } from 'Analytics/AnalyticsProtocol';

export class AnalyticsManager {
    private _nativeBridge: NativeBridge;
    private _wakeUpManager: WakeUpManager;
    private _request: Request;
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;
    private _userId: string;
    private _sessionId: number;
    private _storage: AnalyticsStorage;

    private _bgTimestamp: number;
    private _topActivity: string;

    private _endpoint: string;
    private _newSessionTreshold: number = 1800000; // 30 minutes in milliseconds

    constructor(nativeBridge: NativeBridge, wakeUpManager: WakeUpManager, request: Request, clientInfo: ClientInfo, deviceInfo: DeviceInfo) {
        this._nativeBridge = nativeBridge;
        this._wakeUpManager = wakeUpManager;
        this._request = request;
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
        this._storage = new AnalyticsStorage(nativeBridge);

        this._endpoint = 'https://10.35.4.44:4567/ack/' + clientInfo.getGameId();
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

                this._storage.getIAPTransactions().then(transactions => {
                    this.sendIAPTransactions(transactions);
                });

                this.subscribeListeners();
            });
        }
    }

    private subscribeListeners(): void {
        this._wakeUpManager.onAppForeground.subscribe(() => this.onAppForeground());
        this._wakeUpManager.onAppBackground.subscribe(() => this.onAppBackground());
        this._wakeUpManager.onActivityResumed.subscribe((activity) => this.onActivityResumed(activity));
        this._wakeUpManager.onActivityPaused.subscribe((activity) => this.onActivityPaused(activity));
        this._nativeBridge.Storage.onSet.subscribe((eventType, data) => this.onStorageSet(eventType, data));
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
        this.send(AnalyticsProtocol.getDeviceInfoObject(this._clientInfo, this._deviceInfo));
    }

    private sendIAPTransactions(transactions: IIAPInstrumentation[]): void {
        for(const item of transactions) {
            this._storage.getIntegerId().then(id => {
                this.send(AnalyticsProtocol.getIAPTransactionObject(id, item));
            });
        }
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

    private onStorageSet(eventType: string, data: string) {
        if(data && data.indexOf('price') !== -1 && data.indexOf('currency') !== -1) {
            this._storage.getIAPTransactions().then(transactions => {
                this.sendIAPTransactions(transactions);
            });
        }
    }

    private send(event: IAnalyticsObject): Promise<INativeResponse> {
        const common: IAnalyticsCommonObject = AnalyticsProtocol.getCommonObject(this._nativeBridge.getPlatform(), this._userId, this._sessionId, this._clientInfo, this._deviceInfo);
        const data: string = JSON.stringify(common) + '\n' + JSON.stringify(event) + '\n';

        return this._request.post(this._endpoint, data);
    }
}
