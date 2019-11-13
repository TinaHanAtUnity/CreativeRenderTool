import { INativeResponse, RequestManager } from 'Core/Managers/RequestManager';
import { JsonParser } from 'Core/Utilities/JsonParser';
import { ICore } from 'Core/ICore';
import { StorageType, StorageApi } from 'Core/Native/Storage';
import { AutomatedExperiment } from 'Ads/Models/AutomatedExperiment';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { ABGroup } from 'Core/Models/ABGroup';
import { Double } from 'Core/Utilities/Double';

interface IAutomatedExperimentResponse {
    experiments: { [key: string]: string };
    metadata: { [key: string]: string };
}

interface IParsedExperiment {
    name: string;
    action: string;
    metadata: string;
}

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

class CachableExperimentData {
    constructor(action: string, metadata: string) {
        this.Action = action;
        this.Metadata = metadata;
    }

    public Action: string;
    public Metadata: string;
}

export class AutomatedExperimentManager {
    private readonly _requestManager: RequestManager;
    private readonly _storageApi: StorageApi;

    private readonly _state: { [key: string]: StateItem } = {};
    private _experimentBegan = false;
    private _ABGroup: ABGroup = -1;

    private static readonly _baseUrl = 'https://auiopt.unityads.unity3d.com/v1/';
    private static readonly _createEndPoint = 'experiment';
    private static readonly _actionEndPoint = 'action';
    private static readonly _rewardEndPoint = 'reward';
    private static readonly _settingsPrefix = 'AUI_OPT_EXPERIMENT';

        constructor(requestManager: RequestManager, storageApi: StorageApi) {
        this._requestManager = requestManager;
        this._storageApi = storageApi;
    }

    public initialize(experiments: AutomatedExperiment[], core: ICore): Promise<void> {
        const storedExperimentsPromise = experiments
            .filter(experiment => !experiment.isCacheDisabled())
            .map(experiment => this.getStoredExperimentData(experiment)
                .then((storedExperimentData) => ({ experiment, data : storedExperimentData }))
                .catch(() => ({experiment, data: null}))
            );

        const contextualFeatPromise = this.CollectContextualFeatures(core);

        experiments.forEach(experiment => {
            this._state[experiment.getName()] = new StateItem(experiment, experiment.getDefaultAction());
        });

        return contextualFeatPromise.then(features => {
              this._ABGroup = core.Config.getAbGroup();

              Promise.all(storedExperimentsPromise).then(storedExperiments => {
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
                    const body = AutomatedExperimentManager.createRequestBody(experimentsToRequest, features, this._ABGroup);
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

    public sendAction(experiment: AutomatedExperiment) {
        if (!this._experimentBegan) {
            return;
        }

        const stateItem = this._state[experiment.getName()];
        if (stateItem) {
            stateItem.SendAction = true;
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
            experiment: item.getExperiment().getName(),
            action: item.Action
        };

        const url = AutomatedExperimentManager._baseUrl + apiEndPoint;
        return this._requestManager.post(url, JSON.stringify(action));
    }

    private submitExperimentOutcome(item: StateItem, apiEndPoint: string): Promise<INativeResponse> {
        let rewardVal = 0;
        if (item.SendReward) {
            rewardVal = 1;
        }

        const outcome = {
            user_info: { ab_Group: this._ABGroup },
            experiment: item.getExperiment().getName(),
            action: item.Action,
            Reward: rewardVal,
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
            this.storeExperimentData(experiment.name, new CachableExperimentData(experiment.action, experiment.metadata));
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
                    metadata: json.metadata[experiment]
                }));
            } catch (e) {
                Diagnostics.trigger('failed_to_parse_automated_experiments', e);
                return [];
            }
        } else {
            throw new Error('Failed to fetch response from aui service');
        }
    }

    private CollectContextualFeatures(core: ICore): Promise<{ [key: string]: unknown }> {
        return Promise.all<unknown>([
            core.DeviceInfo.getHeadset().catch((err) => { Diagnostics.trigger('failed_to_determine_headset_presence', err); return null; }),
            core.DeviceInfo.getDeviceVolume().catch((err) => { Diagnostics.trigger('failed_to_determine_volume_level', err); return null; })
        ]).then(([
            headset,
            deviceVolume
        ]) => {
            return {
                'timeZone': core.DeviceInfo.getTimeZone(),
                'headset': headset,
                'language': core.DeviceInfo.getLanguage(),
                'deviceVolume': deviceVolume
            };
        });
    }

    private static createRequestBody(experiments: AutomatedExperiment[], contextualFeatures: { [key: string]: string | Double | number }, abGroup: ABGroup): string {
        return JSON.stringify({
            user_info: { ab_Group: abGroup },
            experiments: experiments.map(e => { return {name: e.getName(), actions: e.getActions()}; }),
            contextual_features: contextualFeatures
        });
    }

    private getStoredExperimentData(e: AutomatedExperiment): Promise<CachableExperimentData> {
        return this._storageApi.get<CachableExperimentData>(StorageType.PRIVATE, AutomatedExperimentManager._settingsPrefix + '_' + e.getName());
    }

    private storeExperimentData(experimentName: string, data: CachableExperimentData) {
        this._storageApi.set<CachableExperimentData>(StorageType.PRIVATE, AutomatedExperimentManager._settingsPrefix + '_' + experimentName, data);
        this._storageApi.write(StorageType.PRIVATE);
    }
}
