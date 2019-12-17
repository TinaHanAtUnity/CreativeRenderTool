import { ICore } from 'Core/ICore';
import { IAdsApi } from 'Ads/IAds';
import { Platform } from 'Core/Constants/Platform';
import { FocusManager } from 'Core/Managers/FocusManager';
import { LoadMetric, ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';

export class MediationTimeoutManager {
    private _timeoutHandles: {[key: string]: number } = {};
    private _pts: ProgrammaticTrackingService;
    private static mediationTimeout = 30000;

    constructor(platform: Platform, ads: IAdsApi, focusManager: FocusManager,  programmaticTrackingService: ProgrammaticTrackingService) {
        this._pts = programmaticTrackingService;

        ads.LoadApi.onLoad.subscribe((placements: {[key: string]: number}) => {
            Object.keys(placements).forEach((placementId) => {
                this.tryToFireTimeoutMetric();
                this._timeoutHandles[placementId] = Date.now();
            });
        });

        if (platform === Platform.IOS) {
            focusManager.onAppForeground.subscribe(() => this.tryToFireTimeoutMetric());
            focusManager.onAppBackground.subscribe(() => this.tryToFireTimeoutMetric());
        } else {
            focusManager.onScreenOn.subscribe(() => this.tryToFireTimeoutMetric());
            focusManager.onActivityResumed.subscribe(() => this.tryToFireTimeoutMetric());
            focusManager.onActivityPaused.subscribe(() => this.tryToFireTimeoutMetric());
            focusManager.onActivityDestroyed.subscribe(() => this.tryToFireTimeoutMetric());
        }

        ads.Listener.onReadySent.subscribe((placementId) => {
            this.tryToFireTimeoutMetric();
            if (this._timeoutHandles[placementId]) {
                delete this._timeoutHandles[placementId];
            }
        });

        ads.Listener.onErrorEvent.subscribe(() => {
            this.tryToFireTimeoutMetric();
        });

        ads.Listener.onPlacementStateChangedEventSent.subscribe((placementId) => { 
            this.tryToFireTimeoutMetric();
            if (this._timeoutHandles[placementId]) {
                delete this._timeoutHandles[placementId];
            }
        });
    }

    private tryToFireTimeoutMetric() {
        Object.keys(this._timeoutHandles).forEach((placementId) => {
            if (this._timeoutHandles[placementId] < Date.now() - MediationTimeoutManager.mediationTimeout) {
                this._pts.reportMetricEvent(LoadMetric.LoadRequestTimeout);
                delete this._timeoutHandles[placementId];
            }
        });
    }
}
