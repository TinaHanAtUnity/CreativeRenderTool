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

export class MopubCampaignRefreshManager extends CampaignRefreshManager {
    constructor(platform: Platform, core: ICoreApi, coreConfig: CoreConfiguration, ads: IAdsApi, wakeUpManager: WakeUpManager, campaignManager: CampaignManager, adsConfig: AdsConfiguration, focusManager: FocusManager, sessionManager: SessionManager, clientInfo: ClientInfo, request: RequestManager, cache: CacheManager, metaDataManager: MetaDataManager) {
        super(platform, core, coreConfig, ads, wakeUpManager, campaignManager, adsConfig, focusManager, sessionManager, clientInfo, request, cache);
        metaDataManager.fetch(MediationMetaData).then((mediation) => {
            if (mediation) {
                const mediationName = mediation.getName();
                const mediationAdapterVersion = mediation.getAdapterVersion();
                if (mediationName === 'MoPub' && mediationAdapterVersion === '3.3.0.1') {
                    ads.LoadApi.onLoad.subscribe((placements: {[key: string]: number}) => {
                        Object.keys(placements).forEach((placementId) => {
                            const count = placements[placementId];
                            this.loadPlacement(placementId, count);
                        });
                    });
                }
            }
        });
    }

    private loadPlacement(placementId: string, count: number) {
        const placement = this._adsConfig.getPlacement(placementId);
        const currentState = placement.getState();
        this.setPlacementState(placementId, PlacementState.WAITING);
        this.sendPlacementStateChanges(placementId);
        switch (currentState) {
            case PlacementState.READY:
                this.setPlacementState(placementId, PlacementState.READY);
                this.sendPlacementStateChanges(placementId);
                break;
            case PlacementState.NO_FILL:
                this.setPlacementState(placementId, PlacementState.NO_FILL);
                this.sendPlacementStateChanges(placementId);
                break;
            case PlacementState.NOT_AVAILABLE:
                this.setPlacementState(placementId, PlacementState.NOT_AVAILABLE);
                this.sendPlacementStateChanges(placementId);
                break;
            default:
        }
    }

}
