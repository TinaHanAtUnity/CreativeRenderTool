import { RefreshManager } from 'Ads/Managers/RefreshManager';
import { Campaign } from 'Ads/Models/Campaign';
import { BackupCampaignManager } from 'Ads/Managers/BackupCampaignManager';
import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { INativeResponse } from 'Core/Managers/RequestManager';
import { Placement, PlacementState } from 'Ads/Models/Placement';
import { NativePromoEventHandler } from 'Promo/EventHandlers/NativePromoEventHandler';
import { ICoreApi } from 'Core/ICore';
import { IAdsApi } from 'Ads/IAds';
import { CampaignManager } from 'Ads/Managers/CampaignManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { StorageType } from 'Core/Native/Storage';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { FocusManager } from 'Core/Managers/FocusManager';

export interface ILoadEvent {
    value: string; // PlacementID for the loaded placement
    ts: number; // Set by metadata api on the native level
}

export interface ILoadStorageEvent {
    load?: { [key: string]: ILoadEvent };
}

export class PerPlacementLoadManager extends RefreshManager {
    private _core: ICoreApi;
    private _ads: IAdsApi;
    private _adsConfig: AdsConfiguration;
    private _campaignManager: CampaignManager;
    private _clientInfo: ClientInfo;
    private _focusManager: FocusManager;

    constructor(core: ICoreApi, ads: IAdsApi, adsConfig: AdsConfiguration, campaignManager: CampaignManager, clientInfo: ClientInfo, focusManager: FocusManager) {
        super();

        this._core = core;
        this._ads = ads;
        this._adsConfig = adsConfig;
        this._campaignManager = campaignManager;
        this._clientInfo = clientInfo;
        this._focusManager = focusManager;

        this._core.Storage.onSet.subscribe((type, value) => this.onStorageSet(<ILoadStorageEvent>value));
        this._focusManager.onAppForeground.subscribe(() => this.refresh());
        this._focusManager.onActivityResumed.subscribe((activity) => this.refresh());
    }

    public getCampaign(placementId: string): Campaign | undefined {
        const placement = this._adsConfig.getPlacement(placementId);
        if(placement) {
            return placement.getCurrentCampaign();
        }

        return undefined;
    }

    public setCurrentAdUnit(adUnit: AbstractAdUnit, placement: Placement): void {
        placement.setCurrentCampaign(undefined);
        this.setPlacementState(placement.getId(), PlacementState.NOT_AVAILABLE);
    }

    public refresh(nofillRetry?: boolean): Promise<INativeResponse | void> {
        this.invalidateExpiredCampaigns();

        return Promise.resolve(undefined);
    }

    public refreshWithBackupCampaigns(backupCampaignManager: BackupCampaignManager): Promise<(INativeResponse | void)[]> {
        return Promise.all([this.refreshStoredLoads()]);
    }

    public shouldRefill(timestamp: number): boolean {
        return false;
    }

    public setPlacementState(placementId: string, placementState: PlacementState): void {
        const placement = this._adsConfig.getPlacement(placementId);
        placement.setState(placementState);

        this.sendPlacementStateChanges(placementId);
    }

    public sendPlacementStateChanges(placementId: string): void {
        const placement = this._adsConfig.getPlacement(placementId);
        if(placement.getPlacementStateChanged()) {
            placement.setPlacementStateChanged(false);
            this._ads.Placement.setPlacementState(placementId, placement.getState());
            this._ads.Listener.sendPlacementStateChangedEvent(placementId, PlacementState[placement.getPreviousState()], PlacementState[placement.getState()]);
        }
        if(placement.getState() === PlacementState.READY) {
            this._ads.Listener.sendReadyEvent(placementId);
        }
    }

    public setPlacementStates(placementState: PlacementState, placementIds: string[]): void {
        // todo: implement method or remove from parent class
    }

    public subscribeNativePromoEvents(eventHandler: NativePromoEventHandler): void {
        // todo: implement method or remove from parent class
    }

    private refreshStoredLoads(): Promise<void> {
        return this.getStoredLoads().then(storedLoads => {
            this._adsConfig.getPlacementIds().forEach(placementId => {
                if(!this._adsConfig.getPlacement(placementId).isBannerPlacement()) {
                    if(storedLoads.indexOf(placementId) !== -1) {
                        this.loadPlacement(placementId);
                    }
                }
            });
        });
    }

    private loadPlacement(placementId: string) {
        const placement = this._adsConfig.getPlacement(placementId);
        if (placement && this.shouldLoadCampaignForPlacment(placement)) {
            this.setPlacementState(placementId, PlacementState.WAITING);
            this._campaignManager.loadCampaign(placement, 10000).then(loadedCampaign => {
                if (loadedCampaign) {
                    placement.setCurrentCampaign(loadedCampaign.campaign);
                    placement.setCurrentTrackingUrls(loadedCampaign.trackingUrls);
                    this.setPlacementState(placementId, PlacementState.READY);
                } else {
                    this.setPlacementState(placementId, PlacementState.NO_FILL);
                }
            });
        }
    }

    /**
     *  Returns true if a new campaign should be fetched for the given placement.
     *  A new campaign is not fetched when the Campaign is Ready and Unexpired, or if it's Waiting to be filled.
     */
    private shouldLoadCampaignForPlacment(placement: Placement): boolean {
        const isReadyPlacement = placement.getState() === PlacementState.READY;
        const campaign = placement.getCurrentCampaign();
        const isExpiredCampaign = !!(campaign && campaign.isExpired());
        const isReadyAndUnexpired = isReadyPlacement && !isExpiredCampaign;
        const isWaitingForLoadResponse = placement.getState() === PlacementState.WAITING;
        return !(isReadyAndUnexpired || isWaitingForLoadResponse);
    }

    private getStoredLoads(): Promise<string[]> {
        return this._core.Storage.getKeys(StorageType.PUBLIC, 'load', false).then(keys => {
            if(keys && keys.length > 0) {
                const promises = [];

                for(const key of keys) {
                    promises.push(this.getStoredLoad(key));
                    this.deleteStoredLoad(key);
                }

                return Promise.all(promises).then(storedLoads => {
                    const validLoads: string[] = [];
                    for(const load of storedLoads) {
                        if(load) {
                            validLoads.push(load);
                        }
                    }

                    return validLoads;
                });
            } else {
                return [];
            }
        }).catch(() => {
            // no keys found, no error
            return Promise.resolve([]);
        });
    }

    private getStoredLoad(key: string): Promise<string | undefined> {
        return this._core.Storage.get<ILoadEvent>(StorageType.PUBLIC, 'load.' + key).then(loadEvent => {
            if(loadEvent.ts && loadEvent.ts > this._clientInfo.getInitTimestamp() - 60000) { // Ignore loads set more than 60 seconds prior to SDK initialization
                return loadEvent.value;
            } else {
                return undefined;
            }
        }).catch(() => {
            return Promise.resolve(undefined);
        });
    }

    private deleteStoredLoad(key: string): Promise<void[]> {
        const promises = [];
        promises.push(this._core.Storage.delete(StorageType.PUBLIC, 'load.' + key));
        promises.push(this._core.Storage.write(StorageType.PUBLIC));
        return Promise.all(promises);
    }

    private onStorageSet(event: ILoadStorageEvent) {
        if(event && event.load) {
            const loadedEvents = event.load;
            Object.keys(event.load).forEach(key => {
                if (loadedEvents[key]) {
                    const loadEvent: ILoadEvent = loadedEvents[key];
                    const placement: Placement = this._adsConfig.getPlacement(loadEvent.value);

                    if (placement && (placement.getState() === PlacementState.NO_FILL || placement.getState() === PlacementState.NOT_AVAILABLE)) {
                        this.loadPlacement(loadEvent.value);
                    }
                }
                this.deleteStoredLoad(key);
            });
        }
    }

    private invalidateExpiredCampaigns() {
        for(const placementId of this._adsConfig.getPlacementIds()) {
            const placement = this._adsConfig.getPlacement(placementId);

            if(placement && placement.getState() === PlacementState.READY) {
                const campaign = placement.getCurrentCampaign();

                if(campaign && campaign.isExpired()) {
                    placement.setCurrentCampaign(undefined);
                    this.setPlacementState(placement.getId(), PlacementState.NOT_AVAILABLE);
                }
            }
        }
    }
}
