import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { AutomatedExperiment } from 'Ads/Models/AutomatedExperiment';
import { BatteryStatus } from 'Core/Constants/Android/BatteryStatus';
import { RingerMode } from 'Core/Constants/Android/RingerMode';
import { Platform } from 'Core/Constants/Platform';
import { ICore } from 'Core/ICore';
import { INativeResponse, RequestManager } from 'Core/Managers/RequestManager';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { IosDeviceInfo } from 'Core/Models/IosDeviceInfo';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { StorageApi, StorageType } from 'Core/Native/Storage';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { JsonParser } from 'Core/Utilities/JsonParser';
import { PrivacySDK } from 'Privacy/PrivacySDK';

interface IAutomatedExperimentResponse {
    experiments: { [key: string]: string };
    metadata: { [key: string]: string };
}

interface IParsedExperiment {
    name: string;
    action: string;
    metadata: string;
}

export type ContextualFeature = string | number | boolean | null | undefined | BatteryStatus | RingerMode | Platform | string[];

class StateItem {
    constructor(experiment: AutomatedExperiment, action: string) {
        this._experiment = experiment;
        this.Action = action;
    }

    private _experiment: AutomatedExperiment;
    public Action: string;
    public SendReward = false;
    public SendAction = false;
    public MetaData: string;

    public getExperiment(): AutomatedExperiment {
        return this._experiment;
    }
}

class UserInfo {
    public ABGroup: number;
    public AuctionID: string | undefined;
    public GameSessionID: number;
}

export class CachableAutomatedExperimentData {
    constructor(action: string, metadata: string) {
        this.Action = action;
        this.Metadata = metadata;
    }

    public Action: string;
    public Metadata: string;
}

export class AutomatedExperimentManager {
    private readonly _deviceInfo: DeviceInfo;
    private readonly _clientInfo: ClientInfo;
    private readonly _coreConfig: CoreConfiguration;
    private readonly _privacySDK: PrivacySDK;
    private readonly _nativeBridge: NativeBridge;
    private readonly _requestManager: RequestManager;
    private readonly _storageApi: StorageApi;

    private readonly _state: { [key: string]: StateItem };
    private _experimentBegan: boolean;
    private _userInfo: UserInfo;
    private _gameSessionId: number;

    private static readonly _baseUrl = 'https://auiopt.unityads.unity3d.com/v1/';
    private static readonly _createEndPoint = 'experiment';
    private static readonly _actionEndPoint = 'action';
    private static readonly _rewardEndPoint = 'reward';
    private static readonly _settingsPrefix = 'AUI_OPT_EXPERIMENT';

    constructor(core: ICore) {
        this._deviceInfo = core.DeviceInfo;
        this._clientInfo = core.ClientInfo;
        this._coreConfig = core.Config;
        this._privacySDK = core.Ads.PrivacySDK;
        this._nativeBridge = core.NativeBridge;
        this._requestManager = core.RequestManager;
        this._storageApi = core.Api.Storage;
        this._gameSessionId = core.Ads.SessionManager.getGameSessionId();
        this._state = {};
        this._experimentBegan = false;
        this._userInfo = new UserInfo();
    }

    public initialize(experiments: AutomatedExperiment[]): Promise<void> {
        const storedExperimentsPromise = experiments
            .filter(experiment => !experiment.isCacheDisabled())
            .map(experiment => this.getStoredExperimentData(experiment)
                .then((storedExperimentData) => ({ experiment, data : storedExperimentData }))
                .catch(() => ({experiment, data: null}))
            );

        experiments.forEach(experiment => {
            this._state[experiment.getName()] = new StateItem(experiment, experiment.getDefaultAction());
        });

        this._userInfo.ABGroup = this._coreConfig.getAbGroup();
        this._userInfo.GameSessionID = this._gameSessionId;

        return this.collectStaticContextualFeatures().then(features => {
              return Promise.all(storedExperimentsPromise).then(storedExperiments => {
                storedExperiments
                    .filter(storedExperiment => storedExperiment.data !== null)
                    .forEach((storedExperiment) => {
                        const stateItem = this._state[storedExperiment.experiment.getName()];
                        if (stateItem) {
                            stateItem.Action = storedExperiment.data!.Action;
                            stateItem.MetaData = storedExperiment.data!.Metadata;
                        }
                    });

                const experimentsToRequest = [
                    ...storedExperiments
                        .filter(storedExperiment => storedExperiment.data === null)
                        .map(storedExperiment => storedExperiment.experiment),
                    ...experiments.filter(experiment => experiment.isCacheDisabled())
                ];

                if (experimentsToRequest.length > 0) {
                    const body = this.createRequestBody(experimentsToRequest, features);
                    const url = AutomatedExperimentManager._baseUrl + AutomatedExperimentManager._createEndPoint;

                    return this._requestManager.post(url, body)
                        .then((response) => this.parseExperimentsResponse(response))
                        .then((parsedExperiments) => Promise.all([this.storeExperiments(parsedExperiments), this.loadExperiments(parsedExperiments)]).then(() => Promise.resolve()))
                        .catch((err) => {
                            Diagnostics.trigger('failed_to_fetch_automated_experiments', err);
                        });
                }
            });
        });
    }

    public beginExperiment() {
        for (const stateKey in this._state) {
            if (this._state.hasOwnProperty(stateKey)) {
                this._state[stateKey].SendAction = false;
                this._state[stateKey].SendReward = false;
            }
        }

        this._experimentBegan = true;
    }

    public endExperiment(): Promise<void> {
        if (!this._experimentBegan) {
            return Promise.reject('Experiment session not started.');
        }

        this._experimentBegan = false;

        const promises: Promise<INativeResponse>[] = [];
        for (const stateKey in this._state) {
            if (this._state.hasOwnProperty(stateKey)) {
                if (this._state[stateKey].SendAction) {
                    promises.push(this.submit(this._state[stateKey], AutomatedExperimentManager._actionEndPoint));
                }

                promises.push(this.submitExperimentOutcome(this._state[stateKey], AutomatedExperimentManager._rewardEndPoint));
            }
        }

        return Promise.all(promises).then((ignored) => Promise.resolve());
    }

    public sendAction(experiment: AutomatedExperiment, sessionId: string | undefined) {
        if (!this._experimentBegan) {
            return;
        }

        const stateItem = this._state[experiment.getName()];
        if (stateItem) {
            stateItem.SendAction = true;
            this._userInfo.AuctionID = sessionId; // happens to also be the auction ID. Horrible but that all I could find so far.
        }
    }

    public sendReward() {
        if (!this._experimentBegan) {
            return;
        }

        for (const state in this._state) {
            if (this._state.hasOwnProperty(state)) {
                if (this._state[state].SendAction) {
                    this._state[state].SendReward = true;
                }
            }
        }
    }

    public getExperimentAction(experiment: AutomatedExperiment): string|undefined {
        const stateItem = this._state[experiment.getName()];
        if (!stateItem) {
            return undefined;
        }

        return stateItem.Action;
    }

    private submit(item: StateItem, apiEndPoint: string): Promise<INativeResponse> {
        const action = {
            user_info: {
                ab_group: this._userInfo.ABGroup,
                auction_id: this._userInfo.AuctionID,
                game_session_id: this._userInfo.GameSessionID
            },
            experiment: item.getExperiment().getName(),
            action: item.Action
        };

        const url = AutomatedExperimentManager._baseUrl + apiEndPoint;
        const body = JSON.stringify(action);
        return this._requestManager.post(url, body);
    }

    private submitExperimentOutcome(item: StateItem, apiEndPoint: string): Promise<INativeResponse> {
        let rewardVal = 0;
        if (item.SendReward) {
            rewardVal = 1;
        }

        const outcome = {
            user_info: {
                ab_group: this._userInfo.ABGroup,
                auction_id: this._userInfo.AuctionID,
                game_session_id: this._userInfo.GameSessionID
            },
            experiment: item.getExperiment().getName(),
            action: item.Action,
            reward: rewardVal,
            metadata: item.MetaData
        };

        const url = AutomatedExperimentManager._baseUrl + apiEndPoint;
        const body = JSON.stringify(outcome);
        return this._requestManager.post(url, body);
    }

    private loadExperiments(experiments: IParsedExperiment[]): Promise<void> {
        experiments.forEach(experiment => {
            const stateItem = this._state[experiment.name];
            if (stateItem) {
                stateItem.Action = experiment.action;
                stateItem.MetaData = experiment.metadata;
            }
        });
        return Promise.resolve();
    }

    private storeExperiments(experiments: IParsedExperiment[]): Promise<void> {
        experiments.forEach(experiment => {
            this.storeExperimentData(experiment.name, new CachableAutomatedExperimentData(experiment.action, experiment.metadata));
        });
        return Promise.resolve();
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
            { l: 'screenWidth', c: 'screen_width' },
            { l: 'screenHeight', c: 'screen_height' },
            { l: 'screenDensity', c: 'screen_density' },
            { l: 'simulator',  c: undefined },
            { l: 'stores', c: undefined },

            //DEVICE -- BEHAVIOUR
            { l: 'rooted',  c: undefined },
            { l: 'connectionType', c: 'connection_type' },
            { l: 'device_free_space', c: undefined },
            { l: 'headset', c: undefined },
            { l: 'deviceVolume', c: 'device_volume' },
            { l: 'max_volume', c: undefined },
            { l: 'freeMemory', c: 'free_memory' },
            { l: 'totalMemory', c: 'total_memory' },
            { l: 'total_internal_space', c: undefined },
            { l: 'free_external_space', c: undefined },
            { l: 'total_external_space', c: undefined },
            { l: 'batteryLevel', c: 'battery_level' },
            { l: 'batteryStatus', c: 'battery_status' },
            { l: 'usb_connected', c: undefined },
            { l: 'ringer_mode', c: undefined },
            { l: 'network_metered', c: undefined },
            { l: 'screenBrightness', c: 'screen_brightness' },

            // NOT REALLY STATIC, BUT CONCIDERED SO FOR NOW
            { l: 'local_day_time', c: undefined }
        ];

        return Promise.all([
            this._deviceInfo.fetch(),
            this._deviceInfo.getDTO(),
            this._deviceInfo.getFreeSpace(),
            this._deviceInfo instanceof AndroidDeviceInfo ? this._deviceInfo.getFreeSpaceExternal() : Promise.resolve<number | undefined>(undefined),
            this._deviceInfo instanceof AndroidDeviceInfo ? this._deviceInfo.getTotalSpaceExternal() : Promise.resolve<number | undefined>(undefined),
            this._deviceInfo instanceof AndroidDeviceInfo ? this._deviceInfo.getNetworkMetered() : Promise.resolve<boolean | undefined>(undefined),
            this._deviceInfo instanceof AndroidDeviceInfo ? this._deviceInfo.getRingerMode() : Promise.resolve<number | undefined>(undefined),
            this._deviceInfo instanceof AndroidDeviceInfo ? this._deviceInfo.isUSBConnected() : Promise.resolve<boolean | undefined>(undefined),
            new Date(Date.now())
        ]).then((res) => {
            const rawData: { [key: string]: ContextualFeature } = {
               ...res[1],
               ...this._clientInfo.getDTO(),
               ...this._coreConfig.getDTO(),
               'gdpr_enabled': this._privacySDK.isGDPREnabled(),
               'opt_out_Recorded': this._privacySDK.isOptOutRecorded(),
               'opt_out_enabled': this._privacySDK.isOptOutEnabled(),
               'platform': Platform[this._nativeBridge.getPlatform()],
               'stores':  this._deviceInfo.getStores() !== undefined ? this._deviceInfo.getStores().split(',') : undefined,
               'simulator': this._deviceInfo instanceof IosDeviceInfo ? this._deviceInfo.isSimulator() : undefined,
               'total_internal_space': this._deviceInfo.getTotalSpace(),
               'device_free_space': res[2],
               'free_external_space': res[3],
               'total_external_space': res[4],
               'network_metered' : res[5],
               'ringer_mode': res[6] !== undefined ? RingerMode[<RingerMode>res[6]] : undefined,
               'usb_connected' : res[7],
               'max_volume': this._deviceInfo.get('maxVolume'),
               'local_day_time': res[8].getHours() + res[8].getMinutes() / 60
            };

            // do some enum conversions
            if (rawData.hasOwnProperty('batteryStatus')) {
                rawData.batteryStatus = BatteryStatus[<BatteryStatus>rawData.batteryStatus];
            }

            const features: { [key: string]: ContextualFeature } = {};
            filter.forEach(item => {
               if (rawData[item.l] !== undefined) {
                   const name = (item.c !== undefined) ? item.c : item.l;
                   features[ name ] = rawData[item.l] ;
               }
            });

            return features;
        });
    }

    // not used at the moment. but will be soon: when we do an inference / ad display.
    // incomplete implementation
    private async collectAdRelatedFeatures(deviceInfo: DeviceInfo): Promise<{ [key: string]: ContextualFeature }>  {
        const filter = [
            // CAMPAIGN, THE AD
            'campaignId', 'targetGameId', 'rating', 'ratingCount', 'gameSessionCounters', 'cached',

            // MISC
            'videoOrientation'
        ];

        const undefinedValue = new Promise(() => undefined);
        return Promise.all([
            deviceInfo.getScreenWidth(),
            deviceInfo.getScreenHeight()
        ]).then((res) => {
                const rawData: { [key: string]: ContextualFeature } = {
                    'videoOrientation': Orientation[  res[0] >= res[1] ? Orientation.LANDSCAPE : Orientation.PORTRAIT]
            };

            const features: { [key: string]: ContextualFeature } = {};
            filter.forEach(name => {
               if (rawData[name] !== undefined) {
                   features[name] = rawData[name];
               }
            });

            return features;
        });
    }

    private createRequestBody(experiments: AutomatedExperiment[], contextualFeatures: { [key: string]: ContextualFeature}): string {
        return JSON.stringify({
            user_info: {
                ab_group: this._userInfo.ABGroup,
                game_session_id: this._userInfo.GameSessionID
                // auction_id: Left out on purpose, as experiments are used accross multiple actions at the moment
            },
            experiments: experiments.map(e => { return {name: e.getName(), actions: e.getActions()}; }),
            contextual_features: contextualFeatures
        });
    }

    private getStoredExperimentData(e: AutomatedExperiment): Promise<CachableAutomatedExperimentData> {
        return this._storageApi.get<CachableAutomatedExperimentData>(StorageType.PRIVATE, AutomatedExperimentManager._settingsPrefix + '_' + e.getName());
    }

    private storeExperimentData(experimentName: string, data: CachableAutomatedExperimentData) {
        this._storageApi.set<CachableAutomatedExperimentData>(StorageType.PRIVATE, AutomatedExperimentManager._settingsPrefix + '_' + experimentName, data);
        this._storageApi.write(StorageType.PRIVATE);
    }
}
