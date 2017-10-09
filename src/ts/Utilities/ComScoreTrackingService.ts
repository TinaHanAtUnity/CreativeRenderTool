import { NativeBridge } from 'Native/NativeBridge';
import { Platform } from 'Constants/Platform';
import { ThirdPartyEventManager } from "Managers/ThirdPartyEventManager";
import { DeviceInfo } from "Models/DeviceInfo";
import sha1 from 'sha1';

export class ComScoreTrackingService {

    private _nativeBridge: NativeBridge;
    private _thirdPartyEventManager: ThirdPartyEventManager;
    private _deviceInfo: DeviceInfo;

    constructor(thirdPartyEventManager: ThirdPartyEventManager, nativeBridge: NativeBridge, deviceInfo: DeviceInfo) {
        this._thirdPartyEventManager = thirdPartyEventManager;
        this._nativeBridge = nativeBridge;
        this._deviceInfo = deviceInfo;
    }

    public sendEvent(eventName: string, sessionId: string, duration: string, playedTime: number): void {
        const url = this.setEventUrl(eventName, duration, playedTime);
        this._thirdPartyEventManager.sendEvent(eventName, sessionId, url);
    }

    private setEventUrl(eventName: string, duration: string, playedTime: number): string {
        const deviceInfo = this._deviceInfo;
        const deviceModel = deviceInfo.getModel();

        let platform: string = 'unknown';
        let advertisingTrackingId: string = 'none';

        if(this._deviceInfo.getAdvertisingIdentifier() && !this._deviceInfo.getLimitAdTracking()) {
            if (this._deviceInfo.getAdvertisingIdentifier()) {
                advertisingTrackingId = sha1(this._deviceInfo.getAdvertisingIdentifier());
            }
        }

        if (this._nativeBridge.getPlatform() === Platform.IOS) {
            platform = 'ios';
        } else if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
            platform = 'android';
        }

        const queryParamsDict = {
            // Constants
            c1: <string> '19',
            c2: <string> '23027898',  // Unity client ID.
            ns_type: <string> 'hidden',
            ns_st_ct: <string> 'va00',
            ns_ap_sv: <string> '2.1601.11',
            ns_st_it: <string> 'a',
            ns_st_sv: <string> '4.0.0',
            ns_st_ad: <string> '1',
            ns_st_sq: <string> '1',

            c12: <string> `${advertisingTrackingId}`,
            ns_ap_pn: <string> `${platform}`,
            ns_ap_device: <string> `${deviceModel}`,
            ns_st_ev: <string> `${eventName}`,
            ns_st_cl: <string> `${duration}`,
            ns_st_pt: <string> `${playedTime}`,
            rn: <string> `${Date.now()}`
        };

        return this.appendQueryParams('https://sb.scorecardresearch.com/p', queryParamsDict);
    }

    private appendQueryParams(front: string, queryParams: object): string {
        const back = Object.keys(queryParams).map(key => {
            return `${key}=${encodeURIComponent(queryParams[key])}`;
        }).join('&');

        return `${front}?${back}`;
    }
}
