import { INativeResponse, RequestManager } from 'Core/Managers/RequestManager';
import { JsonParser } from 'Core/Utilities/JsonParser';
import { ICore } from 'Core/ICore';
import { StorageType, StorageApi } from 'Core/Native/Storage';
import { AutomatedExperiment } from 'Ads/Models/AutomatedExperiment';
import { Diagnostics } from 'Core/Utilities/Diagnostics';

interface IAutomatedExperimentResponse {
    experiments: { [key: string]: string };
}

interface IParsedExperiment {
    name: string;
    action: string;
}

class StateItem {
    constructor(experiment: AutomatedExperiment, action: string) {
        this.Experiment = experiment;
        this.Action = action;
    }

    public Experiment: AutomatedExperiment;
    public Action: string;
    public SendReward = false;
    public SendAction = false;
}

export class AutomatedExperimentManager {
    private readonly _requestManager: RequestManager;
    private readonly _storageApi: StorageApi;

    private readonly _state: { [key: string]: StateItem } = {};
    private _experimentBegan = false;

    private static readonly _baseUrl = 'https://auiopt.unityads.unity3d.com/v1/';
    private static readonly _createEndPoint = 'experiment';
    private static readonly _actionEndPoint = 'action';
    private static readonly _rewardEndPoint = 'reward';
    private static readonly _settingsPrefix = 'AUI_OPT_EXPERIMENT';

    constructor(requestManager: RequestManager, storageApi: StorageApi) {
        this._requestManager = requestManager;
        this._storageApi = storageApi;
    }

    public initialize(experiments: AutomatedExperiment[]): Promise<void> {
        const storedActionsPromise = experiments
            .filter(experiment => !experiment.isCacheDisabled())
            .map(experiment => this.getStoredExperimentAction(experiment)
                .then((action) => ({ experiment, action }))
                .catch(() => ({experiment, action: null}))
            );

        experiments.forEach(experiment => {
            this._state[experiment.getName()] = new StateItem(experiment, experiment.getDefaultAction());
        });

        return Promise.all(storedActionsPromise).then(storedActions => {
            storedActions
                .filter(storedAction => storedAction.action !== null)
                .forEach((storedAction) => {
                    const stateItem = this._state[storedAction.experiment.getName()];
                    if (stateItem) {
                        stateItem.Action = storedAction.action!;
                    }
                });

            const experimentsToRequest = [
                ...storedActions.filter(storedAction => storedAction.action === null).map(storedAction => storedAction.experiment),
                ...experiments.filter(experiment => experiment.isCacheDisabled())
            ];

            if (experimentsToRequest.length > 0) {
                const body = AutomatedExperimentManager.createRequestBody(experimentsToRequest);
                const url = AutomatedExperimentManager._baseUrl + AutomatedExperimentManager._createEndPoint;

                return this._requestManager.post(url, body)
                    .then((response) => this.parseExperimentsResponse(response))
                    .then((parsedExperiments) => Promise.all([this.storeExperiments(parsedExperiments), this.loadExperiments(parsedExperiments)]).then(() => Promise.resolve()))
                    .catch((err) => {
                        Diagnostics.trigger('failed_to_fetch_automated_experiments', err);
                    });
            }
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
                if (this._state[stateKey].SendReward) {
                    promises.push(this.submit(this._state[stateKey], AutomatedExperimentManager._rewardEndPoint));
                }
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
            experiment: item.Experiment.getName(),
            action: item.Action
        };

        const url = AutomatedExperimentManager._baseUrl + apiEndPoint;
        return this._requestManager.post(url, JSON.stringify(action));
    }

    private loadExperiments(experiments: IParsedExperiment[]): Promise<void> {
        experiments.forEach(experiment => {
            const stateItem = this._state[experiment.name];
            if (stateItem) {
                stateItem.Action = experiment.action;
            }
        });
        return Promise.resolve();
    }

    private storeExperiments(experiments: IParsedExperiment[]): Promise<void> {
        experiments.forEach(experiment => this.storeExperimentAction(experiment.name, experiment.action));
        return Promise.resolve();
    }

    private parseExperimentsResponse(response: INativeResponse): IParsedExperiment[] {
        if (response && response.responseCode === 200) {
            let json: IAutomatedExperimentResponse;
            try {
                json = JsonParser.parse<IAutomatedExperimentResponse>(response.response);
                return Object.keys(json.experiments).map(experiment => ({
                    name: experiment,
                    action: json.experiments[experiment]
                }));
            } catch (e) {
                Diagnostics.trigger('failed_to_parse_automated_experiments', e);
                return [];
            }
        } else {
            throw new Error('Failed to fetch response from aui service');
        }
    }

    private static createRequestBody(experiments: AutomatedExperiment[]): string {
        return JSON.stringify({
            experiments: experiments.map(e => { return {name: e.getName(), actions: e.getActions()}; })
        });
    }

    private getStoredExperimentAction(e: AutomatedExperiment): Promise<string> {
        return this._storageApi.get<string>(StorageType.PRIVATE, AutomatedExperimentManager._settingsPrefix + '_' + e.getName());
    }

    private storeExperimentAction(experimentName: string, action: string) {
        this._storageApi.set<string>(StorageType.PRIVATE, AutomatedExperimentManager._settingsPrefix + '_' + experimentName, action);
        this._storageApi.write(StorageType.PRIVATE);
    }
}
