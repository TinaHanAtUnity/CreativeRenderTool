import * as tslib_1 from "tslib";
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { CampaignAssetInfo } from 'Ads/Utilities/CampaignAssetInfo';
import { GameSessionCounters } from 'Ads/Utilities/GameSessionCounters';
import { BatteryStatus } from 'Core/Constants/Android/BatteryStatus';
import { RingerMode } from 'Core/Constants/Android/RingerMode';
import { Platform } from 'Core/Constants/Platform';
import { IosDeviceInfo } from 'Core/Models/IosDeviceInfo';
import { JsonParser } from 'Core/Utilities/JsonParser';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { SDKMetrics, AUIMetric } from 'Ads/Utilities/SDKMetrics';
import { MabReverseABTest } from 'Core/Models/ABGroup';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import { ARUtil } from 'AR/Utilities/ARUtil';
import { OptimizedCampaign } from 'MabExperimentation/Models/OptimizedCampaign';
import { CategorizedExperimentStage, CategorizedExperiment } from 'MabExperimentation/Models/CategorizedExperiment';
// What: Defines a filter that states for a given Campaign Type (MRAID, Performance, etc) a Category of experiments that are supported.
// Why: Since the AEM listens automaticaly on new compaigns it needs a way to be told for a given campaign type if should it make an optimzation
//      request. If so, what Experiment Catagory(ies) to ask for, as a campaign type can span multiple categories (say `Performance Ad EndCards` vs `Performance Ad Video`).
class AutomatedExperimentFilter {
}
// How to usage, call in order:
//  1. initialize()                             // Done by Ads
//  2. registerExperimentCategory()             // for each category of interest
//  3. (optional) getSelectedExperimentName()   // gets the name of the experiment choosen by AUi/Optmz
//  4. activeSelectedExperiment()               // Signals that experiment is underway -> awaiting an outcome
//  5. (Optional) rewardSelectedExperiment()    // when experiment result is found to be positive (this sends positive outcome back to AUI/Optmz)
//  6. endSelectedExperiment()                  // Once the experiment is over (success or not) (this sends negative outcome back to AUI/Optmz if no reward was sent)
export class AutomatedExperimentManager {
    constructor() {
        this._clickHeatMapData = [];
        this._experimentFilters = [];
    }
    static setForcedARMRAID(value) {
        this._forcedARMRAID = value;
    }
    static isAutomationAvailable(adsConfig, config) {
        return MabReverseABTest.isValid(config.getAbGroup()) || adsConfig.getHasArPlacement();
    }
    initialize(core, campaignSource) {
        this._requestManager = core.RequestManager;
        this._deviceInfo = core.DeviceInfo;
        this._privacySdk = core.Ads.PrivacySDK;
        this._clientInfo = core.ClientInfo;
        this._coreConfig = core.Config;
        this._nativeBridge = core.NativeBridge;
        this._abGroup = core.Config.getAbGroup();
        this._gameSessionID = core.Ads.SessionManager.getGameSessionId();
        this._gamerToken = core.Config.getToken();
        this._campaignSource = campaignSource;
        this._onCampaignListener = (placementID, campaign, trackingURL) => this.onNewCampaign(campaign);
        this._campaignSource.subscribe(this._onCampaignListener);
        this._staticFeaturesPromise = this.collectStaticContextualFeatures();
    }
    registerExperimentCategory(category, campaignType) {
        const filter = new AutomatedExperimentFilter();
        filter.CampaignType = campaignType;
        filter.Category = category;
        this._experimentFilters = this._experimentFilters.concat(filter);
    }
    getSelectedExperimentName(campaign, category) {
        if (!this.isOptimizationTarget(campaign, category)) {
            return '';
        }
        const categorizedExp = this._campaign.CategorizedExperiments[category];
        if (categorizedExp.Stage === CategorizedExperimentStage.AWAITING_OPTIMIZATION ||
            categorizedExp.Stage === CategorizedExperimentStage.ENDED) {
            return '';
        }
        return categorizedExp.Experiment.experiment_name;
    }
    activateSelectedExperiment(campaign, category) {
        if (!this.isOptimizationTarget(campaign, category)) {
            return undefined;
        }
        const categorizedExp = this._campaign.CategorizedExperiments[category];
        if (categorizedExp.Stage === CategorizedExperimentStage.RUNNING) {
            SDKMetrics.reportMetricEvent(AUIMetric.CampaignCategoryAlreadyActive);
            return undefined;
        }
        else if (categorizedExp.Stage !== CategorizedExperimentStage.OPTIMIZED) {
            return undefined;
        }
        categorizedExp.Stage = CategorizedExperimentStage.RUNNING;
        categorizedExp.Outcome = 0;
        return categorizedExp.aggregatedActions();
    }
    endSelectedExperiment(campaign, category) {
        if (!this.isOptimizationTarget(campaign, category)) {
            return Promise.resolve();
        }
        const categorizedExp = this._campaign.CategorizedExperiments[category];
        if (categorizedExp.Stage !== CategorizedExperimentStage.RUNNING) {
            return Promise.resolve();
        }
        return this.publishCampaignOutcomes(campaign, categorizedExp, CategorizedExperimentStage.ENDED);
    }
    rewardSelectedExperiment(campaign, category) {
        if (!this.isOptimizationTarget(campaign, category)) {
            return Promise.resolve();
        }
        const categorizedExp = this._campaign.CategorizedExperiments[category];
        if (categorizedExp.Stage !== CategorizedExperimentStage.RUNNING) {
            return Promise.resolve();
        }
        categorizedExp.Outcome = 1;
        return this.publishCampaignOutcomes(campaign, categorizedExp, CategorizedExperimentStage.OUTCOME_PUBLISHED);
    }
    publishCampaignOutcomes(campaign, categorizedExp, nextStage) {
        categorizedExp.Stage = nextStage;
        const experiments = [];
        for (const part of categorizedExp.Experiment.parts) {
            experiments.push({
                experiment: part.id,
                actions: part.actions,
                metadata: part.metadata
            });
        }
        const outcome = {
            user_info: {
                ab_group: this._abGroup,
                auction_id: campaign.getSession().getId(),
                game_session_id: this._gameSessionID,
                gamer_token: this._gamerToken
            },
            reward: categorizedExp.Outcome,
            experiments: experiments,
            click_coordinates: this._clickHeatMapData,
            experiment_call_latency_ms: this._experimentCallLatencyEnd - this._experimentCallLatencyStart
        };
        const url = AutomatedExperimentManager.BaseUrl + AutomatedExperimentManager.RewardEndPoint;
        const body = JSON.stringify(outcome);
        return this._requestManager.post(url, body)
            .catch((e) => {
            SDKMetrics.reportMetricEvent(AUIMetric.FailedToPublishOutcome);
            return Promise.reject(e);
        })
            .then((res) => Promise.resolve());
    }
    parseExperimentsResponse(response) {
        if (response && response.responseCode === 200) {
            try {
                return JsonParser.parse(response.response);
            }
            catch (e) {
                SDKMetrics.reportMetricEvent(AUIMetric.FailedToParseExperimentResponse);
                throw new Error(AUIMetric.FailedToParseExperimentResponse);
            }
        }
        else {
            throw new Error('Failed to fetch response from aui service');
        }
    }
    collectStaticContextualFeatures() {
        const filter = [
            //GAMES, CAMPAIGN, THE AD
            { l: 'bundleId', c: 'bundle_id' },
            { l: 'gameId', c: 'game_id' },
            //PRIVACY & OPT-OUTS
            { l: 'coppaCompliant', c: 'coppa_compliant' },
            { l: 'limitAdTracking', c: 'limit_ad_tracking' },
            { l: 'gdpr_enabled', c: undefined },
            { l: 'opt_out_recorded', c: undefined },
            { l: 'opt_out_enabled', c: undefined },
            //DEMOGRAPHIC
            { l: 'country', c: undefined },
            { l: 'language', c: undefined },
            { l: 'timeZone', c: 'time_zone' },
            //DEVICE -- STATIC
            { l: 'platform', c: undefined },
            { l: 'osVersion', c: 'os_version' },
            { l: 'deviceModel', c: 'device_model' },
            { l: 'deviceMake', c: 'device_make' },
            { l: 'screenDensity', c: 'screen_density' },
            { l: 'simulator', c: undefined },
            { l: 'stores', c: undefined },
            //DEVICE -- BEHAVIOUR
            { l: 'rooted', c: undefined },
            { l: 'max_volume', c: undefined },
            { l: 'totalMemory', c: 'total_memory' },
            { l: 'total_internal_space', c: undefined },
            { l: 'totalSpaceExternal', c: 'total_external_space' }
        ];
        return Promise.all([
            this._deviceInfo.getDTO(),
            this._clientInfo.getDTO(),
            this._coreConfig.getDTO()
        ])
            .then((res) => {
            const rawData = Object.assign({}, res[0], res[1], res[2], { 'gdpr_enabled': this._privacySdk.isGDPREnabled(), 'opt_out_recorded': this._privacySdk.isOptOutRecorded(), 'opt_out_enabled': this._privacySdk.isOptOutEnabled(), 'platform': Platform[this._nativeBridge.getPlatform()], 'stores': this._deviceInfo.getStores() !== undefined ? this._deviceInfo.getStores().split(',') : undefined, 'simulator': this._deviceInfo instanceof IosDeviceInfo ? this._deviceInfo.isSimulator() : undefined, 'total_internal_space': this._deviceInfo.getTotalSpace(), 'max_volume': this._deviceInfo.get('maxVolume') });
            const features = {};
            filter.forEach(item => {
                if (rawData[item.l] !== undefined) {
                    const name = (item.c !== undefined) ? item.c : item.l;
                    features[name] = rawData[item.l];
                }
            });
            return features;
        }).catch(err => {
            SDKMetrics.reportMetricEvent(AUIMetric.FailedToCollectStaticFeatures);
            return {};
        });
    }
    collectDeviceContextualFeatures() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const filter = [
                { l: 'connectionType', c: 'connection_type' },
                { l: 'headset', c: undefined },
                { l: 'deviceVolume', c: 'device_volume' },
                { l: 'freeMemory', c: 'free_memory' },
                { l: 'device_free_space', c: undefined },
                { l: 'freeSpaceExternal', c: 'free_external_space' },
                { l: 'batteryLevel', c: 'battery_level' },
                { l: 'batteryStatus', c: 'battery_status' },
                { l: 'usbConnected', c: 'usb_connected' },
                { l: 'ringerMode', c: 'ringer_mode' },
                { l: 'networkMetered', c: 'network_metered' },
                { l: 'screenBrightness', c: 'screen_brightness' },
                { l: 'video_orientation', c: undefined },
                { l: 'screenWidth', c: 'screen_width' },
                { l: 'screenHeight', c: 'screen_height' }
            ];
            return Promise.all([
                this._deviceInfo.getDTO(),
                this._deviceInfo.getScreenWidth(),
                this._deviceInfo.getScreenHeight(),
                this._deviceInfo.getFreeSpace()
            ])
                .then((res) => {
                const rawData = Object.assign({}, res[0], { 'video_orientation': Orientation[res[1] >= res[2] ? Orientation.LANDSCAPE : Orientation.PORTRAIT], 'device_free_space': res[3] });
                // do some enum conversions
                if (rawData.hasOwnProperty('batteryStatus')) {
                    rawData.batteryStatus = BatteryStatus[rawData.batteryStatus];
                }
                if (rawData.hasOwnProperty('ringerMode')) {
                    rawData.ringerMode = RingerMode[rawData.ringerMode];
                }
                const features = {};
                filter.forEach(item => {
                    if (rawData[item.l] !== undefined) {
                        const name = (item.c !== undefined) ? item.c : item.l;
                        features[name] = rawData[item.l];
                    }
                });
                return features;
            }).catch(err => {
                SDKMetrics.reportMetricEvent(AUIMetric.FailedToCollectDeviceFeatures);
                return {};
            });
        });
    }
    trimImageUrl(url, gameIcon) {
        if (!url) {
            return '';
        }
        // Remove the extension ('.jpg' or '.png') and split it by '/' to remove the initial part, containing the CDN URL
        const splitUrl = url.slice(0, url.lastIndexOf('.')).split('/');
        const urlLength = splitUrl.length;
        if (urlLength < 4) {
            return '';
        }
        const creativeId = splitUrl[urlLength - 2];
        const uuid = splitUrl[urlLength - 1];
        // If the URL is for a game icon, we only want the UUID (last part of the URL)
        if (gameIcon) {
            return `${uuid}`;
        }
        // Whereas if not, we want the last 2 parts, the creative ID & the UUID
        return `${creativeId}/${uuid}`;
    }
    collectAdSpecificFeatures(campaign) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const features = {};
            const gameSessionCounters = GameSessionCounters.getCurrentCounters();
            const ts = new Date();
            features.campaign_id = campaign.getId();
            features.gsc_ad_requests = gameSessionCounters.adRequests;
            features.gsc_views = gameSessionCounters.views;
            features.gsc_starts = gameSessionCounters.starts;
            features.is_video_cached = CampaignAssetInfo.isCached(campaign);
            features.is_weekend = ts.getDay() === 0 || ts.getDay() === 6;
            features.day_of_week = ts.getDay();
            features.local_day_time = ts.getHours() + ts.getMinutes() / 60;
            if (campaign && campaign instanceof PerformanceCampaign) {
                features.target_game_id = campaign.getGameId();
                features.rating = campaign.getRating();
                features.rating_count = campaign.getRatingCount();
                features.target_store_id = campaign.getAppStoreId();
                features.target_game_name = campaign.getGameName();
                features.portrait_creative_id = campaign.getPortraitVideo() ? campaign.getPortraitVideo().getCreativeId() : undefined;
                features.landscape_creative_id = campaign.getVideo() ? campaign.getVideo().getCreativeId() : undefined;
                // The fields are called *_url for historical reasons, but we actually only send the relevant parts of the URL
                // and remove redundant parts such as the CDN & the file extension.
                features.game_icon_url = this.trimImageUrl(campaign.getGameIcon().getUrl(), true);
                features.endcard_portrait_image_url = campaign.getPortrait() ? this.trimImageUrl(campaign.getPortrait().getUrl()) : undefined;
                features.endcard_landscape_image_url = campaign.getLandscape() ? this.trimImageUrl(campaign.getLandscape().getUrl()) : undefined;
            }
            // Extract game session counters: targetted game centric
            let ids = [];
            let starts = [];
            let views = [];
            let startsTS = [];
            for (const targetId in gameSessionCounters.startsPerTarget) {
                if (gameSessionCounters.startsPerTarget.hasOwnProperty(targetId)) {
                    ids = ids.concat(targetId);
                    starts = starts.concat(gameSessionCounters.startsPerTarget[targetId]);
                    views = views.concat(gameSessionCounters.viewsPerTarget[targetId] !== undefined ? gameSessionCounters.viewsPerTarget[targetId] : 0);
                    startsTS = startsTS.concat(gameSessionCounters.latestTargetStarts[targetId] !== undefined ? gameSessionCounters.latestTargetStarts[targetId] : '');
                }
            }
            if (ids.length > 0) {
                features.gsc_target_games = ids;
                features.gsc_target_game_starts = starts;
                features.gsc_target_game_views = views;
            }
            return features;
        });
    }
    createRequestBody(campaign, categories, contextualFeatures) {
        return JSON.stringify({
            user_info: {
                ab_group: this._abGroup,
                game_session_id: this._gameSessionID,
                auction_id: campaign.getSession().getId(),
                gamer_token: this._gamerToken
            },
            categories: categories,
            contextual_features: contextualFeatures
        });
    }
    // Only public so that testing can access it. :/
    onNewCampaign(campaign) {
        if (Object.keys(this._experimentFilters).length === 0) {
            return Promise.resolve();
        }
        // Gather relevant categories from campaign type
        const categories = [];
        this._experimentFilters.forEach((exp) => {
            // This sucks but couldn't find a way dynamicaly do it. JS limitation as far as I could tell.
            if ((exp.CampaignType === 'PerformanceCampaign' && campaign instanceof PerformanceCampaign) ||
                (exp.CampaignType === 'MRAIDCampaign_AR' && campaign instanceof MRAIDCampaign && ARUtil.isARCreative(campaign)) ||
                AutomatedExperimentManager._forcedARMRAID) {
                categories.push(exp.Category);
            }
        });
        if (categories.length === 0) {
            return Promise.resolve();
        }
        // This is to limit to 1 optmization call per Game Session.
        // First come, first served
        if (this._campaignSource !== undefined) {
            this._campaignSource.unsubscribe(this._onCampaignListener);
        }
        this._campaign = new OptimizedCampaign();
        this._campaign.Id = campaign.getId();
        for (const cat of categories) {
            this._campaign.CategorizedExperiments[cat] = new CategorizedExperiment();
        }
        SDKMetrics.reportMetricEvent(AUIMetric.RequestingCampaignOptimization);
        // Fire and forget... No one resolves it/blocks on it explicitely
        return Promise.all([this._staticFeaturesPromise, this.collectDeviceContextualFeatures(), this.collectAdSpecificFeatures(campaign)])
            .then((featureMaps) => {
            const features = {};
            for (const i in featureMaps) {
                if (featureMaps.hasOwnProperty(i)) {
                    for (const name in featureMaps[i]) {
                        if (!features.hasOwnProperty(name)) {
                            features[name] = featureMaps[i][name];
                        }
                    }
                }
            }
            return features;
        }).then((features) => {
            const body = this.createRequestBody(campaign, categories, features);
            const url = AutomatedExperimentManager.BaseUrl + AutomatedExperimentManager.CreateEndPoint;
            this._experimentCallLatencyStart = performance.now();
            return this._requestManager.post(url, body)
                .then((response) => {
                this._experimentCallLatencyEnd = performance.now();
                return this.parseExperimentsResponse(response);
            })
                .then((parsedResponse) => this.loadCampaignExperiments(campaign, parsedResponse))
                .then(() => Promise.resolve())
                .catch((err) => {
                SDKMetrics.reportMetricEvent(AUIMetric.FailedToFetchAutomatedExperiements);
            });
        }).catch(() => {
            SDKMetrics.reportMetricEvent(AUIMetric.CampaignInitializationError);
        });
    }
    loadCampaignExperiments(campaign, response) {
        if (this._campaign.Id === campaign.getId()) {
            Object.keys(response.categories).forEach(category => {
                const categorizedExp = this._campaign.CategorizedExperiments[category];
                if (categorizedExp.Stage !== CategorizedExperimentStage.AWAITING_OPTIMIZATION) {
                    SDKMetrics.reportMetricEvent(AUIMetric.OptimizationResponseIgnored);
                    this._campaign = new OptimizedCampaign();
                    return;
                }
                categorizedExp.Experiment = response.categories[category];
                categorizedExp.Stage = CategorizedExperimentStage.OPTIMIZED;
            });
            SDKMetrics.reportMetricEvent(AUIMetric.OptimizationResponseApplied);
            return Promise.resolve();
        }
        else {
            return Promise.reject('unknown_campaign_cant_load_experiments');
        }
    }
    isOptimizationTarget(campaign, category) {
        if (this._campaign === undefined || this._campaign.Id !== campaign.getId()) {
            return false;
        }
        if (!this._campaign.CategorizedExperiments.hasOwnProperty(category)) {
            SDKMetrics.reportMetricEvent(AUIMetric.UnknownCategoryProvided);
            return false;
        }
        return true;
    }
    setHeatMapData(clickHeatMapData) {
        this._clickHeatMapData = clickHeatMapData;
    }
}
AutomatedExperimentManager.BaseUrlProduction = 'https://auiopt.unityads.unity3d.com';
AutomatedExperimentManager.BaseUrlStaging = 'https://auiopt.staging.unityads.unity3d.com';
AutomatedExperimentManager.BaseUrlLocal = 'http://127.0.0.1:3001';
AutomatedExperimentManager.BaseUrl = AutomatedExperimentManager.BaseUrlProduction;
AutomatedExperimentManager.CreateEndPoint = '/v1/category/experiment';
AutomatedExperimentManager.RewardEndPoint = '/v1/category/reward';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXV0b21hdGVkRXhwZXJpbWVudE1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvdHMvTWFiRXhwZXJpbWVudGF0aW9uL0F1dG9tYXRlZEV4cGVyaW1lbnRNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFHckUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDcEUsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFDeEUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBQ3JFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQztBQUMvRCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFNbkQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBRTFELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUN2RCxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUc3RSxPQUFPLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ2pFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBRXZELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUMzRCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFFN0MsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sNkNBQTZDLENBQUM7QUFDaEYsT0FBTyxFQUFFLDBCQUEwQixFQUFFLHFCQUFxQixFQUFFLE1BQU0saURBQWlELENBQUM7QUFLcEgsdUlBQXVJO0FBQ3ZJLGdKQUFnSjtBQUNoSiw0S0FBNEs7QUFDNUssTUFB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