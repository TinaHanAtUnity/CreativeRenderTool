import { CampaignManager, ILoadedCampaign } from 'Ads/Managers/CampaignManager';
import { AdRequestManager, INotCachedLoadedCampaign } from 'Ads/Managers/AdRequestManager';
import { IPlacementIdMap } from 'Ads/Managers/PlacementManager';
import { INativeResponse } from 'Core/Managers/RequestManager';
import { Placement } from 'Ads/Models/Placement';

export class AdUnitAwareAdRequestManager extends CampaignManager {
    private _adRequestManager: AdRequestManager;
    private _adUnitPlacements: IPlacementIdMap<IPlacementIdMap<INotCachedLoadedCampaign | undefined>> = {};

    constructor(adRequestManager: AdRequestManager) {
        super();

        this._adRequestManager = adRequestManager;
        this._adRequestManager.onAdditionalPlacementsReady.subscribe((adUnitId, additionalPlacements) => this.onAdditionalPlacementsReady(adUnitId, additionalPlacements));
    }

    public request(nofillRetry?: boolean | undefined): Promise<void | INativeResponse> {
        return this._adRequestManager.request(nofillRetry);
    }

    public loadCampaign(placement: Placement): Promise<ILoadedCampaign | undefined> {
        if (!placement.hasAdUnitId()) {
             return this._adRequestManager.loadCampaign(placement);
        }

        const adUnitId = placement.getAdUnitId();
        if (adUnitId === undefined) {
             return this._adRequestManager.loadCampaign(placement);
        }

        if (!(adUnitId in this._adUnitPlacements)) {
             return this._adRequestManager.loadCampaignWithAdditionalPlacement(placement);
        }

        const additionalPlacements = this._adUnitPlacements[adUnitId];
        if (!(placement.getId() in additionalPlacements)) {
             return this._adRequestManager.loadCampaignWithAdditionalPlacement(placement);
        }

        const notCachedLoadedCampaign = additionalPlacements[placement.getId()];
        if (notCachedLoadedCampaign === undefined) {
            return Promise.resolve(undefined);
        }

        return this._adRequestManager.cacheCampaign(notCachedLoadedCampaign);
    }

    public invalidate(): void {
        this._adUnitPlacements = {};
    }

    private onAdditionalPlacementsReady(adUnitId: string | undefined, additionalPlacements: IPlacementIdMap<INotCachedLoadedCampaign | undefined>): void {
        if (adUnitId === undefined) {
            return;
        }

        this._adUnitPlacements[adUnitId] = additionalPlacements;
    }
}
