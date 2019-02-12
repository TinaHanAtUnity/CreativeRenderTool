import { Platform } from 'Core/Constants/Platform';
import { INativeResponse, RequestManager } from 'Core/Managers/RequestManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { DeviceInfo } from 'Core/Models/DeviceInfo';

export enum ProgrammaticTrackingErrorName {
    TooLargeFile = 'too_large_file', // a file 20mb and over are considered too large
    BannerRequestError = 'banner_request_error',

    AuctionV4StartMissing = 'auction_v4_missing_start',
    AuctionV5StartMissing = 'auction_v5_missing_start',

    AdmobTestHttpError = 'admob_video_http_error'
}

export enum ProgrammaticTrackingMetricName {
    AdmobUsedCachedVideo = 'admob_used_cached_video',
    AdmobUsedStreamedVideo = 'admob_used_streamed_video',
    AdmobUserVideoSeeked = 'admob_user_video_seeked',

    BannerAdRequest = 'banner_ad_request',
    BannerAdImpression = 'banner_ad_impression'
}

export interface IProgrammaticTrackingData {
    metrics: IProgrammaticTrackingMetric[] | undefined;
}

interface IProgrammaticTrackingMetric {
    tags: string[];
}

export class ProgrammaticTrackingService {
    private static productionMetricServiceUrl: string = 'https://tracking.prd.mz.internal.unity3d.com/tracking/sdk/metric';

    private _platform: Platform;
    private _request: RequestManager;
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;

    constructor(platform: Platform, request: RequestManager, clientInfo: ClientInfo, deviceInfo: DeviceInfo) {
        this._platform = platform;
        this._request = request;
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
    }

    private createErrorTag(tagValue: string): string {
        return this.createAdsSdkTag('eevt', tagValue);
    }

    private createMetricTag(tagValue: string): string {
        return this.createAdsSdkTag('mevt', tagValue);
    }

    private createAdsSdkTag(suffix: string, tagValue: string): string {
        return `ads_sdk2_${suffix}:${tagValue}`;
    }

    public reportError(error: ProgrammaticTrackingErrorName, adType: string, seatId?: number | undefined): Promise<INativeResponse> {
        const platform: Platform = this._platform;
        const osVersion: string = this._deviceInfo.getOsVersion();
        const sdkVersion: string = this._clientInfo.getSdkVersionName();
        const metricData: IProgrammaticTrackingData = {
            metrics: [
                {
                    tags: [
                        this.createErrorTag(error),
                        this.createAdsSdkTag('plt', Platform[platform]),
                        this.createAdsSdkTag('osv', osVersion),
                        this.createAdsSdkTag('sdv', sdkVersion),
                        this.createAdsSdkTag('adt', adType),
                        this.createAdsSdkTag('sid', `${seatId}`)
                    ]
                }
            ]
        };
        const url: string = ProgrammaticTrackingService.productionMetricServiceUrl;
        const data: string = JSON.stringify(metricData);
        const headers: [string, string][] = [];

        headers.push(['Content-Type', 'application/json']);

        return this._request.post(url, data, headers);
    }

    public reportMetric(event: ProgrammaticTrackingMetricName): Promise<INativeResponse> {
        const metricData: IProgrammaticTrackingData = {
            metrics: [
                {
                    tags: [
                        this.createMetricTag(event)
                    ]
                }
            ]
        };
        const url: string = ProgrammaticTrackingService.productionMetricServiceUrl;
        const data: string = JSON.stringify(metricData);
        const headers: [string, string][] = [];

        headers.push(['Content-Type', 'application/json']);

        return this._request.post(url, data, headers);
    }

}
