import { RefreshManager } from 'Ads/Managers/RefreshManager';
import { Campaign } from 'Ads/Models/Campaign';
import { BackupCampaignManager } from 'Ads/Managers/BackupCampaignManager';
import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { INativeResponse } from 'Core/Managers/RequestManager';
import { PlacementState } from 'Ads/Models/Placement';
import { NativePromoEventHandler } from 'Promo/EventHandlers/NativePromoEventHandler';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { IAdsApi } from 'Ads/IAds';
import { CampaignManager } from 'Ads/Managers/CampaignManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { StorageType } from 'Core/Native/Storage';
import { ClientInfo } from 'Core/Models/ClientInfo';

interface ILoadEvent {
    value: string;
    ts: number;
}

export class LoadManager extends RefreshManager {
    private _platform: Platform;
    private _core: ICoreApi;
    private _coreConfig: CoreConfiguration;
    private _ads: IAdsApi;
    private _adsConfig: AdsConfiguration;
    private _campaignManager: CampaignManager;
    private _clientInfo: ClientInfo;

    constructor(platform: Platform, core: ICoreApi, coreConfig: CoreConfiguration, ads: IAdsApi, adsConfig: AdsConfiguration, campaignManager: CampaignManager, clientInfo: ClientInfo) {
        super();

        this._platform = platform;
        this._core = core;
        this._coreConfig = coreConfig;
        this._ads = ads;
        this._adsConfig = adsConfig;
        this._campaignManager = campaignManager;
        this._clientInfo = clientInfo;

        this._core.Storage.onSet.subscribe((type, value) => this.onStorageSet(type, value));
    }

    public getCampaign(placementId: string): Campaign | undefined {
        return undefined;
    }

    public setCurrentAdUnit(adUnit: AbstractAdUnit): void {
    }

    public refresh(nofillRetry?: boolean): Promise<INativeResponse | void> {
        // todo: implement method
        return Promise.resolve(undefined);
    }

    public refreshWithBackupCampaigns(backupCampaignManager: BackupCampaignManager): Promise<(INativeResponse | void)[]> {
        return Promise.all([this.refreshStoredLoads()]);
    }

    public shouldRefill(timestamp: number): boolean {
        return false;
    }

    public setPlacementState(placementId: string, placementState: PlacementState): void {
    }

    public sendPlacementStateChanges(placementId: string): void {
    }

    public setPlacementStates(placementState: PlacementState, placementIds: string[]): void {
    }

    public subscribeNativePromoEvents(eventHandler: NativePromoEventHandler): void {
    }

    public refreshStoredLoads(): Promise<void> {
        return this._core.Storage.getKeys(StorageType.PUBLIC, 'load', false).then(keys => {
            if(keys && keys.length > 0) {
                for(const key of keys) {
                    this._core.Storage.get<ILoadEvent>(StorageType.PUBLIC, 'load.' + key).then(loadEvent => {
                        if(loadEvent.ts && loadEvent.ts > this._clientInfo.getInitTimestamp()) { // ignore loads before SDK init
                            this.loadPlacement(loadEvent.value);
                        }
                    }).catch(() => {
                        // ignore error
                    });
                }

                this._core.Storage.delete(StorageType.PUBLIC, 'load');
                this._core.Storage.write(StorageType.PUBLIC);
            } else {
                return undefined;
            }
        }).catch(() => {
            // no keys found, no error
            return undefined;
        });
    }

    private loadPlacement(placementId: string) {
        this._campaignManager.loadCampaign(this._adsConfig.getPlacement(placementId), 10000).then(campaign => {
            if(campaign) {
                // todo: set placement ready
            } else {
                // todo: set placement to no fill
            }
        });
    }

    private onStorageSet(type: string, event: any) {
        if(event && event.hasOwnProperty('load')) {
            Object.keys(event.load).forEach(key => {
                const loadEvent: ILoadEvent = event.load[key];
                this.loadPlacement(loadEvent.value); // todo: validate that "value" is a valid placement
            });
        }
    }
}
