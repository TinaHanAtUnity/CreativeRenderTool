import { Request, INativeResponse } from 'Utilities/Request';
import { Platform } from 'Constants/Platform';
import { ClientInfo } from 'Models/ClientInfo';
import { DeviceInfo } from 'Models/DeviceInfo';

export enum ProgrammaticTrackingError {
    TooLargeFile = 'too_large_file'
}

export interface IProgrammaticTrackingErrorData {
    event: ProgrammaticTrackingError;
    platform: string;
    osVersion: string;
    sdkVersion: string;
    adType: string;
}

export class ProgrammaticTrackingService {
    private static productionErrorServiceUrl: string = 'https://tracking.adsx.unityads.unity3d.com/tracking/error';

    private request: Request;
    private clientInfo: ClientInfo;
    private deviceInfo: DeviceInfo;

    constructor(request: Request, clientInfo: ClientInfo,  deviceInfo: DeviceInfo) {
        this.request = request;
        this.clientInfo = clientInfo;
        this.deviceInfo = deviceInfo;
    }

    public reportError(errorData: IProgrammaticTrackingErrorData): Promise<INativeResponse> {
        const url: string = ProgrammaticTrackingService.productionErrorServiceUrl;
        const data: string = JSON.stringify(errorData);
        const headers: Array<[string, string]> = [];

        headers.push(['Content-Type', 'application/json']);

        return this.request.post(url, data, headers);
    }

    public buildErrorData(error: ProgrammaticTrackingError, adType: string): IProgrammaticTrackingErrorData {
        const platform: Platform = this.clientInfo.getPlatform();
        const osVersion: string = this.deviceInfo.getOsVersion();
        const sdkVersion: string = this.clientInfo.getSdkVersionName();
        const data: IProgrammaticTrackingErrorData = {
            event: error,
            platform: Platform[platform],
            osVersion: osVersion,
            sdkVersion: sdkVersion,
            adType: adType
        };
        return data;
    }

}
