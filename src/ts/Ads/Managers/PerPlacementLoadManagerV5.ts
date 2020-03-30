import { IAdsApi } from 'Ads/IAds';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { FocusManager } from 'Core/Managers/FocusManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { Campaign, ICampaignTrackingUrls } from 'Ads/Models/Campaign';
import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { Placement, PlacementState } from 'Ads/Models/Placement';
import { INativeResponse } from 'Core/Managers/RequestManager';
import { AdRequestManager } from 'Ads/Managers/AdRequestManager';
import { Observables } from 'Core/Utilities/Observables';
import { PerPlacementLoadManager } from 'Ads/Managers/PerPlacementLoadManager';
import { LoadV5, SDKMetrics } from 'Ads/Utilities/SDKMetrics';

export class PerPlacementLoadManagerV5 extends PerPlacementLoadManager {
    protected _adRequestManager: AdRequestManager;

    private _shouldRefresh: boolean = true;

    constructor(ads: IAdsApi, adsConfig: AdsConfiguration, coreConfig: CoreConfiguration, adRequestManager: AdRequestManager, clientInfo: ClientInfo, focusManager: FocusManager) {
        super(ads, adsConfig, coreConfig, adRequestManager, clientInfo, focusManager);

        this._adRequestManager = adRequestManager;

        this._adRequestManager.onCampaign.subscribe((placementId, campaign, trackingUrls) => this.onCampaign(placementId, campaign, trackingUrls));
        this._adRequestManager.onNoFill.subscribe((placementId) => this.onNoFill(placementId));
    }

    public setCurrentAdUnit(adUnit: AbstractAdUnit, placement: Placement): void {
        this._shouldRefresh = true;

        Observables.once(adUnit.onStartProcessed, () => {
            // Aids in supplying comet a suitable amount of time to process start event
            setTimeout(() => {
                if (adUnit.isCached()) {
                    this.attemptStartRefresh(placement.getId());
                }
            }, 5000);
        });

        // Refreshes after playback to ensure the least amount of issues while streaming ad content
        Observables.once(adUnit.onClose, () => {
            this.attemptStartRefresh(placement.getId());
        });

        Observables.once(adUnit.onFinish, () => {
            this.attemptStartRefresh(placement.getId());
        });

        super.setCurrentAdUnit(adUnit, placement);
    }

    public refresh(nofillRetry?: boolean): Promise<INativeResponse | void> {
        return this.invalidateExpiredCampaigns();
    }

    public initialize(): Promise<INativeResponse | void> {
        return this._adRequestManager.requestPreload();
    }

    protected loadPlacement(placementId: string, count: number) {
        // If by some reason at the time of load request we don't have preload data
        // we would trigger preload requests and load requests after.
        // It would make sense to use reload request here, however it would require some refactoring,
        // which will be done later.
        if (this._adRequestManager.hasPreloadFailed()) {
            SDKMetrics.reportMetricEvent(LoadV5.LoadCampaignWithPreloadData);
            return this._adRequestManager.requestPreload().then(() => {
                super.loadPlacement(placementId, count);
            }).catch((err) => {
                // If preload request failed, therefore we cannot make load request.
                // Therefore we should report no fill, so that we do not cause any timeout.
                this.setPlacementState(placementId, PlacementState.WAITING);
                this.setPlacementState(placementId, PlacementState.NO_FILL);
            });
        } else {
            return super.loadPlacement(placementId, count);
        }
    }

    private invalidateStart(placementId: string) {
        this._adRequestManager.requestReload(this._adsConfig.getPlacementIds()
            .filter((x) => x !== placementId)
            .filter((x) => this.isPlacementActive(x)));
    }

    private isPlacementActive(placement: string) {
        return this._adsConfig.getPlacement(placement).getState() === PlacementState.READY
            || this._adsConfig.getPlacement(placement).getState() === PlacementState.WAITING;
    }

    protected invalidateExpiredCampaigns(): Promise<void> {
        if (this._adRequestManager.isPreloadDataExpired()) {
            SDKMetrics.reportMetricEvent(LoadV5.RefreshManagerPreloadDataExpired);
        }

        for (const placementId of this._adsConfig.getPlacementIds()) {
            const placement = this._adsConfig.getPlacement(placementId);

            if (placement && placement.getState() === PlacementState.READY) {
                const campaign = placement.getCurrentCampaign();

                if (campaign && campaign.isExpired()) {
                    SDKMetrics.reportMetricEvent(LoadV5.RefreshManagerCampaignExpired);
                    placement.setCurrentCampaign(undefined);
                    this.setPlacementState(placement.getId(), PlacementState.NOT_AVAILABLE);
                }
            }
        }

        return Promise.resolve();
    }

    private attemptStartRefresh(placementId: string): void {
        if (this._shouldRefresh) {
            this._shouldRefresh = false;
            this.invalidateStart(placementId);
        }
    }

    private onCampaign(placementId: string, campaign: Campaign, trackingUrls: ICampaignTrackingUrls | undefined): void {
        const placement = this._adsConfig.getPlacement(placementId);

        if (placement) {
            placement.setCurrentCampaign(campaign);
            placement.setCurrentTrackingUrls(trackingUrls);
        }
    }

    private onNoFill(placementId: string): void {
        const placement = this._adsConfig.getPlacement(placementId);

        if (placement) {
            SDKMetrics.reportMetricEvent(LoadV5.RefreshManagerCampaignFailedToInvalidate);
            placement.setCurrentCampaign(undefined);
            placement.setCurrentTrackingUrls(undefined);
            this.setPlacementState(placementId, PlacementState.NO_FILL);
        }
    }
}
