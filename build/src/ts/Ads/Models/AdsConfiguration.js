import { CacheMode } from 'Core/Models/CoreConfiguration';
import { Model } from 'Core/Models/Model';
export class AdsConfiguration extends Model {
    constructor(data) {
        super('Configuration', AdsConfiguration.Schema, data);
    }
    getCacheMode() {
        return this.get('cacheMode');
    }
    getPlacement(placementId) {
        return this.getPlacements()[placementId];
    }
    removePlacements(ids) {
        const placements = this.getPlacements();
        ids.forEach((id) => {
            delete placements[id];
        });
        this.set('placements', placements);
    }
    getPlacementIds() {
        const placementIds = [];
        for (const placement in this.getPlacements()) {
            if (this.getPlacements().hasOwnProperty(placement)) {
                placementIds.push(placement);
            }
        }
        return placementIds;
    }
    getPlacements() {
        return this.get('placements');
    }
    getPlacementCount() {
        if (!this.getPlacements()) {
            return 0;
        }
        let count = 0;
        for (const placement in this.getPlacements()) {
            if (this.getPlacements().hasOwnProperty(placement)) {
                count++;
            }
        }
        return count;
    }
    getDefaultPlacement() {
        return this.get('defaultPlacement');
    }
    getDefaultBannerPlacement() {
        return this.get('defaultBannerPlacement');
    }
    getPlacementsForAdunit(adUnitId) {
        const placements = this.getPlacements();
        return Object.keys(placements)
            .map((placementId) => placements[placementId])
            .filter(placement => placement.hasAdUnitId() && placement.getAdUnitId() === adUnitId)
            .map((placement) => placement.getId());
    }
    getPlacementsForGroupId(groupId) {
        const placements = this.getPlacements();
        return Object.keys(placements)
            .map((placementId) => placements[placementId])
            .filter(placement => placement.hasGroupId() && placement.getGroupId() === groupId)
            .map((placement) => placement.getId());
    }
    getHidePrivacy() {
        return this.get('hidePrivacy');
    }
    getHasArPlacement() {
        return this.get('hasArPlacement');
    }
    isLoadV5Enabled() {
        return this.get('loadV5Enabled');
    }
    getDTO() {
        const placements = [];
        for (const placement in this.getPlacements()) {
            if (this.getPlacements().hasOwnProperty(placement)) {
                placements.push(this.getPlacements()[placement].getDTO());
            }
        }
        let defaultPlacementId;
        const defaultPlacement = this.getDefaultPlacement();
        if (defaultPlacement) {
            defaultPlacementId = defaultPlacement.getId();
        }
        return {
            'cacheMode': CacheMode[this.getCacheMode()].toLowerCase(),
            'placements': placements,
            'defaultPlacement': defaultPlacementId
        };
    }
}
AdsConfiguration.Schema = {
    cacheMode: ['number'],
    placements: ['object'],
    defaultPlacement: ['object'],
    defaultBannerPlacement: ['string', 'undefined'],
    hidePrivacy: ['boolean', 'undefined'],
    hasArPlacement: ['boolean'],
    loadV5Enabled: ['boolean']
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRzQ29uZmlndXJhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9BZHMvTW9kZWxzL0Fkc0NvbmZpZ3VyYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQzFELE9BQU8sRUFBVyxLQUFLLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQThCbkQsTUFBTSxPQUFPLGdCQUFpQixTQUFRLEtBQXdCO0lBVzFELFlBQVksSUFBdUI7UUFDL0IsS0FBSyxDQUFDLGVBQWUsRUFBRSxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDMUQsQ0FBQztJQUVNLFlBQVk7UUFDZixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUVNLFlBQVksQ0FBQyxXQUFtQjtRQUNuQyxPQUFPLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBRU0sZ0JBQWdCLENBQUMsR0FBYTtRQUNqQyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDeEMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFO1lBQ2YsT0FBTyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDMUIsQ0FBQyxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRU0sZUFBZTtRQUNsQixNQUFNLFlBQVksR0FBYSxFQUFFLENBQUM7UUFDbEMsS0FBSyxNQUFNLFNBQVMsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFLEVBQUU7WUFDMUMsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxFQUFFO2dCQUNoRCxZ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