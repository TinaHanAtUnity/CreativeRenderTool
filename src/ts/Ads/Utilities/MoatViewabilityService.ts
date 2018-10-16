import { Campaign } from 'Ads/Models/Campaign';
import { Placement } from 'Ads/Models/Placement';
import { MOAT } from 'Ads/Views/MOAT';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { VPAIDCampaign } from 'VPAID/Models/VPAIDCampaign';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';

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
    LimitAdTracking: boolean | undefined;
    COPPA: boolean;
    bundle: string;
}

export class MoatViewabilityService {

    public static initMoat(platform: Platform, core: ICoreApi, campaign: Campaign, clientInfo: ClientInfo, placement: Placement, deviceInfo: DeviceInfo, configuration: CoreConfiguration) {
        this._moat = new MOAT(platform, core);
        this._moat.render();
        this._moat.addMessageListener();
        document.body.appendChild(this._moat.container());

        if (campaign instanceof VastCampaign || campaign instanceof VPAIDCampaign) {
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
                Version: '1.1',
                SDKVersion: clientInfo.getSdkVersionName(),
                LimitAdTracking: deviceInfo.getLimitAdTracking(),
                COPPA: configuration.isCoppaCompliant(),
                bundle: clientInfo.getApplicationName()
            };
        }
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
