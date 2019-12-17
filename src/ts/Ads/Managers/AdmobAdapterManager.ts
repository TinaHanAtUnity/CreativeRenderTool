import { CampaignRefreshManager } from 'Ads/Managers/CampaignRefreshManager';
import { IAdsApi } from 'Ads/IAds';
import { CampaignManager } from 'Ads/Managers/CampaignManager';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { PlacementState } from 'Ads/Models/Placement';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { CacheManager } from 'Core/Managers/CacheManager';
import { FocusManager } from 'Core/Managers/FocusManager';
import { RequestManager } from 'Core/Managers/RequestManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { MediationMetaData } from 'Core/Models/MetaData/MediationMetaData';
import { PerPlacementLoadAdapter } from 'Ads/Managers/PerPlacementLoadAdapter';
import { UnityAdsError } from 'Core/Constants/UnityAdsError';

export class AdmobAdapterManager  {
    private _ads: IAdsApi;

    constructor(ads: IAdsApi) {
        this._ads = ads;
        this._ads.Listener.onPlacementStateChangeToNofill.subscribe((placementId) => {
            this.sendNoFill(placementId);
        });
    }

    private sendNoFill(placementId: string) {
        this._ads.Listener.sendErrorEvent(UnityAdsError[UnityAdsError.INTERNAL_ERROR], placementId);
    }
}
