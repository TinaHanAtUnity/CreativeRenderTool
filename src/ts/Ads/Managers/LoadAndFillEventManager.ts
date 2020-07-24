import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { Campaign } from 'Ads/Models/Campaign';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { INativeResponse, RequestManager } from 'Core/Managers/RequestManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { FrameworkMetaData } from 'Core/Models/MetaData/FrameworkMetaData';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import { PrivacySDK } from 'Privacy/PrivacySDK';

enum LoadAndFillEventMacro {
    ZONE = '%ZONE%',
    SDK_VERSION = '%SDK_VERSION%',
    EVENT_TYPE = '%EVENT_TYPE%',
    TOKEN = '%TOKEN%',
    AB_GROUP = '%AB_GROUP%',
    GAME_ID = '%GAME_ID%',
    AD_UNIT_ID = '%AD_UNIT_ID%',
    COPPA = '%COPPA%',
    OPTOUT_ENABLED = '%OPTOUT_ENABLED%',
    FRAMEWORK_NAME = '%FRAMEWORK_NAME%',
    FRAMEWORK_VERSION = '%FRAMEWORK_VERSION%',
    PLATFORM = '%PLATFORM%',
    CAMPAIGN_ID = '%CAMPAIGN_ID%'
}

export class LoadAndFillEventManager extends ThirdPartyEventManager {
    private static AndroidCampaignId = '005472656d6f7220416e6472';
    private static IOSCampaignId = '00005472656d6f7220694f53';
    private static LoadEventName = 'load';
    private static FillEventName = 'fill';

    private static TemplateUrl = 'operative/%ZONE%?eventType=%EVENT_TYPE%&token=%TOKEN%&abGroup=%AB_GROUP%&gameId=%GAME_ID%&campaignId=%CAMPAIGN_ID%&adUnitId=%AD_UNIT_ID%&coppa=%COPPA%&optOutEnabled=%OPTOUT_ENABLED%&frameworkName=%FRAMEWORK_NAME%&frameworkVersion=%FRAMEWORK_VERSION%&platform=%PLATFORM%&sdkVersion=%SDK_VERSION%';
    private _url: string = 'https://tracking.prd.mz.internal.unity3d.com/' + LoadAndFillEventManager.TemplateUrl;

    private _privacy: PrivacySDK;
    private _adsConfig: AdsConfiguration;
    private _platform: Platform;

    constructor(core: ICoreApi, request: RequestManager, platform: Platform, clientInfo: ClientInfo, coreConfig: CoreConfiguration, storageBridge: StorageBridge, privacy: PrivacySDK, adsConfig: AdsConfiguration, framework: FrameworkMetaData | undefined) {
        super(core, request, {
            [LoadAndFillEventMacro.TOKEN]: coreConfig.getToken(),
            [LoadAndFillEventMacro.GAME_ID]: clientInfo.getGameId(),
            [LoadAndFillEventMacro.COPPA]: `${coreConfig.isCoppaCompliant()}`,
            [LoadAndFillEventMacro.FRAMEWORK_NAME]: (framework && framework.getName()) ? framework.getName()! : '',
            [LoadAndFillEventMacro.FRAMEWORK_VERSION]: (framework && framework.getVersion()) ? framework.getVersion()! : '',
            [LoadAndFillEventMacro.PLATFORM]: Platform[platform],
            [LoadAndFillEventMacro.SDK_VERSION]: `${clientInfo.getSdkVersion()}`,
            [LoadAndFillEventMacro.AB_GROUP]: `${coreConfig.getAbGroup()}`
        }, storageBridge);

        this._platform = platform;
        this._privacy = privacy;
        this._adsConfig = adsConfig;
    }

    public sendLoadTrackingEvents(placementId: string, useWebViewUserAgentForTracking?: boolean, headers?: [string, string][]): Promise<INativeResponse> {
        const placement = this._adsConfig.getPlacement(placementId);
        const adUnitId = placement ? placement.getAdUnitId() : undefined;

        return this.sendWithGet(LoadAndFillEventManager.LoadEventName, '', this._url, useWebViewUserAgentForTracking, headers, {
            [LoadAndFillEventMacro.ZONE]: placementId,
            [LoadAndFillEventMacro.EVENT_TYPE]: LoadAndFillEventManager.LoadEventName,
            [LoadAndFillEventMacro.AD_UNIT_ID]: adUnitId ? adUnitId : '',
            [LoadAndFillEventMacro.OPTOUT_ENABLED]: `${this._privacy.isOptOutEnabled()}`,
            [LoadAndFillEventMacro.CAMPAIGN_ID]: this._platform === Platform.ANDROID ? LoadAndFillEventManager.AndroidCampaignId : LoadAndFillEventManager.IOSCampaignId
        });
    }

    public sendFillTrackingEvents(placementId: string, campaign: Campaign, useWebViewUserAgentForTracking?: boolean, headers?: [string, string][]): Promise<INativeResponse> {
        const placement = this._adsConfig.getPlacement(placementId);
        const adUnitId = placement ? placement.getAdUnitId() : undefined;

        return this.sendWithGet(LoadAndFillEventManager.FillEventName, '', this._url, useWebViewUserAgentForTracking, headers, {
            [LoadAndFillEventMacro.ZONE]: placementId,
            [LoadAndFillEventMacro.EVENT_TYPE]: LoadAndFillEventManager.FillEventName,
            [LoadAndFillEventMacro.AD_UNIT_ID]: adUnitId ? adUnitId : '',
            [LoadAndFillEventMacro.CAMPAIGN_ID]: campaign.getId(),
            [LoadAndFillEventMacro.OPTOUT_ENABLED]: `${this._privacy.isOptOutEnabled()}`
        });
    }
}
