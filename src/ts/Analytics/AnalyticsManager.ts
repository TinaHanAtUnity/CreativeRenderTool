import { NativeBridge } from 'Native/NativeBridge';
import { ClientInfo } from 'Models/ClientInfo';
import { DeviceInfo } from 'Models/DeviceInfo';
import { StorageType } from 'Native/Api/Storage';
import { AnalyticsStorage } from 'Analytics/AnalyticsStorage';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { Request } from 'Utilities/Request';
import { AnalyticsProtocol, IAnalyticsObject } from 'Analytics/AnalyticsProtocol';

export class AnalyticsManager {
    private _nativeBridge: NativeBridge;
    private _wakeUpManager: WakeUpManager;
    private _request: Request;
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;
    private _userId: string;
    private _sessionId: number;
    private _sessionStartTimestamp: number;
    private _storage: AnalyticsStorage;

    private _endpoint: string = 'http://10.1.66.20:1234';

    constructor(nativeBridge: NativeBridge, wakeUpManager: WakeUpManager, request: Request, clientInfo: ClientInfo, deviceInfo: DeviceInfo) {
        this._nativeBridge = nativeBridge;
        this._wakeUpManager = wakeUpManager;
        this._request = request;
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
        this._storage = new AnalyticsStorage(nativeBridge);
    }

    public webviewStart(): Promise<void> {
        const promises: Promise<any>[] = [];
        promises.push(this.getUserId());
        promises.push(this._storage.getValue('analytics.appversion'));
        promises.push(this._storage.getValue('analytics.osversion'));

        return Promise.all(promises).then(([userId, appVersion, osVersion]) => {
            this._userId = userId;

            this.newSession();

            let updateDeviceInfo: boolean = false;
            if(appVersion) {
                if(this._clientInfo.getApplicationVersion() !== appVersion) {
                    this.appUpdate();
                    updateDeviceInfo = true;
                }
            } else {
                this.newInstall();
                updateDeviceInfo = true;
            }

            if(osVersion) {
                if(this._deviceInfo.getOsVersion() !== osVersion) {
                    updateDeviceInfo = true;
                }
            }

            if(updateDeviceInfo) {
                this.deviceInfoChange();

                this._nativeBridge.Storage.set<string>(StorageType.PRIVATE, 'analytics.appversion', this._clientInfo.getApplicationVersion());
                this._nativeBridge.Storage.set<string>(StorageType.PRIVATE, 'analytics.osversion', this._deviceInfo.getOsVersion());
                this._nativeBridge.Storage.write(StorageType.PRIVATE);
            }

            this._wakeUpManager.onAppForeground.subscribe(() => this.onAppForeground());
            this._wakeUpManager.onAppBackground.subscribe(() => this.onAppBackground());
        });
    }

    private newSession(): void {
        this._sessionId = Math.floor(Math.random() * 1000000); // todo: replace with call to native method
        this._sessionStartTimestamp = Date.now();

        this._storage.setCommonObject(AnalyticsProtocol.getCommonObject(this._nativeBridge.getPlatform(), this._userId, this._sessionId, this._clientInfo, this._deviceInfo));

        this._storage.pushEvent(AnalyticsProtocol.getStartObject());
    }

    private newInstall(): void {
        this._storage.pushEvent(AnalyticsProtocol.getInstallObject(this._clientInfo));
    }

    private appUpdate(): void {
        this._storage.pushEvent(AnalyticsProtocol.getUpdateObject(this._clientInfo));
    }

    private deviceInfoChange(): void {
        this._storage.pushEvent(AnalyticsProtocol.getDeviceInfoObject(this._clientInfo, this._deviceInfo));
    }

    private onAppForeground(): void {
        // todo: check if a new session should be started
    }

    private onAppBackground(): void {
        this._storage.pushEvent(AnalyticsProtocol.getRunningObject((Date.now() - this._sessionStartTimestamp) / 1000));

        this.send();
    }

    private send(): void {
        const events: IAnalyticsObject[] = this._storage.getEvents();
        this._storage.clearEvents(); // todo: clean storage only after a successful send

        const newline: string = '\n';
        let data: string = JSON.stringify(this._storage.getCommonObject()) + newline;
        for(const event in events) {
            if(events.hasOwnProperty(event)) {
                data += JSON.stringify(events[event]) + newline;
            }
        }

        this._request.post(this._endpoint, data);
    }

    private getUserId(): Promise<string> {
        return this._storage.getValue('analytics.userid').then(userId => {
            if(userId) {
                return userId;
            } else {
                return this._nativeBridge.DeviceInfo.getUniqueEventId();
            }
        });
    }
}
