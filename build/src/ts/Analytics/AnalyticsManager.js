import { AnalyticsProtocol } from 'Analytics/AnalyticsProtocol';
import { JaegerUtilities } from 'Core/Jaeger/JaegerUtilities';
import { Promises } from 'Core/Utilities/Promises';
export class AnalyticsManager {
    constructor(core, analytics, privacySDK, analyticsStorage) {
        this._endpoint = 'https://thind.unityads.unity3d.com/v1/events';
        this._newSessionThreshold = 1800000; // 30 minutes in milliseconds
        this._platform = core.NativeBridge.getPlatform();
        this._analytics = analytics;
        this._focusManager = core.FocusManager;
        this._request = core.RequestManager;
        this._clientInfo = core.ClientInfo;
        this._deviceInfo = core.DeviceInfo;
        this._configuration = core.Config;
        this._privacySDK = privacySDK;
        this._storage = analyticsStorage;
        this._adsAnalyticsSessionId = JaegerUtilities.uuidv4();
    }
    init() {
        if (this._clientInfo.isReinitialized()) {
            return Promise.all([
                this._storage.getUserId(),
                this._storage.getSessionId(this._clientInfo.isReinitialized())
            ]).then(([userId, sessionId]) => {
                this._analyticsUserId = userId;
                this._analyticsSessionId = sessionId;
                this.subscribeListeners();
            });
        }
        else {
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
                let updateDeviceInfo = false;
                if (appVersion) {
                    if (this._clientInfo.getApplicationVersion() !== appVersion) {
                        this.sendAppUpdate();
                        updateDeviceInfo = true;
                    }
                }
                else {
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
    getGameSessionId() {
        return this._analyticsSessionId;
    }
    onTransactionSuccess(transaction) {
        return this.sendTransaction(transaction);
    }
    subscribeListeners() {
        this._focusManager.onAppForeground.subscribe(() => this.onAppForeground());
        this._focusManager.onAppBackground.subscribe(() => this.onAppBackground());
        this._focusManager.onActivityResumed.subscribe((activity) => this.onActivityResumed(activity));
        this._focusManager.onActivityPaused.subscribe((activity) => this.onActivityPaused(activity));
    }
    sendNewSession() {
        const appStartEvent = AnalyticsProtocol.createAppStartEvent();
        this._latestAppStartTime = appStartEvent.msg.ts;
        this.send(appStartEvent);
    }
    sendAppRunning() {
        this.send(AnalyticsProtocol.createAppRunningEvent(this._latestAppStartTime));
    }
    sendNewInstall() {
        this.send(AnalyticsProtocol.createAppInstallEvent(this._clientInfo, this._latestAppStartTime));
    }
    sendAppUpdate() {
        this.send(AnalyticsProtocol.createAppUpdateEvent(this._clientInfo, this._latestAppStartTime));
    }
    sendTransaction(transaction) {
        return this.send(AnalyticsProtocol.createTransactionEvent(transaction, this._platform));
    }
    onAppForeground() {
        if (this._backgroundTimestamp && Date.now() - this._backgroundTimestamp > this._newSessionThreshold) {
            this._storage.getSessionId(false).then(sessionId => {
                this._analyticsSessionId = sessionId;
                this._storage.setIds(this._analyticsUserId, this._analyticsSessionId);
                this.sendNewSession();
            });
        }
    }
    onAppBackground() {
        this._backgroundTimestamp = Date.now();
        this.sendAppRunning();
    }
    onActivityResumed(activity) {
        if (this._topActivity === activity && this._backgroundTimestamp && Date.now() - this._backgroundTimestamp > this._newSessionThreshold) {
            this._storage.getSessionId(false).then(sessionId => {
                this._analyticsSessionId = sessionId;
                this._storage.setIds(this._analyticsUserId, this._analyticsSessionId);
                this.sendNewSession();
            });
        }
        this._topActivity = activity;
    }
    onActivityPaused(activity) {
        if (this._topActivity === activity || !this._topActivity) {
            this._backgroundTimestamp = Date.now();
            this.sendAppRunning();
        }
        if (!this._topActivity) {
            this._topActivity = activity;
        }
    }
    send(event) {
        const common = AnalyticsProtocol.getCommonObject(this._platform, this._adsAnalyticsSessionId, this._analyticsUserId, this._analyticsSessionId, this._clientInfo, this._deviceInfo, this._configuration, this._privacySDK);
        const data = JSON.stringify(common) + '\n' + JSON.stringify(event) + '\n';
        return Promises.voidResult(this._request.post(this._endpoint, data));
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQW5hbHl0aWNzTWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy90cy9BbmFseXRpY3MvQW5hbHl0aWNzTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQ0gsaUJBQWlCLEVBR3BCLE1BQU0sNkJBQTZCLENBQUM7QUFNckMsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBTTlELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUluRCxNQUFNLE9BQU8sZ0JBQWdCO0lBdUJ6QixZQUFZLElBQVcsRUFBRSxTQUF3QixFQUFFLFVBQXNCLEVBQUUsZ0JBQWtDO1FBTnJHLGNBQVMsR0FBVyw4Q0FBOEMsQ0FBQztRQUNuRSx5QkFBb0IsR0FBVyxPQUFPLENBQUMsQ0FBQyw2QkFBNkI7UUFNekUsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ2pELElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO1FBQzVCLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQztRQUN2QyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUM7UUFDcEMsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQ25DLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUNuQyxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDbEMsSUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUM7UUFDOUIsSUFBSSxDQUFDLFFBQVEsR0FBRyxnQkFBZ0IsQ0FBQztRQUVqQyxJQUFJLENBQUMsc0JBQXNCLEdBQUcsZUFBZSxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQzNELENBQUM7SUFFTSxJQUFJO1FBQ1AsSUFB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