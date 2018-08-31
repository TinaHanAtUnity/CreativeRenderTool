import { AnalyticsProtocol, IAnalyticsCommonObject, IAnalyticsObject } from 'Analytics/AnalyticsProtocol';
import { AnalyticsStorage } from 'Analytics/AnalyticsStorage';
import { NativeBridge } from 'Common/Native/NativeBridge';
import { FocusManager } from 'Core/Managers/FocusManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { Configuration } from 'Core/Models/Configuration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { INativeResponse, Request } from 'Core/Utilities/Request';

export class AnalyticsManager {
    private _nativeBridge: NativeBridge;
    private _wakeUpManager: WakeUpManager;
    private _request: Request;
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;
    private _configuration: Configuration;
    private _userId: string;
    private _sessionId: number;
    private _storage: AnalyticsStorage;
    private _focusManager: FocusManager;

    private _bgTimestamp: number;
    private _topActivity: string;

    private _endpoint: string;
    private _newSessionTreshold: number = 1800000; // 30 minutes in milliseconds

    constructor(nativeBridge: NativeBridge, wakeUpManager: WakeUpManager, request: Request, clientInfo: ClientInfo, deviceInfo: DeviceInfo, configuration: Configuration, focusManager: FocusManager) {
        this._nativeBridge = nativeBridge;
        this._focusManager = focusManager;
        this._wakeUpManager = wakeUpManager;
        this._request = request;
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
        this._configuration = configuration;
        this._storage = new AnalyticsStorage(nativeBridge);

        this._endpoint = 'https://prd-lender.cdp.internal.unity3d.com/v1/events';
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
        AnalyticsProtocol.getDeviceInfoObject(this._nativeBridge, this._clientInfo, this._deviceInfo).then(deviceInfoObject => {
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

    private send(event: IAnalyticsObject): Promise<INativeResponse> {
        const common: IAnalyticsCommonObject = AnalyticsProtocol.getCommonObject(this._nativeBridge.getPlatform(), this._userId, this._sessionId, this._clientInfo, this._deviceInfo, this._configuration);
        const data: string = JSON.stringify(common) + '\n' + JSON.stringify(event) + '\n';

        return this._request.post(this._endpoint, data);
    }
}
