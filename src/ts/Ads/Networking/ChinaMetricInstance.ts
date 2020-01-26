import { MetricInstance } from 'Ads/Networking/MetricInstance';
import { Platform } from 'Core/Constants/Platform';
import { RequestManager } from 'Core/Managers/RequestManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { DeviceInfo } from 'Core/Models/DeviceInfo';

export class ChinaMetricInstance extends MetricInstance {
    constructor(platform: Platform, requestManager: RequestManager, clientInfo: ClientInfo, deviceInfo: DeviceInfo, country: string) {
        super(platform, requestManager, clientInfo, deviceInfo, country);
        this._baseUrl = 'https://sdk-diagnostics.prd.mz.internal.unity.cn/';
    }
}
