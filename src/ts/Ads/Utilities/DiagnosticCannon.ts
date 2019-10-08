import { TimingMetric, IMultiMetricPayload } from 'Ads/Utilities/ProgrammaticTrackingService';

export class DiagnosticCannon {

    private _diagnosticBundle: IMultiMetricPayload[];
    private _countryIso: string;

    constructor(countryIso: string) {
        this._countryIso = countryIso;
        this._diagnosticBundle = [];
    }

    // TODO Allow generic metrics
    public prepareCannonball(metric: TimingMetric, value: number): void {
        this._diagnosticBundle.push({
            metric: metric,
            value: value
        });
    }

    public loadCannonball(): [IMultiMetricPayload[], string] {
        const loadedCannonBalls: [IMultiMetricPayload[], string] = [this._diagnosticBundle, this._countryIso];
        this._diagnosticBundle = [];
        return loadedCannonBalls;
    }
}
