import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { AutomatedExperiment, IExperimentActionChoice, IExperimentActionsPossibleValues, IExperimentDeclaration } from 'Ads/Models/AutomatedExperiment';
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
import { MabDisabledABTest } from 'Core/Models/ABGroup';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { JsonParser } from 'Core/Utilities/JsonParser';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { PrivacySDK } from 'Privacy/PrivacySDK';
import { Observable3 } from 'Core/Utilities/Observable';
import { SDKMetrics, AUIMetric } from 'Ads/Utilities/SDKMetrics';

interface IAutomatedExperimentResponse {
    experiments: { [key: string]: IExperimentActionChoice };
    metadata: { [key: string]: string };
}

interface IParsedExperiment {
    name: string;
    actions: IExperimentActionChoice;
    metadata: string;
}

export type ContextualFeature = string | number | boolean | null | undefined | BatteryStatus | RingerMode | Platform | string[] | { [key: string]: string } | { [key: string]: number } | number[] | string[];

class OptimizedAutomatedExperiment {
    constructor(experiment: AutomatedExperiment) {
        this._experiment = experiment;
        this.Actions = experiment.getDefaultActions();
        this.Active = false;
        this.Outcome = 0;
    }

    private _experiment: AutomatedExperiment;
    public Actions: IExperimentActionChoice;
    public Active: boolean;
    public Outcome: number;
    public MetaData: string;

    public getExperiment(): AutomatedExperiment {
        return this._experiment;
    }
}

enum AutomatedExperimentStage {
    AWAITING_OPTIMIZATION,
    RUNNING,
    OUTCOME_PUBLISHED,
    ENDED
}

class OptimizedCampaign {
    constructor() {
        this.Stage = AutomatedExperimentStage.AWAITING_OPTIMIZATION;
        this.Experiments = {};
        this.Id = '';
    }

    public Id: string;
    public Stage: AutomatedExperimentStage;
    public Experiments: { [experimentId: string]: OptimizedAutomatedExperiment };
}

export class AutomatedExperimentManager {
    private readonly _requestManager: RequestManager;
    private readonly _deviceInfo: DeviceInfo;
    private readonly _privacySdk: PrivacySDK;
    private readonly _clientInfo: ClientInfo;
    private readonly _coreConfig: CoreConfiguration;
    private readonly _nativeBridge: NativeBridge;
    private _onCampaignListener: (placementID: string, campaign: Campaign, trackingURL: ICampaignTrackingUrls | undefined) => void;

    private static readonly _baseUrl = 'https://auiopt.unityads.unity3d.com/v2/';
    private static readonly _createEndPoint = 'experiment';
    private static readonly _rewardEndPoint = 'reward';

    private _abGroup: number;
    private _gameSessionID: number;
    private _declaredExperiments: AutomatedExperiment[];
    private _campaign: OptimizedCampaign;
    private _staticFeaturesPromise: Promise<{ [key: string]: ContextualFeature }>;
    private _campaignSource: Observable3<string, Campaign, ICampaignTrackingUrls | undefined>;

    constructor(core: ICore) {
        this._declaredExperiments = [];
        this._requestManager = core.RequestManager;
        this._deviceInfo = core.DeviceInfo;
        this._abGroup = core.Config.getAbGroup();
        this._gameSessionID = core.Ads.SessionManager.getGameSessionId();
        this._privacySdk = core.Ads.PrivacySDK;
        this._clientInfo = core.ClientInfo;
        this._coreConfig = core.Config;
        this._nativeBridge = core.NativeBridge;
        this._onCampaignListener = (placementID: string, campaign: Campaign, trackingURL: ICampaignTrackingUrls | undefined) => this.onNewCampaign(campaign);
        this._staticFeaturesPromise = this.collectStaticContextualFeatures();
    }

    public static createIfAvailable(core: ICore): AutomatedExperimentManager | undefined {
        if (MabDisabledABTest.isValid(core.Config.getAbGroup())) {
            return undefined;
        }

        return new AutomatedExperimentManager(core);
    }

    public listenOnCampaigns(onCampaign: Observable3<string, Campaign, ICampaignTrackingUrls | undefined>): void {
        this._campaignSource = onCampaign;
        onCampaign.subscribe(this._onCampaignListener);
    }

    public registerExperiments(experiments: AutomatedExperiment[]) {
        this._declaredExperiments = this._declaredExperiments.concat(experiments);
    }

    public isCampaignTargetForExperiment(campaign: Campaign) {
        return this._campaign !== undefined && this._campaign.Id === campaign.getId();
    }

    public startCampaign(campaign: Campaign) {
        if (this.isCampaignTargetForExperiment(campaign)) {

            for (const experimentName in this._campaign.Experiments.keys) {
                if (this._campaign.Experiments.hasOwnProperty(experimentName)) {
                    this._campaign.Experiments[experimentName].Active = false;
                    this._campaign.Experiments[experimentName].Outcome = 0;
                }
            }

            this._campaign.Stage = AutomatedExperimentStage.RUNNING;
        }
    }

    public activateExperiment(campaign: Campaign, experiment: AutomatedExperiment): IExperimentActionChoice | undefined {

        if (this.isCampaignTargetForExperiment(campaign)) {

            for (const experimentName in this._campaign.Experiments) {
                if (this._campaign.Experiments.hasOwnProperty(experimentName)) {
                    this._campaign.Experiments[experiment.getName()].Active = true;
                    return this._campaign.Experiments[experiment.getName()].Actions;
                }
            }

            SDKMetrics.reportMetricEvent(AUIMetric.UnknownExperimentName);
        }

        return experiment.getDefaultActions();
    }

    public endCampaign(campaign: Campaign): Promise<void> {

        if (this.isCampaignTargetForExperiment(campaign)) {

            if (this._campaign.Stage === AutomatedExperimentStage.AWAITING_OPTIMIZATION) {

                this._campaign.Stage = AutomatedExperimentStage.ENDED;

                return Promise.resolve();

            } else if (this._campaign.Stage !== AutomatedExperimentStage.RUNNING) {
                return Promise.reject('Experiment session not started.');
            }

            return this.publishCampaignOutcomes(campaign, AutomatedExperimentStage.ENDED);
        }

        return Promise.resolve();
    }

    private publishCampaignOutcomes(campaign: Campaign, nextStage: AutomatedExperimentStage): Promise<void> {

        this._campaign.Stage = nextStage;

        const promises: Promise<INativeResponse>[] = [];
        for (const experimentName in this._campaign.Experiments) {

            if (this._campaign.Experiments.hasOwnProperty(experimentName)) {

                const optmzdExperiment = this._campaign.Experiments[experimentName];
                if (optmzdExperiment.Active) {
                    optmzdExperiment.Active = false;
                    promises.push(this.postExperimentOutcome(campaign, optmzdExperiment, AutomatedExperimentManager._rewardEndPoint));
                }
            }
        }

        return Promise.all(promises)
            .catch((e) => {
                SDKMetrics.reportMetricEvent(AUIMetric.FailedToPublishOutcome);
                return Promise.reject(e);
            })
            .finally(() => { this._campaign = new OptimizedCampaign(); })
            .then((res) => { return Promise.resolve(); });
    }

    public rewardExperiments(campaign: Campaign) {

        if (this.isCampaignTargetForExperiment(campaign)) {

            if (this._campaign.Stage !== AutomatedExperimentStage.RUNNING) {
                return;
            }

            for (const experimentName in this._campaign.Experiments) {
                if (this._campaign.Experiments.hasOwnProperty(experimentName)) {

                    if (this._campaign.Experiments[experimentName].Active) {
                        this._campaign.Experiments[experimentName].Outcome = 1;
                    }
                    
                }
            }

            this.publishCampaignOutcomes(campaign, AutomatedExperimentStage.AWAITING_OPTIMIZATION);
        }
    }

    private postExperimentOutcome(campaign: Campaign, optmzExperiment: OptimizedAutomatedExperiment, apiEndPoint: string): Promise<INativeResponse> {
        const outcome = {
            user_info: {
                ab_group: this._abGroup,
                auction_id: campaign.getSession().getId(),
                game_session_id: this._gameSessionID
            },
            experiment: optmzExperiment.getExperiment().getName(),
            actions: optmzExperiment.Actions,
            reward: optmzExperiment.Outcome,
            metadata: optmzExperiment.MetaData
        };

        const url = AutomatedExperimentManager._baseUrl + apiEndPoint;
        const body = JSON.stringify(outcome);
        return this._requestManager.post(url, body);
    }

    private parseExperimentsResponse(response: INativeResponse): IParsedExperiment[] {
        if (response && response.responseCode === 200) {
            let json: IAutomatedExperimentResponse;
            try {
                json = JsonParser.parse<IAutomatedExperimentResponse>(response.response);

                return Object.keys(json.experiments).map(experiment => ({
                    name: experiment,
                    actions: json.experiments[experiment],
                    metadata: (json.metadata === null || json.metadata === undefined ? '' : json.metadata[experiment])
                }));
            } catch (e) {
                SDKMetrics.reportMetricEvent(AUIMetric.FailedToParseExperimentResponse);
                return [];
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
            { l: 'opt_out_Recorded', c: undefined },
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

        return this._deviceInfo.fetch().then(() => Promise.all([
            this._deviceInfo.getDTO(),
            this._clientInfo.getDTO(),
            this._coreConfig.getDTO()
        ]))
            .then((res) => {
                const rawData: { [key: string]: ContextualFeature } = {
                    ...res[0],
                    ...res[1],
                    ...res[2],
                    'gdpr_enabled': this._privacySdk.isGDPREnabled(),
                    'opt_out_Recorded': this._privacySdk.isOptOutRecorded(),
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
                Diagnostics.trigger('failed_to_collect_static_features', err);
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
            { l: 'local_day_time', c: undefined },
            { l: 'screenWidth', c: 'screen_width' },
            { l: 'screenHeight', c: 'screen_height' }
        ];

        return this._deviceInfo.fetch().then(() => Promise.all([
            this._deviceInfo.getDTO(),
            this._deviceInfo.getScreenWidth(),
            this._deviceInfo.getScreenHeight(),
            new Date(Date.now()),
            this._deviceInfo.getFreeSpace()
        ]))
            .then((res) => {
                const rawData: { [key: string]: ContextualFeature } = {
                    ...res[0],
                    'video_orientation': Orientation[res[1] >= res[2] ? Orientation.LANDSCAPE : Orientation.PORTRAIT],
                    'local_day_time': res[3].getHours() + res[3].getMinutes() / 60,
                    'device_free_space': res[4]
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
                Diagnostics.trigger('failed_to_collect_device_features', err);
                return {};
            });
    }

    private async collectAdSpecificFeatures(campaign: Campaign): Promise<{ [key: string]: ContextualFeature }> {
        const features: { [key: string]: ContextualFeature } = {};
        const gameSessionCounters = GameSessionCounters.getCurrentCounters();

        features.campaign_id = campaign.getId();
        features.target_game_id = campaign instanceof PerformanceCampaign ? campaign.getGameId() : undefined;
        features.rating = campaign instanceof PerformanceCampaign ? campaign.getRating() : undefined;
        features.rating_count = campaign instanceof PerformanceCampaign ? campaign.getRatingCount() : undefined;
        features.gsc_ad_requests = gameSessionCounters.adRequests;
        features.gsc_views = gameSessionCounters.views;
        features.gsc_starts = gameSessionCounters.starts;
        features.is_video_cached = CampaignAssetInfo.isCached(campaign);

        // Extract game session counters: Campaign centric
        let ids: string[] = [];
        let starts: number[] = [];
        let views: number[] = [];
        let startsTS: string[] = [];
        for (const campaignID in gameSessionCounters.startsPerCampaign) {
            if (gameSessionCounters.startsPerCampaign.hasOwnProperty(campaignID)) {
                ids = ids.concat(campaignID);
                starts = starts.concat(gameSessionCounters.startsPerCampaign[campaignID]);
                views = views.concat(gameSessionCounters.viewsPerCampaign[campaignID] !== undefined ? gameSessionCounters.viewsPerCampaign[campaignID] : 0);
                startsTS = startsTS.concat(gameSessionCounters.latestCampaignsStarts[campaignID] !== undefined ? gameSessionCounters.latestCampaignsStarts[campaignID] : '');
            }
        }
        if (ids.length > 0) {
            features.gsc_campaigns = ids;
            features.gsc_campaign_starts = starts;
            features.gsc_campaign_views = views;
            features.gsc_campaign_last_start_ts = startsTS;
        }

        // Extract game session counters: targetted game centric
        ids = [];
        starts = [];
        views = [];
        for (const targetId in gameSessionCounters.startsPerTarget) {
            if (gameSessionCounters.startsPerTarget.hasOwnProperty(targetId)) {
                ids = ids.concat(targetId);
                starts = starts.concat(gameSessionCounters.startsPerTarget[targetId]);
                views = views.concat(gameSessionCounters.viewsPerTarget[targetId] !== undefined ? gameSessionCounters.viewsPerTarget[targetId] : 0);
            }
        }

        if (ids.length > 0) {
            features.gsc_target_games = ids;
            features.gsc_target_game_starts = starts;
            features.gsc_target_game_views = views;
        }

        return features;
    }

    private createRequestBody(campaign: Campaign, experiments: AutomatedExperiment[], contextualFeatures: { [key: string]: ContextualFeature }): string {
        return JSON.stringify({
            user_info: {
                ab_group: this._abGroup,
                game_session_id: this._gameSessionID,
                auction_id: campaign.getSession().getId()
            },
            experiments: experiments.map(e => {
                return {
                    name: e.getName(),
                    actions: this.getExperimentSpace(e.getActions())
                };
            }),
            contextual_features: contextualFeatures
        });
    }

    private getExperimentSpace(experimentComponentsDictionary: IExperimentDeclaration): IExperimentActionsPossibleValues {
        const experimentSpace: { [actionName: string]: string[] } = {};
        for (const [actionName, variants] of Object.entries(experimentComponentsDictionary)) {
            experimentSpace[actionName] = Object.values(variants);
        }

        return experimentSpace;
    }

    // Only public so that testing can access it. :/
    public onNewCampaign(campaign: Campaign): Promise<void> {

        if (this._declaredExperiments.length === 0) {
            return Promise.resolve();
        }

        // This is to limit to 1 optmization call per Game Session.
        if (this._campaignSource !== undefined) {
            this._campaignSource.unsubscribe(this._onCampaignListener);
        }

        this._campaign = new OptimizedCampaign();
        this._campaign.Id = campaign.getId();

        this._declaredExperiments.forEach(experiment => {
            this._campaign.Experiments[experiment.getName()] = new OptimizedAutomatedExperiment(experiment);
        });

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
                const body = this.createRequestBody(campaign, this._declaredExperiments, features);
                const url = AutomatedExperimentManager._baseUrl + AutomatedExperimentManager._createEndPoint;

                return this._requestManager.post(url, body)
                    .then((response) => this.parseExperimentsResponse(response))
                    .then((parsedExperiments) => this.loadCampaignExperiments(campaign, parsedExperiments))
                    .then(() => Promise.resolve())
                    .catch((err) => {
                        SDKMetrics.reportMetricEvent(AUIMetric.FailedToFetchAutomatedExperiements);
                    });
            }).catch(() => {
                SDKMetrics.reportMetricEvent(AUIMetric.AutomatedExperimentManagerInitializationError);
            });
    }

    private loadCampaignExperiments(campaign: Campaign, experiments: IParsedExperiment[]): Promise<void> {

        if (this._campaign.Id === campaign.getId()) {

            if (this._campaign.Stage !== AutomatedExperimentStage.AWAITING_OPTIMIZATION) {
                return Promise.reject('campaign_optimization_response_ignored');
            }

            experiments.forEach(experiment => {
                const optmzdExperiment = this._campaign.Experiments[experiment.name];
                if (optmzdExperiment) {
                    optmzdExperiment.Actions = experiment.actions;
                    optmzdExperiment.MetaData = experiment.metadata;
                }
            });

            return Promise.resolve();

        } else {
            return Promise.reject('unknown_campaign_cant_load_experiments');
        }
    }
}
