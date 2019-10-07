import { ProgrammaticTrackingService, TimingMetric } from 'Ads/Utilities/ProgrammaticTrackingService';
import { INativeResponse } from 'Core/Managers/RequestManager';
import { Promises } from 'Core/Utilities/Promises';

export class DiagnosticCannon {

    private _diagnosticBundle: {
        metric: TimingMetric;
        value: number;
    }[];
    private _pts: ProgrammaticTrackingService;

    constructor(pts: ProgrammaticTrackingService) {
        this._diagnosticBundle = [];
        this._pts = pts;
    }

    // TODO Allow generic metrics
    public pack(metric: TimingMetric, value: number): void {
        this._diagnosticBundle.push({
            metric: metric,
            value: value
        });
    }

    public lightFuse(countryIso: string): Promise<void> {
        const promises: Promise<INativeResponse>[] = [];
        this._diagnosticBundle.forEach(diagnostic => {
            promises.push(this._pts.reportTimingEvent(diagnostic.metric, diagnostic.value, countryIso));
        });
        return Promises.voidResult(Promise.all(promises));
    }
}
