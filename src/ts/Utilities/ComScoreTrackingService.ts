import { NativeBridge } from 'Native/NativeBridge';
import { Platform } from 'Constants/Platform';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { DeviceInfo } from 'Models/DeviceInfo';
import { Url } from 'Utilities/Url';
import { hex_sha1 } from 'Utilities/sha1';

export class ComScoreTrackingService {

    private _nativeBridge: NativeBridge;
    private _thirdPartyEventManager: ThirdPartyEventManager;
    private _deviceInfo: DeviceInfo;
    private _adBreakIdentifier: number;
    private _tagCounter: number;
    private _adCounter: number;

    constructor(thirdPartyEventManager: ThirdPartyEventManager, nativeBridge: NativeBridge, deviceInfo: DeviceInfo) {
        this._thirdPartyEventManager = thirdPartyEventManager;
        this._nativeBridge = nativeBridge;
        this._deviceInfo = deviceInfo;
        this._adBreakIdentifier = Date.now();
        this._tagCounter = 1;
        this._adCounter = 1;
    }

    public sendEvent(eventName: string, sessionId: string, duration: string, playedTime: number, creativeId: string | undefined, category: string | undefined, subCategory: string | undefined): void {
        const url = this.setEventUrl(eventName, duration, playedTime, creativeId, category, subCategory);
        this._thirdPartyEventManager.sendEvent(eventName, sessionId, url);
    }

    private setEventUrl(eventName: string, duration: string, playedTime: number, creativeId: string | undefined, category: string | undefined, subCategory: string | undefined): string {
        const deviceInfo = this._deviceInfo;
        const deviceModel = deviceInfo.getModel();
        const adBreakId = this._adBreakIdentifier;
        const tagUrlCounter = this._tagCounter;
        const adCounter = this._tagCounter;

        let platform: string = 'unknown';
        let advertisingTrackingId: string = 'none';

        if(!this._deviceInfo.getLimitAdTracking()) {
            if (this._deviceInfo.getAdvertisingIdentifier()) {
                const idfn = <string>this._deviceInfo.getAdvertisingIdentifier();
                advertisingTrackingId = hex_sha1(idfn);
            }
        }

        if (this._nativeBridge.getPlatform() === Platform.IOS) {
            platform = 'ios';
        } else if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
            platform = 'android';
        }

        if (typeof category === 'undefined') {
            category = '*null';
        }

        if (typeof creativeId === 'undefined') {
            creativeId = '0';
        }

        if (typeof subCategory === 'undefined') {
            subCategory = '';
        }

        const queryParamsDict = {
            // Constants
            c1: <string> '19',
            c2: <string> '23027898',  // Unity client ID.
            ns_type: <string> 'hidden',
            ns_st_ct: <string> 'va00',
            ns_ap_sv: <string> '2.1602.11',
            ns_st_it: <string> 'a',
            ns_st_sv: <string> '4.0.0',
            ns_st_ad: <string> '1',
            ns_st_sq: <string> '1',

            c12: <string> `${advertisingTrackingId}`,
            ns_ap_pn: <string> `${platform}`,
            ns_ap_device: <string> `${deviceModel}`,
            ns_st_id: <string> `${adBreakId}`,
            ns_st_ec: <string> `${tagUrlCounter}`,
            ns_st_ev: <string> `${eventName}`,
            ns_st_cn: <string> `${adCounter}`,
            ns_st_ci: <string> `${creativeId}`,
            ns_st_cl: <string> `${duration}`,
            ns_st_pt: <string> `${playedTime}`,
            c3: <string> `${category}`,
            ns_st_ge: <string> `${subCategory}`,
            ns_ts: <string> `${Date.now()}`
        };

        return Url.addParameters('https://sb.scorecardresearch.com/p', queryParamsDict);
    }
}
