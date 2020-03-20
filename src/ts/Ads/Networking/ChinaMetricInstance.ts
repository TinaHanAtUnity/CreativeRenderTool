import { MetricInstance } from 'Ads/Networking/MetricInstance';

export class ChinaMetricInstance extends MetricInstance {
    protected getProductionUrl(): string {
        return 'https://sdk-diagnostics.prd.mz.internal.unity.cn';
    }
}
