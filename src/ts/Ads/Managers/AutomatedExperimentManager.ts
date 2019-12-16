import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { AutomatedExperiment } from 'Ads/Models/AutomatedExperiment';
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
import { SdkApi } from 'Core/Native/Sdk';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { JsonParser } from 'Core/Utilities/JsonParser';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { PrivacySDK } from 'Privacy/PrivacySDK';
import { IOnCampaignListener } from 'Ads/Managers/CampaignManager';
import { Observable3 } from 'Core/Utilities/Observable';

interface IAutomatedExperimentResponse {
    experiments: { [key: string]: string };
    metadata: { [key: string]: string };
}

interface IParsedExperiment {
    name: string;
    action: string;
    metadata: string;
}

type ContextualFeature = string | number | boolean | null | undefined | BatteryStatus | RingerMode | Platform | string[] | { [key: string]: string } | { [key: string]: number };

class OptimizedAutomatedExperiment {
    constructor(experiment: AutomatedExperiment) {
        this._experiment = experiment;
        this.Action = experiment.getDefaultAction();
        this.Active = false;
        this.Outcome = 0;
    }

    private _experiment: AutomatedExperiment;
    public Action: string;
    public Active: boolean;
    public Outcome: number;
    public MetaData: string;

    public getExperiment(): AutomatedExperiment {
        return this._experiment;
    }
}

enum AutomatedExperimentStage {
    AwaitingOptimization,
    Running,
    OutcomePublished,
    Ended
}

class OptimizedCampaign {
    constructor() {
        this.Stage = AutomatedExperimentStage.AwaitingOptimization;
        this.experiments = {};
    }

    public Stage: AutomatedExperimentStage;
    public experiments: { [experimentId: string]: OptimizedAutomatedExperiment };
}

export class CachableAutomatedExperimentData {
    constructor(action: string, metadata: string) {
        this.Action = action;
        this.Metadata = metadata;
    }

    public Action: string;
    public Metadata: string;
}

export class AutomatedExperimentManager implements IOnCampaignListener {
    private readonly _requestManager: RequestManager;
    private readonly _deviceInfo: DeviceInfo;
    private readonly _sdkApi: SdkApi;
    private readonly _privacySdk: PrivacySDK;
    private readonly _clientInfo: ClientInfo;
    private readonly _coreConfig: CoreConfiguration;
    private readonly _nativeBridge: NativeBridge;

    private static readonly _baseUrl = 'https://auiopt.unityads.unity3d.com/v1/';

    private static readonly _createEndPoint = 'experiment';
    private static readonly _rewardEndPoint = 'reward';

    private _abGroup: number;
    private _gameSessionID: number;
    private _declaredExperiments: AutomatedExperiment[];
    private _campaigns: { [CampaignId: string]: OptimizedCampaign };
    private _staticFeaturesPromise: Promise<{ [key: string]: ContextualFeature }>;

    constructor(core: ICore) {
        this._campaigns = {};

        this._requestManager = core.RequestManager;
        this._deviceInfo = core.DeviceInfo;
        this._abGroup = core.Config.getAbGroup();
        this._gameSessionID = core.Ads.SessionManager.getGameSessionId();
        this._sdkApi = core.Api.Sdk;
        this._privacySdk = core.Ads.PrivacySDK;
        this._clientInfo = core.ClientInfo;
        this._coreConfig = core.Config;
        this._nativeBridge = core.NativeBridge;
    }

    public listenOnCampaigns(onCampaign: Observable3<string, Campaign, ICampaignTrackingUrls | undefined>): void {
        onCampaign.subscribe((placementId, campaign, trackingUrls) => AutomatedExperimentManager.onNewCampaign(this, campaign));
    }

    public initialize(experiments: AutomatedExperiment[]): Promise<void> {
        this._declaredExperiments = experiments;
        this._staticFeaturesPromise = this.collectStaticContextualFeatures();

        return Promise.resolve();
    }

    public startCampaign(campaign: Campaign) {
        if (this._campaigns.hasOwnProperty(campaign.getId())) {
            const optmzdCampaign = this._campaigns[campaign.getId()];

            for (const experimentName in optmzdCampaign.experiments.keys) {
                if (optmzdCampaign.experiments.hasOwnProperty(experimentName)) {
                    optmzdCampaign.experiments[experimentName].Active = false;
                    optmzdCampaign.experiments[experimentName].Outcome = 0;
                }
            }

            optmzdCampaign.Stage = AutomatedExperimentStage.Running;
        } else {
            this._sdkApi.logError('init_experiments_with_unkown_campaign:' + campaign.getId());
        }
    }

    public activateExperiment(campaign: Campaign, experiment: AutomatedExperiment): string|undefined {

        if (this._campaigns.hasOwnProperty(campaign.getId())) {
            const optmzdCampaign = this._campaigns[campaign.getId()];

            for (const experimentName in optmzdCampaign.experiments) {
                if (optmzdCampaign.experiments.hasOwnProperty(experimentName)) {
                    optmzdCampaign.experiments[experiment.getName()].Active = true;
                    return optmzdCampaign.experiments[experiment.getName()].Action;
                }
            }
        } else {
            this._sdkApi.logError('start_experiments_with_unkown_campaign:' + campaign.getId());
        }
        return undefined;
    }

    public endCampaign(campaign: Campaign): Promise<void> {
        if (this._campaigns.hasOwnProperty(campaign.getId())) {

            const optmzdCampaign = this._campaigns[campaign.getId()];
            if (optmzdCampaign.Stage === AutomatedExperimentStage.OutcomePublished) {
                optmzdCampaign.Stage = AutomatedExperimentStage.Ended;
                return Promise.resolve();
            } else if (optmzdCampaign.Stage !== AutomatedExperimentStage.Running) {
                return Promise.reject('Experiment session not started.');
            }

            return this.publishCampaignOutcomes(campaign, optmzdCampaign, AutomatedExperimentStage.Ended);
        }

        return Promise.reject('Attempted to end experiments of unkown campaign');
    }

    private publishCampaignOutcomes(campaign: Campaign, optmzCampaign: OptimizedCampaign, nextStage: AutomatedExperimentStage): Promise<void> {

        optmzCampaign.Stage = nextStage;
        const promises: Promise<INativeResponse>[] = [];
        for (const experimentName in optmzCampaign.experiments) {
            if (optmzCampaign.experiments.hasOwnProperty(experimentName)) {
                const optmzdExperiment = optmzCampaign.experiments[experimentName];
                if (optmzdExperiment.Active) {
                    optmzdExperiment.Active = false;
                    promises.push(this.postExperimentOutcome(campaign, optmzdExperiment, AutomatedExperimentManager._rewardEndPoint));
                }
            }
        }

        return Promise.all(promises).then((ignored) => Promise.resolve());
    }

    public rewardExperiments(campaign: Campaign) {
        if (this._campaigns.hasOwnProperty(campaign.getId())) {
            const optmzdCampaign = this._campaigns[campaign.getId()];
            if (optmzdCampaign.Stage !== AutomatedExperimentStage.Running) {
                return;
            }

            for (const experimentName in optmzdCampaign.experiments) {
                if (optmzdCampaign.experiments.hasOwnProperty(experimentName)) {
                    if (optmzdCampaign.experiments[experimentName].Active) {
                        optmzdCampaign.experiments[experimentName].Outcome = 1;
                    }
                }
            }

            this.publishCampaignOutcomes(campaign, optmzdCampaign, AutomatedExperimentStage.OutcomePublished);

        } else {
            this._sdkApi.logError('reward_experiments_with_unkown_campaign:' + campaign.getId());
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
            action: optmzExperiment.Action,
            reward: optmzExperiment.Outcome,
            metadata: optmzExperiment.MetaData
        };

        const url = AutomatedExperimentManager._baseUrl + apiEndPoint;
        const body = JSON.stringify(outcome);
        return this._requestManager.post(url, body);
    }

    private loadCampaignExperiments(campaign: Campaign, experiments: IParsedExperiment[]): Promise<void> {
        if (this._campaigns.hasOwnProperty(campaign.getId())) {
            const optmzdCampaign = this._campaigns[campaign.getId()];

            if (optmzdCampaign.Stage !== AutomatedExperimentStage.AwaitingOptimization) {
                return Promise.reject('campaign_optimization_response_ignored');
            }
            experiments.forEach(experiment => {
                const optmzdExperiment = optmzdCampaign.experiments[experiment.name];
                if (optmzdExperiment) {
                    optmzdExperiment.Action = experiment.action;
                    optmzdExperiment.MetaData = experiment.metadata;
                }
            });
            return Promise.resolve();
        } else {
            return Promise.reject('unknown_campaign_cant_load_experiments');
        }
    }

    private parseExperimentsResponse(response: INativeResponse): IParsedExperiment[] {
        if (response && response.responseCode === 200) {
            let json: IAutomatedExperimentResponse;
            try {
                json = JsonParser.parse<IAutomatedExperimentResponse>(response.response);

                return Object.keys(json.experiments).map(experiment => ({
                    name: experiment,
                    action: json.experiments[experiment],
                    metadata: (json.metadata === null || json.metadata === undefined ? '' : json.metadata[experiment])
                }));
            } catch (e) {
                Diagnostics.trigger('failed_to_parse_automated_experiments', e);
                return [];
            }
        } else {
            throw new Error('Failed to fetch response from aui service');
        }
    }

    private async collectStaticContextualFeatures(): Promise<{ [key: string]: ContextualFeature }>  {
        const filter = [
            //GAMES, CAMPAIGN, THE AD
            { l: 'bundleId', c: 'bundle_id'},
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
            { l: 'platform',  c: undefined },
            { l: 'osVersion', c: 'os_version' },
            { l: 'deviceModel', c: 'device_model' },
            { l: 'deviceMake', c: 'device_make' },
            { l: 'screenDensity', c: 'screen_density' },
            { l: 'simulator',  c: undefined },
            { l: 'stores', c: undefined },

            //DEVICE -- BEHAVIOUR
            { l: 'rooted',  c: undefined },
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
               'stores':  this._deviceInfo.getStores() !== undefined ? this._deviceInfo.getStores().split(',') : undefined,
               'simulator': this._deviceInfo instanceof IosDeviceInfo ? this._deviceInfo.isSimulator() : undefined,
               'total_internal_space': this._deviceInfo.getTotalSpace(),
               'max_volume': this._deviceInfo.get('maxVolume')
            };

            const features: { [key: string]: ContextualFeature } = {};
            filter.forEach(item => {
               if (rawData[item.l] !== undefined) {
                   const name = (item.c !== undefined) ? item.c : item.l;
                   features[ name ] = rawData[item.l] ;
               }
            });

            return features;
        }).catch(err => {
            Diagnostics.trigger('failed_to_collect_static_features', err);
            return {};
        });
    }

    private async collectDeviceContextualFeatures(): Promise<{ [key: string]: ContextualFeature }>  {
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
               'video_orientation': Orientation[  res[1] >= res[2] ? Orientation.LANDSCAPE : Orientation.PORTRAIT],
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
                   features[ name ] = rawData[item.l] ;
               }
            });

            return features;
        }).catch(err => {
            Diagnostics.trigger('failed_to_collect_device_features', err);
            return {};
        });
    }

    private async collectAdUnitFeatures(campaign: Campaign): Promise<{ [key: string]: ContextualFeature }>  {
        const features: { [key: string]: ContextualFeature } = {};
        const gameSessionCounters = GameSessionCounters.getCurrentCounters();

        features.campaign_id = campaign.getId();
        features.target_game_id = campaign instanceof PerformanceCampaign ? campaign.getGameId() : undefined;
        features.rating =  campaign instanceof PerformanceCampaign ? campaign.getRating() : undefined;
        features.ratingCount =  campaign instanceof PerformanceCampaign ? campaign.getRatingCount() : undefined;
        features.gsc_ad_requests = gameSessionCounters.adRequests;
        features.gsc_views = gameSessionCounters.views;
        features.gsc_starts = gameSessionCounters.starts;
        features.is_video_cached = CampaignAssetInfo.isCached(campaign);

        // features['gsc_latest_campaign_starts'] =  gameSessionCounters.latestCampaignsStarts;  <- AUI can't read it at the moment...
        // features['gsc_starts_per_campaign'] = gameSessionCounters.startsPerCampaign;          <- AUI can't read it at the moment...
        // features['gsc_starts_per_target'] = gameSessionCounters.startsPerTarget;              <- AUI can't read it at the moment...
        // features['gsc_views_per_campaign'] = gameSessionCounters.viewsPerCampaign;            <- AUI can't read it at the moment...
        // features['gsc_views_per_target'] = gameSessionCounters.viewsPerTarget;                <- AUI can't read it at the moment...

        return features;
    }

    private createRequestBody(campaign: Campaign, experiments: AutomatedExperiment[], contextualFeatures: { [key: string]: ContextualFeature}): string {
        return JSON.stringify({
            user_info: {
                ab_group: this._abGroup,
                game_session_id: this._gameSessionID,
                auction_id: campaign.getSession().getId()
            },
            experiments: experiments.map(e => { return {name: e.getName(), actions: e.getActions()}; }),
            contextual_features: contextualFeatures
        });
    }

    // Only public so that testing can access it. :/
    public static onNewCampaign(_this: AutomatedExperimentManager, campaign: Campaign): Promise<void> {
        if (_this._declaredExperiments.length === 0) {
            return Promise.resolve();
        }

        if (_this._campaigns.hasOwnProperty(campaign.getId())) {
            return Promise.resolve();
        }

        const optmzdCampaign = new OptimizedCampaign();
        _this._campaigns[campaign.getId()] = optmzdCampaign;

        _this._declaredExperiments.forEach(experiment => {
            optmzdCampaign.experiments[experiment.getName()] = new OptimizedAutomatedExperiment(experiment);
        });

        // Fire and forget... No one resolves it/blocks on it explicitely
        return Promise.all([_this._staticFeaturesPromise, _this.collectDeviceContextualFeatures(), _this.collectAdUnitFeatures(campaign)])
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
            const body = _this.createRequestBody(campaign, _this._declaredExperiments, features);
            const url = AutomatedExperimentManager._baseUrl + AutomatedExperimentManager._createEndPoint;

            return _this._requestManager.post(url, body)
                .then((response) => _this.parseExperimentsResponse(response))
                .then((parsedExperiments) => _this.loadCampaignExperiments(campaign, parsedExperiments))
                .then(() => Promise.resolve())
                .catch((err) => {
                    Diagnostics.trigger('failed_to_fetch_automated_experiments', err);
                });
        });
    }
}
