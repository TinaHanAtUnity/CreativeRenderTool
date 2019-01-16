import { Platform } from 'Core/Constants/Platform';
import { INativeResponse, RequestManager } from 'Core/Managers/RequestManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { DeviceInfo } from 'Core/Models/DeviceInfo';

export enum ProgrammaticTrackingError {
    TooLargeFile = 'too_large_file', // a file 20mb and over are considered too large
    BannerRequestError = 'banner_request_error'
}

export enum ProgrammaticTrackingMetric {
    AdmobUsedCachedVideo = 'admob_used_cached_video',
    AdmobUsedStreamedVideo = 'admob_used_streamed_video',
    AdmobUserVideoSeeked = 'admob_user_video_seeked',

    BannerAdRequest = 'banner_ad_request',
    BannerAdImpression = 'banner_ad_impression'
}

export interface IProgrammaticTrackingErrorData {
    event: ProgrammaticTrackingError;
    platform: string;
    osVersion: string;
    sdkVersion: string;
    adType: string;
    seatId: number | undefined;
}

export interface IProgrammaticTrackingMetricData {
    event: ProgrammaticTrackingMetric;
}

export class ProgrammaticTrackingService {
    private static productionErrorServiceUrl: string = 'https://tracking.prd.mz.internal.unity3d.com/tracking/sdk/error';
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

    public reportMetric(event: ProgrammaticTrackingMetric): Promise<INativeResponse> {
        const url: string = ProgrammaticTrackingService.productionMetricServiceUrl;
        const data: string = JSON.stringify(<IProgrammaticTrackingMetricData>{
            event: event
        });
        const headers: [string, string][] = [];

        headers.push(['Content-Type', 'application/json']);

        return this._request.post(url, data, headers);
    }

    public reportError(error: ProgrammaticTrackingError, adType: string, seatId?: number | undefined): Promise<INativeResponse> {
        const errorData = this.buildErrorData(error, adType, seatId);
        const url: string = ProgrammaticTrackingService.productionErrorServiceUrl;
        const data: string = JSON.stringify(errorData);
        const headers: [string, string][] = [];

        headers.push(['Content-Type', 'application/json']);

        return this._request.post(url, data, headers);
    }

    private buildErrorData(error: ProgrammaticTrackingError, adType: string, seatId: number | undefined): IProgrammaticTrackingErrorData {
        const platform: Platform = this._platform;
        const osVersion: string = this._deviceInfo.getOsVersion();
        const sdkVersion: string = this._clientInfo.getSdkVersionName();
        return <IProgrammaticTrackingErrorData>{
            event: error,
            platform: Platform[platform],
            osVersion: osVersion,
            sdkVersion: sdkVersion,
            adType: adType,
            seatId: seatId
        };
    }

}
