import { IAdsApi } from 'Ads/IAds';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { FocusManager } from 'Core/Managers/FocusManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { Campaign, ICampaignTrackingUrls } from 'Ads/Models/Campaign';
import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { Placement, PlacementState } from 'Ads/Models/Placement';
import { INativeResponse } from 'Core/Managers/RequestManager';
import { AdRequestManager, INotCachedLoadedCampaign } from 'Ads/Managers/AdRequestManager';
import { Observables } from 'Core/Utilities/Observables';
import { PerPlacementLoadManager } from 'Ads/Managers/PerPlacementLoadManager';
import { LoadV5, SDKMetrics } from 'Ads/Utilities/SDKMetrics';
import { PerformanceAdUnitFactory } from 'Performance/AdUnits/PerformanceAdUnitFactory';
import { AdUnitAwareAdRequestManager } from 'Ads/Managers/AdUnitAwareAdRequestManager';
import { LoadAndFillEventManager } from 'Ads/Managers/LoadAndFillEventManager';

export class PerPlacementLoadManagerV5 extends PerPlacementLoadManager {
    protected _adRequestManager: AdRequestManager;

    private _shouldRefresh: boolean = true;
    protected _lastShownCampaignId: string | undefined;

    constructor(ads: IAdsApi, adsConfig: AdsConfiguration, coreConfig: CoreConfiguration, adRequestManager: AdRequestManager, clientInfo: ClientInfo, focusManager: FocusManager, useGroupIds: boolean, loadAndFillEventManager: LoadAndFillEventManager) {
        super(ads, adsConfig, coreConfig, useGroupIds ? new AdUnitAwareAdRequestManager(adRequestManager) : adRequestManager, clientInfo, focusManager, loadAndFillEventManager);

        this._adRequestManager = adRequestManager;

        this._adRequestManager.onCampaign.subscribe((placementId, campaign, trackingUrls) => this.onCampaign(placementId, campaign, trackingUrls));
        this._adRequestManager.onNoFill.subscribe((placementId) => this.onNoFill(placementId));
    }

    public setCurrentAdUnit(adUnit: AbstractAdUnit, placement: Placement): void {
        this._shouldRefresh = true;

        const campaign = placement.getCurrentCampaign();
        if (campaign) {
            this._lastShownCampaignId = campaign.getUniqueId();
        }

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
        if (this._adRequestManager.isPreloadDataExpired()) {
            this.invalidateActivePlacements();
        }

        // If by some reason at the time of load request we don't have preload data
        // we would trigger preload requests and load requests after.
        // It would make sense to use reload request here, however it would require some refactoring,
        // which will be done later.
        if (this._adRequestManager.hasPreloadFailed()) {
            return this._adRequestManager.requestPreload().then(() => {
                super.loadPlacement(placementId, count);
            }).catch((err) => {
                // If preload request failed, therefore we cannot make load request.
                // Therefore we should report no fill, so that we do not cause any timeout.

                this._loadAndFillEventManager.sendLoadTrackingEvents(placementId);
                this.setPlacementState(placementId, PlacementState.WAITING);
                this.setPlacementState(placementId, PlacementState.NO_FILL);
            });
        } else {
            return super.loadPlacement(placementId, count);
        }
    }

    protected invalidateExpiredCampaigns(): Promise<void> {
        if (this._adRequestManager.isPreloadDataExpired()) {
            return this.invalidateActivePlacements();
        }

        for (const placementId of this._adsConfig.getPlacementIds()) {
            const placement = this._adsConfig.getPlacement(placementId);

            if (placement && placement.getState() === PlacementState.READY) {
                const campaign = placement.getCurrentCampaign();

                if (campaign && campaign.isExpired()) {
                    this._adRequestManager.reportMetricEvent(LoadV5.RefreshManagerCampaignExpired);
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
            this.invalidateActivePlacements(placementId);
        }
    }

    private invalidateActivePlacements(excludePlacementId?: string): Promise<void> {
        if (this._campaignManager instanceof AdUnitAwareAdRequestManager) {
            this._campaignManager.invalidate();
        }

        const placementToReload: string[] = [];

        for (const placementId of this._adsConfig.getPlacementIds()) {
            if (excludePlacementId && excludePlacementId === placementId) {
                continue;
            }

            const placement = this._adsConfig.getPlacement(placementId);

            if (placement && this.isPlacementActive(placement)) {
                placement.setInvalidationPending(true);
                placementToReload.push(placement.getId());
            }
        }

        return this._adRequestManager.requestReload(placementToReload);
    }

    private isPlacementActive(placement: Placement) {
        return placement.getState() === PlacementState.READY
            || placement.getState() === PlacementState.WAITING;
    }

    private onCampaign(placementId: string, campaign: Campaign, trackingUrls: ICampaignTrackingUrls | undefined): void {
        const placement = this._adsConfig.getPlacement(placementId);

        if (placement) {
            placement.setCurrentCampaign(campaign);
            placement.setCurrentTrackingUrls(trackingUrls);
            placement.setInvalidationPending(false);
        }
    }

    protected onNoFill(placementId: string): void {
        const placement = this._adsConfig.getPlacement(placementId);

        if (placement) {
            placement.setInvalidationPending(false);

            let shouldInvalidate = true;

                // Invalidate only Direct Demand campaigns, we would like to show old programmatic campaign.
            const campaign = placement.getCurrentCampaign();
            if (campaign) {
                const contentType = campaign.getContentType();
                switch (contentType) {
                    case PerformanceAdUnitFactory.ContentType:
                    case PerformanceAdUnitFactory.ContentTypeMRAID:
                    case PerformanceAdUnitFactory.ContentTypeVideo:
                        shouldInvalidate = true;
                        break;
                    default:
                        shouldInvalidate = false;
                }

                if (!shouldInvalidate && this._lastShownCampaignId && campaign.getUniqueId() === this._lastShownCampaignId) {
                    this._adRequestManager.reportMetricEvent(LoadV5.RefreshManagerForcedToInvalidate);
                    shouldInvalidate = true;
                }
            }

            if (shouldInvalidate) {
                this._adRequestManager.reportMetricEvent(LoadV5.RefreshManagerCampaignFailedToInvalidate);
                placement.setCurrentCampaign(undefined);
                placement.setCurrentTrackingUrls(undefined);
                this.setPlacementState(placementId, PlacementState.NO_FILL);
            }
        }
    }
}
