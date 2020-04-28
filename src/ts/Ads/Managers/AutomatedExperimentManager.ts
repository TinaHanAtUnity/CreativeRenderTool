import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { IExperimentActionChoice, AutomatedExperiment } from 'Ads/Models/AutomatedExperiment';
import { Campaign, ICampaignTrackingUrls } from 'Ads/Models/Campaign';
import { CampaignAssetInfo } from 'Ads/Utilities/CampaignAssetInfo';
import { GameSessionCounters } from 'Ads/Utilities/GameSessionCounters';
import { BatteryStatus } from 'Core/Constants/Android/BatteryStatus';
import { RingerMode } from 'Core/Constants/Android/RingerMode';
import { Platform } from 'Core/Constants/Platform';
import { ICore } from 'Core/ICore';
import { INativeResponse, RequestManager } from 'Core/Managers/RequestManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { IosDeviceInfo } from 'Core/Models/IosDeviceInfo';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { JsonParser } from 'Core/Utilities/JsonParser';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { PrivacySDK } from 'Privacy/PrivacySDK';
import { Observable3 } from 'Core/Utilities/Observable';
import { SDKMetrics, AUIMetric } from 'Ads/Utilities/SDKMetrics';
import { MabDisabledABTest } from 'Core/Models/ABGroup';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import { ARUtil } from 'AR/Utilities/ARUtil';

interface IAutomatedExperimentResponse {
    categories: { [expCat: string]: IAggregateExperiment };
}

// For a given category, AUI/Optmz service can return multiple experiments that answer the request.
// These experiments always share the same "outcomes" and are internal to the AutomatedManager.
// What gets exposed is the aggregated `actions` of these experiments.
interface IAggregateExperiment {
    experiment_name: string;
    parts: IAggregateExperimentPart[];
}

interface IAggregateExperimentPart {
    id: string;
    actions: IExperimentActionChoice;
    metadata: string;
}

export type ContextualFeature = string | number | boolean | null | undefined | BatteryStatus | RingerMode | Platform | string[] | { [key: string]: string } | { [key: string]: number } | number[] | string[];

enum AutomatedExperimentStage {
    AWAITING_OPTIMIZATION,
    OPTIMIZED,
    RUNNING,
    OUTCOME_PUBLISHED,
    ENDED
}

// A categorized experiment is an experiment that is associated to an 'Experiment Category'
// An experiment category can, on the AUI/Optmz service side, be composed of many 'categorized experiments'
// When the AUI/Optmz is queried for an categorized experiment, it will choose a random experiment
// for the available experiments of that category.
// This allows the AUI/Optmz service to select optimized experiments per category.
class CategorizedExperiment {
    constructor() {
        this.Outcome = 0;
        this.Stage = AutomatedExperimentStage.AWAITING_OPTIMIZATION;
    }

    public Stage: AutomatedExperimentStage;
    public Experiment: IAggregateExperiment;
    public Outcome: number;

    public aggregatedActions(): IExperimentActionChoice {

        const actions: IExperimentActionChoice = {};

        for (const part of this.Experiment.parts) {

            Object.keys(part.actions).forEach((act) => {
                actions[act] = part.actions[act];
            });
        }

        return actions;
    }
}

class OptimizedCampaign {
    constructor() {
        this.CategorizedExperiments = {};
        this.Id = '';
    }

    public Id: string;
    public CategorizedExperiments: { [Category: string]: CategorizedExperiment };
}

class ExperimentCategory {
    public Category: string;
    public CampaignType: string;
}

// How to usage, call in order:
//  1. initialize()                             // Done by Ads
//  2. registerExperimentCategory()             // for each category of interest
//  3. (optional) getSelectedExperimentName()       // gets the name of the experiment choosen by AUi/Optmz
//  4. activeSelectedExperiment()               // Signals that experiment is underway -> awaiting an outcome
//  5. (Optional) rewardSelectedExperiment()    // when experiment result is found to be positive (this sends positive outcome back to AUI/Optmz)
//  6. endSelectedExperiment()                  // Once the experiment is over (success or not) (this sends negative outcome back to AUI/Optmz if no reward was sent)

export class AutomatedExperimentManager {

    private static _forcedARMRAID: boolean;

    private _requestManager: RequestManager;
    private _deviceInfo: DeviceInfo;
    private _privacySdk: PrivacySDK;
    private _clientInfo: ClientInfo;
    private _coreConfig: CoreConfiguration;
    private _nativeBridge: NativeBridge;
    private _onCampaignListener: (placementID: string, campaign: Campaign, trackingURL: ICampaignTrackingUrls | undefined) => void;

    public static readonly BaseUrlProduction = 'https://auiopt.unityads.unity3d.com';
    public static readonly BaseUrlStaging = 'https://auiopt.staging.unityads.unity3d.com';
    public static readonly BaseUrlLocal = 'http://127.0.0.1:3001';

    public static readonly BaseUrl = AutomatedExperimentManager.BaseUrlProduction;
    public static readonly CreateEndPoint = '/v1/category/experiment';
    public static readonly RewardEndPoint = '/v1/category/reward';

    private _abGroup: number;
    private _gameSessionID: number;
    private _experimentCategories: ExperimentCategory[];
    private _campaign: OptimizedCampaign;
    private _staticFeaturesPromise: Promise<{ [key: string]: ContextualFeature }>;
    private _campaignSource: Observable3<string, Campaign, ICampaignTrackingUrls | undefined>;

    public static setForcedARMRAID(value: boolean) {
        this._forcedARMRAID = value;
    }

    public static isAutomationAvailable(adsConfig: AdsConfiguration, config: CoreConfiguration) {
        return !MabDisabledABTest.isValid(config.getAbGroup()) || adsConfig.getHasArPlacement();
    }

    constructor() {
        this._experimentCategories = [];
    }

    public initialize(core: ICore, campaignSource: Observable3<string, Campaign, ICampaignTrackingUrls | undefined>): void {
        this._requestManager = core.RequestManager;
        this._deviceInfo = core.DeviceInfo;
        this._privacySdk = core.Ads.PrivacySDK;
        this._clientInfo = core.ClientInfo;
        this._coreConfig = core.Config;
        this._nativeBridge = core.NativeBridge;
        this._abGroup = core.Config.getAbGroup();
        this._gameSessionID = core.Ads.SessionManager.getGameSessionId();
        this._campaignSource = campaignSource;
        this._onCampaignListener = (placementID: string, campaign: Campaign, trackingURL: ICampaignTrackingUrls | undefined) => this.onNewCampaign(campaign);
        this._campaignSource.subscribe(this._onCampaignListener);
        this._staticFeaturesPromise = this.collectStaticContextualFeatures();
    }

    public registerExperimentCategory(category: string, campaignType: string) {

        const newCatExp = new ExperimentCategory();
        newCatExp.CampaignType = campaignType;
        newCatExp.Category = category;

        this._experimentCategories = this._experimentCategories.concat(newCatExp);
    }

    public getSelectedExperimentName(campaign: Campaign, category: string): string {

        if (!this.isOptimizationTarget(campaign, category)) {
            return '';
        }

        const categorizedExp = this._campaign.CategorizedExperiments[category];

        if (categorizedExp.Stage === AutomatedExperimentStage.AWAITING_OPTIMIZATION ||
            categorizedExp.Stage === AutomatedExperimentStage.ENDED) {
            return '';
        }

        return categorizedExp.Experiment.experiment_name;
    }

    public activateSelectedExperiment(campaign: Campaign, category: string): IExperimentActionChoice | undefined {

        if (!this.isOptimizationTarget(campaign, category)) {
            return undefined;
        }

        const categorizedExp = this._campaign.CategorizedExperiments[category];

        if (categorizedExp.Stage === AutomatedExperimentStage.RUNNING) {
            SDKMetrics.reportMetricEvent(AUIMetric.CampaignCategoryAlreadyActive);
            return undefined;
        } else if (categorizedExp.Stage !== AutomatedExperimentStage.OPTIMIZED) {
            return undefined;
        }

        categorizedExp.Stage = AutomatedExperimentStage.RUNNING;
        categorizedExp.Outcome = 0;

        return categorizedExp.aggregatedActions();
    }

    public endSelectedExperiment(campaign: Campaign, category: string): Promise<void> {

        if (!this.isOptimizationTarget(campaign, category)) {
            return Promise.resolve();
        }

        try {
            const categorizedExp = this._campaign.CategorizedExperiments[category];

            if (categorizedExp.Stage !== AutomatedExperimentStage.RUNNING) {
                return Promise.resolve();
            }

            return this.publishCampaignOutcomes(campaign, categorizedExp, AutomatedExperimentStage.ENDED);
        }
        finally {
            this._campaign = new OptimizedCampaign();
        }

     }

     public rewardSelectedExperiment(campaign: Campaign, category: string): Promise<void> {

        if (!this.isOptimizationTarget(campaign, category)) {
            return Promise.resolve();
        }

        const categorizedExp = this._campaign.CategorizedExperiments[category];

        if (categorizedExp.Stage !== AutomatedExperimentStage.RUNNING) {
            return Promise.resolve();
        }

        categorizedExp.Outcome = 1;

        return this.publishCampaignOutcomes(campaign, categorizedExp, AutomatedExperimentStage.OUTCOME_PUBLISHED);
    }

    private publishCampaignOutcomes(campaign: Campaign, categorizedExp: CategorizedExperiment, nextStage: AutomatedExperimentStage): Promise<void> {

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
                game_session_id: this._gameSessionID
            },
            reward: categorizedExp.Outcome,
            experiments: experiments
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

    private parseExperimentsResponse(response: INativeResponse): IAutomatedExperimentResponse {
        if (response && response.responseCode === 200) {
            try {
                return JsonParser.parse<IAutomatedExperimentResponse>(response.response);
            } catch (e) {
                SDKMetrics.reportMetricEvent(AUIMetric.FailedToParseExperimentResponse);
                throw new Error(AUIMetric.FailedToParseExperimentResponse);
            }
        } else {
            throw new Error('Failed to fetch response from aui service');
        }
    }

    private collectStaticContextualFeatures(): Promise<{ [key: string]: ContextualFeature }> {
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
                const rawData: { [key: string]: ContextualFeature } = {
                    ...res[0],
                    ...res[1],
                    ...res[2],
                    'gdpr_enabled': this._privacySdk.isGDPREnabled(),
                    'opt_out_recorded': this._privacySdk.isOptOutRecorded(),
                    'opt_out_enabled': this._privacySdk.isOptOutEnabled(),
                    'platform': Platform[this._nativeBridge.getPlatform()],
                    'stores': this._deviceInfo.getStores() !== undefined ? this._deviceInfo.getStores().split(',') : undefined,
                    'simulator': this._deviceInfo instanceof IosDeviceInfo ? this._deviceInfo.isSimulator() : undefined,
                    'total_internal_space': this._deviceInfo.getTotalSpace(),
                    'max_volume': this._deviceInfo.get('maxVolume')
                };

                const features: { [key: string]: ContextualFeature } = {};
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

    private async collectDeviceContextualFeatures(): Promise<{ [key: string]: ContextualFeature }> {
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
                const rawData: { [key: string]: ContextualFeature } = {
                    ...res[0],
                    'video_orientation': Orientation[res[1] >= res[2] ? Orientation.LANDSCAPE : Orientation.PORTRAIT],
                    'device_free_space': res[3]
                };

                // do some enum conversions
                if (rawData.hasOwnProperty('batteryStatus')) {
                    rawData.batteryStatus = BatteryStatus[<BatteryStatus>rawData.batteryStatus];
                }
                if (rawData.hasOwnProperty('ringerMode')) {
                    rawData.ringerMode = RingerMode[<RingerMode>rawData.ringerMode];
                }

                const features: { [key: string]: ContextualFeature } = {};
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
    }

    private async collectAdSpecificFeatures(campaign: Campaign): Promise<{ [key: string]: ContextualFeature }> {
        const features: { [key: string]: ContextualFeature } = {};
        const gameSessionCounters = GameSessionCounters.getCurrentCounters();

        const ts = new Date();
        features.campaign_id = campaign.getId();
        features.target_game_id = campaign instanceof PerformanceCampaign ? campaign.getGameId() : undefined;
        features.rating = campaign instanceof PerformanceCampaign ? campaign.getRating() : undefined;
        features.rating_count = campaign instanceof PerformanceCampaign ? campaign.getRatingCount() : undefined;
        features.gsc_ad_requests = gameSessionCounters.adRequests;
        features.gsc_views = gameSessionCounters.views;
        features.gsc_starts = gameSessionCounters.starts;
        features.is_video_cached = CampaignAssetInfo.isCached(campaign);
        features.is_weekend = ts.getDay() === 0 || ts.getDay() === 6;
        features.day_of_week = ts.getDay();
        features.local_day_time = ts.getHours() + ts.getMinutes() / 60;

        if (campaign && campaign instanceof PerformanceCampaign) {
            features.target_store_id = campaign.getAppStoreId();
            features.game_icon_url = campaign.getGameIcon().getUrl();
            features.target_game_name = campaign.getGameName();
            features.portrait_video_url = campaign.getPortraitVideo() ? campaign.getPortraitVideo()!.getUrl() : undefined;
            features.landscape_video_url = campaign.getVideo() ? campaign.getVideo()!.getUrl() : undefined;
            features.portrait_creative_id = campaign.getPortraitVideo() ? campaign.getPortraitVideo()!.getCreativeId() : undefined;
            features.landscape_creative_id =  campaign.getVideo() ? campaign.getVideo()!.getCreativeId() : undefined;
            features.endcard_portrait_image_url = campaign.getPortrait() ? campaign.getPortrait()!.getUrl() : undefined;
            features.endcard_landscape_image_url = campaign.getLandscape() ? campaign.getLandscape()!.getUrl() : undefined;
        }
        // Extract game session counters: targetted game centric
        let ids: string[] = [];
        let starts: number[] = [];
        let views: number[] = [];
        let startsTS: string[] = [];

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
    }

    private createRequestBody(campaign: Campaign, categories: string[], contextualFeatures: { [key: string]: ContextualFeature }): string {
        return JSON.stringify({
            user_info: {
                ab_group: this._abGroup,
                game_session_id: this._gameSessionID,
                auction_id: campaign.getSession().getId()
            },
            categories: categories,
            contextual_features: contextualFeatures
        });
    }

    // Only public so that testing can access it. :/
    public onNewCampaign(campaign: Campaign): Promise<void> {

        if (Object.keys(this._experimentCategories).length === 0) {
            return Promise.resolve();
        }

        // Gather relevant categories from campaign type
        const categories: string[] = [];
        this._experimentCategories.forEach((exp) => {
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
                const features: { [key: string]: ContextualFeature } = {};
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

                return this._requestManager.post(url, body)
                    .then((response) => this.parseExperimentsResponse(response))
                    .then((parsedResponse) => this.loadCampaignExperiments(campaign, parsedResponse))
                    .then(() => Promise.resolve())
                    .catch((err) => {
                        SDKMetrics.reportMetricEvent(AUIMetric.FailedToFetchAutomatedExperiements);
                    });
            }).catch(() => {
                SDKMetrics.reportMetricEvent(AUIMetric.CampaignInitializationError);
            });
    }

    private loadCampaignExperiments(campaign: Campaign, response: IAutomatedExperimentResponse): Promise<void> {

        if (this._campaign.Id === campaign.getId()) {

            Object.keys(response.categories).forEach(category => {

                const categorizedExp = this._campaign.CategorizedExperiments[category];

                if (categorizedExp.Stage !== AutomatedExperimentStage.AWAITING_OPTIMIZATION) {
                    SDKMetrics.reportMetricEvent(AUIMetric.OptimizationResponseIgnored);
                    this._campaign = new OptimizedCampaign();
                    return;
                }

                categorizedExp.Experiment = response.categories[category];
                categorizedExp.Stage = AutomatedExperimentStage.OPTIMIZED;
            });

            SDKMetrics.reportMetricEvent(AUIMetric.OptimizationResponseApplied);

            return Promise.resolve();

        } else {
            return Promise.reject('unknown_campaign_cant_load_experiments');
        }
    }

    private isOptimizationTarget(campaign: Campaign, category: string): boolean {
        if (this._campaign === undefined || this._campaign.Id !== campaign.getId()) {
            return false;
        }

        if (!this._campaign.CategorizedExperiments.hasOwnProperty(category)) {
            SDKMetrics.reportMetricEvent(AUIMetric.UnknownCategoryProvided);
            return false;
        }

        return true;
    }
}
