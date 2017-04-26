import { NativeBridge } from 'Native/NativeBridge';
import { ClientInfo } from 'Models/ClientInfo';
import { DeviceInfo } from 'Models/DeviceInfo';
import { AnalyticsStorage } from 'Analytics/AnalyticsStorage';
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

    private _endpoint: string = 'http://10.35.4.43:1234';

    constructor(nativeBridge: NativeBridge, wakeUpManager: WakeUpManager, request: Request, clientInfo: ClientInfo, deviceInfo: DeviceInfo) {
        this._nativeBridge = nativeBridge;
        this._wakeUpManager = wakeUpManager;
        this._request = request;
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
        this._storage = new AnalyticsStorage(nativeBridge);
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

    private subscribeListeners(): void {
        this._wakeUpManager.onAppForeground.subscribe(() => this.onAppForeground());
        this._wakeUpManager.onAppBackground.subscribe(() => this.onAppBackground());
        this._wakeUpManager.onActivityResumed.subscribe(() => this.onAppForeground());
        this._wakeUpManager.onActivityPaused.subscribe(() => this.onAppBackground());
    }

    private sendNewSession(): void {
        this.send(AnalyticsProtocol.getStartObject());
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

    private onAppForeground(): void {
        // todo: check if a new session should be started
    }

    private onAppBackground(): void {
        this._bgTimestamp = Date.now();

        this.send(AnalyticsProtocol.getRunningObject(Math.round((this._bgTimestamp - this._clientInfo.getInitTimestamp()) / 1000)));
    }

    private send(event: IAnalyticsObject): Promise<INativeResponse> {
        const common: IAnalyticsCommonObject = AnalyticsProtocol.getCommonObject(this._nativeBridge.getPlatform(), this._userId, this._sessionId, this._clientInfo, this._deviceInfo);
        const data: string = JSON.stringify(common) + '\n' + JSON.stringify(event) + '\n';

        return this._request.post(this._endpoint, data);
    }

}
