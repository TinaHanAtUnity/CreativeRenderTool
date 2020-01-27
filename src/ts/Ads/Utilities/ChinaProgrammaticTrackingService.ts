import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { Platform } from 'Core/Constants/Platform';
import { RequestManager } from 'Core/Managers/RequestManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { DeviceInfo } from 'Core/Models/DeviceInfo';

export class ChinaProgrammaticTrackingService extends ProgrammaticTrackingService {
    public static initialize(platform: Platform, request: RequestManager, clientInfo: ClientInfo, deviceInfo: DeviceInfo, country: string): void {
        super.initialize(platform, request, clientInfo, deviceInfo, country);
        this._baseUrl = 'https://sdk-diagnostics.prd.mz.internal.unity.cn/';
    }
}
