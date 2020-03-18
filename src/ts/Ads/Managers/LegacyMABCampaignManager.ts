import { ICore } from 'Core/ICore';
import { LegacyCampaignManager } from 'Ads/Managers/LegacyCampaignManager';
import { AdMobSignalFactory } from 'AdMob/Utilities/AdMobSignalFactory';
import { AssetManager } from 'Ads/Managers/AssetManager';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { Platform } from 'Core/Constants/Platform';
import { CacheBookkeepingManager } from 'Core/Managers/CacheBookkeepingManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { RequestManager } from 'Core/Managers/RequestManager';
import { ContentTypeHandlerManager } from 'Ads/Managers/ContentTypeHandlerManager';
import { PrivacySDK } from 'Privacy/PrivacySDK';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { MediationLoadTrackingManager } from 'Ads/Managers/MediationLoadTrackingManager';
import { AutomatedExperimentManager } from 'Ads/Managers/AutomatedExperimentManager';

export class LegacyMABCampaignManager extends LegacyCampaignManager {

    constructor(aem: AutomatedExperimentManager,
        platform: Platform,
        core: ICore,
        coreConfig: CoreConfiguration,
        adsConfig: AdsConfiguration,
        assetManager: AssetManager,
        sessionManager: SessionManager,
        adMobSignalFactory: AdMobSignalFactory,
        request: RequestManager,
        clientInfo: ClientInfo,
        deviceInfo: DeviceInfo,
        metaDataManager: MetaDataManager,
        cacheBookkeeping: CacheBookkeepingManager,
        contentTypeHandlerManager: ContentTypeHandlerManager,
        privacySDK: PrivacySDK,
        userPrivacyManager: UserPrivacyManager,
        mediationLoadTracking?: MediationLoadTrackingManager | undefined) {

        super(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, privacySDK, userPrivacyManager, mediationLoadTracking);

        aem.listenOnCampaigns(this.onCampaign);
    }

}
