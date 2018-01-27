import { NativeBridge } from 'Native/NativeBridge';
import { Campaign } from 'Models/Campaign';
import { Platform } from 'Constants/Platform';
import { MOAT } from 'Views/MOAT';
import { ClientInfo } from 'Models/ClientInfo';
import { Placement } from 'Models/Placement';
import { DeviceInfo } from 'Models/DeviceInfo';
import { Configuration } from 'Models/Configuration';

export interface IMoatIds {
    level1: number | undefined;
    level2: string | undefined;
    level3: string | undefined;
    level4: string | undefined;
    slicer1: string;
    slicer2: string;
    slicer3: string;
}

export interface IMoatData {
    SDK: string;
    Version: string;
    SDKVersion: string;
    IFA: string | undefined | null;
    LimitAdTracking: boolean | undefined;
    COPPA: boolean;
    bundle: string;

}

export class MoatViewabilityService {

    public static initMoat(nativeBridge: NativeBridge, campaign: Campaign, clientInfo: ClientInfo, placement: Placement, deviceInfo: DeviceInfo, configuration: Configuration) {
        this._moat = new MOAT(nativeBridge);
        this._moat.render();
        this._moat.addMessageListener();
        document.body.appendChild(this._moat.container());

        this._moatIds = {
            level1: campaign.getSeatId(),
            level2: campaign.getBuyerId(),
            level3: campaign.getAdvertiserBundleId() ? campaign.getAdvertiserBundleId() : campaign.getAdvertiserDomain(),
            level4: campaign.getCreativeId(),
            slicer1: clientInfo.getSdkVersionName(),
            slicer2: clientInfo.getApplicationName(),
            slicer3: placement.getName()
        };

        this._moatData = {
            SDK: 'UnityAds',
            Version: '1.0',
            SDKVersion: clientInfo.getSdkVersionName(),
            IFA: deviceInfo.getAdvertisingIdentifier(),
            LimitAdTracking: deviceInfo.getLimitAdTracking(),
            COPPA: configuration.isCoppaCompliant(),
            bundle: clientInfo.getApplicationName()
        };
    }

    public static getMoat(): MOAT | undefined {
        return this._moat;
    }

    public static getMoatIds(): IMoatIds {
        return this._moatIds;
    }

    public static getMoatData(): IMoatData {
        return this._moatData;
    }

    private static _moat: MOAT;
    private static _moatIds: IMoatIds;
    private static _moatData: IMoatData;
}
