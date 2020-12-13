import { ThirdPartyEventMacro } from 'Ads/Managers/ThirdPartyEventManager';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { Privacy } from 'Ads/Views/Privacy';
import { PrivacyEventHandler } from 'Ads/EventHandlers/PrivacyEventHandler';
import { CampaignAssetInfo } from 'Ads/Utilities/CampaignAssetInfo';
import { WebViewError } from 'Core/Errors/WebViewError';
import { PrivacySettings } from 'Ads/Views/Privacy/PrivacySettings';
import { PrivacyMethod } from 'Privacy/Privacy';
import { OMID_P } from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';
import { PrivacyTestEnvironment } from 'Privacy/PrivacyTestEnvironment';
import { TestEnvironment } from 'Core/Utilities/TestEnvironment';
export class AbstractAdUnitParametersFactory {
    constructor(core, ads) {
        this._platform = core.NativeBridge.getPlatform();
        this._core = core.Api;
        this._ads = ads.Api;
        this._store = ads.Store.Api;
        this._focusManager = core.FocusManager;
        this._container = ads.Container;
        this._deviceInfo = core.DeviceInfo;
        this._clientInfo = core.ClientInfo;
        this._requestManager = core.RequestManager;
        this._metadataManager = core.MetaDataManager;
        this._adsConfig = ads.Config;
        this._coreConfig = core.Config;
        this._sessionManager = ads.SessionManager;
        this._privacyManager = ads.PrivacyManager;
        this._thirdPartyEventManagerFactory = ads.ThirdPartyEventManagerFactory;
        this._storageBridge = core.StorageBridge;
        this._osVersion = core.DeviceInfo.getOsVersion();
        this._privacySDK = ads.PrivacySDK;
    }
    create(campaign, placement, orientation, playerMetadataServerId, options, loadV5Support) {
        this._campaign = campaign;
        this._placement = placement;
        this._orientation = orientation;
        this._options = options;
        this._playerMetadataServerId = playerMetadataServerId;
        this._loadV5Support = loadV5Support;
        this._adUnitId = placement.getAdUnitId() || '';
        const defaultParams = this.getBaseParameters();
        return this.createParameters(defaultParams);
    }
    getBaseParameters() {
        return {
            platform: this._platform,
            core: this._core,
            ads: this._ads,
            store: this._store,
            forceOrientation: this._orientation,
            focusManager: this._focusManager,
            container: this._container,
            deviceInfo: this._deviceInfo,
            clientInfo: this._clientInfo,
            thirdPartyEventManager: this._thirdPartyEventManagerFactory.create({
                [ThirdPartyEventMacro.ZONE]: this._placement.getId(),
                [ThirdPartyEventMacro.SDK_VERSION]: this._clientInfo.getSdkVersion().toString(),
                [ThirdPartyEventMacro.GAMER_SID]: this._playerMetadataServerId || '',
                [ThirdPartyEventMacro.OM_ENABLED]: 'false',
                [ThirdPartyEventMacro.OM_VENDORS]: '',
                [ThirdPartyEventMacro.OMIDPARTNER]: OMID_P,
                [ThirdPartyEventMacro.CACHEBUSTING]: '-1',
                [ThirdPartyEventMacro.AD_UNIT_ID_IMPRESSION]: this._adUnitId,
                [ThirdPartyEventMacro.AD_UNIT_ID_OPERATIVE]: this._adUnitId
            }),
            operativeEventManager: this.getOperativeEventManager(),
            placement: this._placement,
            campaign: this._campaign,
            coreConfig: this._coreConfig,
            adsConfig: this._adsConfig,
            request: this._requestManager,
            privacyManager: this._privacyManager,
            gameSessionId: this._sessionManager.getGameSessionId(),
            options: this._options,
            privacy: this.createPrivacy(),
            privacySDK: this._privacySDK
        };
    }
    getOperativeEventManager() {
        return OperativeEventManagerFactory.createOperativeEventManager({
            platform: this._platform,
            core: this._core,
            ads: this._ads,
            request: this._requestManager,
            metaDataManager: this._metadataManager,
            sessionManager: this._sessionManager,
            clientInfo: this._clientInfo,
            deviceInfo: this._deviceInfo,
            coreConfig: this._coreConfig,
            adsConfig: this._adsConfig,
            storageBridge: this._storageBridge,
            campaign: this._campaign,
            playerMetadataServerId: this._playerMetadataServerId,
            privacySDK: this._privacySDK,
            userPrivacyManager: this._privacyManager,
            loadV5Support: this._loadV5Support
        });
    }
    createPrivacy() {
        let privacy;
        if (this._coreConfig.isCoppaCompliant() || this._privacyManager.isUserUnderAgeLimit()) {
            privacy = new Privacy(this._platform, this._campaign, this._privacyManager, this._privacySDK.isGDPREnabled(), this._coreConfig.isCoppaCompliant(), this._deviceInfo.getLanguage());
        }
        else if (this._privacySDK.getGamePrivacy().getMethod() === PrivacyMethod.UNITY_CONSENT) {
            privacy = new PrivacySettings(this._platform, this._campaign, this._privacyManager, this._privacySDK.isGDPREnabled(), this._coreConfig.isCoppaCompliant(), this._deviceInfo.getLanguage());
        }
        else {
            privacy = new Privacy(this._platform, this._campaign, this._privacyManager, this._privacySDK.isGDPREnabled(), this._coreConfig.isCoppaCompliant(), this._deviceInfo.getLanguage());
        }
        const privacyEventHandlerParameters = {
            platform: this._platform,
            core: this._core,
            privacyManager: this._privacyManager,
            adsConfig: this._adsConfig,
            privacySDK: this._privacySDK
        };
        const privacyEventHandler = new PrivacyEventHandler(privacyEventHandlerParameters);
        privacy.addEventHandler(privacyEventHandler);
        return privacy;
    }
    showGDPRBanner(parameters) {
        if (PrivacyTestEnvironment.isSet('showGDPRBanner')) {
            return PrivacyTestEnvironment.get('showGDPRBanner');
        }
        // Temporary measure to enable previewing GDPR banner in external test app.
        // Should be removed once a better solution is in place.
        if (TestEnvironment.get('forcedGDPRBanner') !== undefined) {
            return TestEnvironment.get('forcedGDPRBanner');
        }
        if (parameters.coreConfig.isCoppaCompliant()) {
            return false;
        }
        if (PrivacyMethod.LEGITIMATE_INTEREST !== parameters.privacySDK.getGamePrivacy().getMethod()) {
            return false;
        }
        return parameters.privacySDK.isGDPREnabled() ? !parameters.privacySDK.isOptOutRecorded() : false;
    }
    getVideo(campaign, forceOrientation) {
        const video = CampaignAssetInfo.getOrientedVideo(campaign, forceOrientation);
        if (!video) {
            throw new WebViewError('Unable to select an oriented video');
        }
        return video;
    }
    createEndScreenParameters(privacy, targetGameName, parameters) {
        const showGDPRBanner = this.showGDPRBanner(parameters);
        return {
            platform: parameters.platform,
            core: parameters.core,
            language: parameters.deviceInfo.getLanguage(),
            gameId: parameters.clientInfo.getGameId(),
            targetGameName: targetGameName,
            abGroup: parameters.coreConfig.getAbGroup(),
            privacy: privacy,
            showGDPRBanner: showGDPRBanner,
            adUnitStyle: undefined,
            campaignId: undefined,
            osVersion: undefined,
            hidePrivacy: parameters.adsConfig.getHidePrivacy()
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRVbml0UGFyYW1ldGVyc0ZhY3RvcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL0FkVW5pdHMvQWRVbml0UGFyYW1ldGVyc0ZhY3RvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBVUEsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFJM0UsT0FBTyxFQUFFLDRCQUE0QixFQUFFLE1BQU0sMkNBQTJDLENBQUM7QUFPekYsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQzVDLE9BQU8sRUFBa0MsbUJBQW1CLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUU1RyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUNwRSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFHeEQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBQ3BFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUdoRCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sb0RBQW9ELENBQUM7QUFDNUUsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDeEUsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBTWpFLE1BQU0sT0FBZ0IsK0JBQStCO0lBK0JqRCxZQUFZLElBQVcsRUFBRSxHQUFTO1FBQzlCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNqRCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7UUFDdEIsSUFBSSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDO1FBQ3BCLElBQUksQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFH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