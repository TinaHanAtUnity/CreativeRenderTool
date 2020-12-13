import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Platform } from 'Core/Constants/Platform';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
var LoadAndFillEventMacro;
(function (LoadAndFillEventMacro) {
    LoadAndFillEventMacro["ZONE"] = "%ZONE%";
    LoadAndFillEventMacro["SDK_VERSION"] = "%SDK_VERSION%";
    LoadAndFillEventMacro["EVENT_TYPE"] = "%EVENT_TYPE%";
    LoadAndFillEventMacro["TOKEN"] = "%TOKEN%";
    LoadAndFillEventMacro["AB_GROUP"] = "%AB_GROUP%";
    LoadAndFillEventMacro["GAME_ID"] = "%GAME_ID%";
    LoadAndFillEventMacro["AD_UNIT_ID"] = "%AD_UNIT_ID%";
    LoadAndFillEventMacro["COPPA"] = "%COPPA%";
    LoadAndFillEventMacro["OPTOUT_ENABLED"] = "%OPTOUT_ENABLED%";
    LoadAndFillEventMacro["FRAMEWORK_NAME"] = "%FRAMEWORK_NAME%";
    LoadAndFillEventMacro["FRAMEWORK_VERSION"] = "%FRAMEWORK_VERSION%";
    LoadAndFillEventMacro["PLATFORM"] = "%PLATFORM%";
    LoadAndFillEventMacro["CAMPAIGN_ID"] = "%CAMPAIGN_ID%";
})(LoadAndFillEventMacro || (LoadAndFillEventMacro = {}));
export class LoadAndFillEventManager extends ThirdPartyEventManager {
    constructor(core, request, platform, clientInfo, coreConfig, storageBridge, privacy, adsConfig, framework) {
        super(core, request, {
            [LoadAndFillEventMacro.TOKEN]: coreConfig.getToken(),
            [LoadAndFillEventMacro.GAME_ID]: clientInfo.getGameId(),
            [LoadAndFillEventMacro.COPPA]: `${coreConfig.isCoppaCompliant()}`,
            [LoadAndFillEventMacro.FRAMEWORK_NAME]: (framework && framework.getName()) ? framework.getName() : '',
            [LoadAndFillEventMacro.FRAMEWORK_VERSION]: (framework && framework.getVersion()) ? framework.getVersion() : '',
            [LoadAndFillEventMacro.PLATFORM]: Platform[platform],
            [LoadAndFillEventMacro.SDK_VERSION]: `${clientInfo.getSdkVersion()}`,
            [LoadAndFillEventMacro.AB_GROUP]: `${coreConfig.getAbGroup()}`
        }, storageBridge);
        this._url = 'https://tracking.prd.mz.internal.unity3d.com/' + LoadAndFillEventManager.TemplateUrl;
        this._platform = platform;
        this._privacy = privacy;
        this._adsConfig = adsConfig;
    }
    sendLoadTrackingEvents(placementId, useWebViewUserAgentForTracking, headers) {
        if (!CustomFeatures.shouldSendLoadFillEvent()) {
            return Promise.resolve({});
        }
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
    sendFillTrackingEvents(placementId, campaign, useWebViewUserAgentForTracking, headers) {
        if (!CustomFeatures.shouldSendLoadFillEvent()) {
            return Promise.resolve({});
        }
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
LoadAndFillEventManager.AndroidCampaignId = '005472656d6f7220416e6472';
LoadAndFillEventManager.IOSCampaignId = '00005472656d6f7220694f53';
LoadAndFillEventManager.LoadEventName = 'load';
LoadAndFillEventManager.FillEventName = 'fill';
LoadAndFillEventManager.TemplateUrl = 'operative/%ZONE%?eventType=%EVENT_TYPE%&token=%TOKEN%&abGroup=%AB_GROUP%&gameId=%GAME_ID%&campaignId=%CAMPAIGN_ID%&adUnitId=%AD_UNIT_ID%&coppa=%COPPA%&optOutEnabled=%OPTOUT_ENABLED%&frameworkName=%FRAMEWORK_NAME%&frameworkVersion=%FRAMEWORK_VERSION%&platform=%PLATFORM%&sdkVersion=%SDK_VERSION%';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTG9hZEFuZEZpbGxFdmVudE1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL01hbmFnZXJzL0xvYWRBbmRGaWxsRXZlbnRNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBRzdFLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQVFuRCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFFOUQsSUFBSyxxQkFjSjtBQWRELFdBQUsscUJBQXFCO0lBQ3RCLHdDQUFlLENBQUE7SUFDZixzREFBNkIsQ0FBQTtJQUM3QixvREFBMkIsQ0FBQTtJQUMzQiwwQ0FBaUIsQ0FBQTtJQUNqQixnREFBdUIsQ0FBQTtJQUN2Qiw4Q0FBcUIsQ0FBQTtJQUNyQixvREFBMkIsQ0FBQTtJQUMzQiwwQ0FBaUIsQ0FBQTtJQUNqQiw0REFBbUMsQ0FBQTtJQUNuQyw0REFBbUMsQ0FBQTtJQUNuQyxrRUFBeUMsQ0FBQTtJQUN6QyxnREFBdUIsQ0FBQTtJQUN2QixzREFBNkIsQ0FBQTtBQUNqQyxDQUFDLEVBZEkscUJBQXFCLEtBQXJCLHFCQUFxQixRQWN6QjtBQUVELE1BQU0sT0FBTyx1QkFBd0IsU0FBUSxzQkFBc0I7SUFhL0QsWUFBWSxJQUFjLEVBQUUsT0FBdUIsRUFBRSxRQUFrQixFQUFFLFVBQXNCLEVBQUUsVUFBNkIsRUFBRSxhQUE0QixFQUFFLE9BQW1CLEVBQUUsU0FBMkIsRUFBRSxTQUF3QztRQUNwUCxLQUFLLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRTtZQUNqQixDQUFDLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxFQUFFLFVBQVUsQ0FBQyxRQUFRLEVBQUU7WUFDcEQsQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsRUFBRSxVQUFVLENBQUMsU0FBUyxFQUFFO1lBQ3ZELENB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