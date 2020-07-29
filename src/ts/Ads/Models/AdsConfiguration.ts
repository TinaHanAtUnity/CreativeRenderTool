import { IRawPlacement, Placement } from 'Ads/Models/Placement';
import { IRawGamePrivacy, IRawUserPrivacy } from 'Privacy/Privacy';
import { CacheMode } from 'Core/Models/CoreConfiguration';
import { ISchema, Model } from 'Core/Models/Model';
import { LegalFramework } from 'Ads/Managers/UserPrivacyManager';

export interface IRawAdsConfiguration {
    assetCaching: string;
    placements: IRawPlacement[];
    defaultPlacement: string;
    gdprEnabled: boolean;
    optOutRecorded: boolean;
    optOutEnabled: boolean;
    defaultBannerPlacement: string | undefined;
    gamePrivacy: IRawGamePrivacy | undefined;
    userPrivacy: IRawUserPrivacy | undefined;
    ageGateLimit: number | undefined;
    hidePrivacy: boolean | undefined;
    legalFramework: LegalFramework | undefined;
    loadV5Enabled: boolean | undefined;
}

export interface IAdsConfiguration {
    cacheMode: CacheMode;
    placements: { [id: string]: Placement };
    defaultPlacement: Placement;
    defaultBannerPlacement: Placement | undefined;
    hidePrivacy: boolean | undefined;
    hasArPlacement: boolean;
    loadV5Enabled: boolean;
}

export class AdsConfiguration extends Model<IAdsConfiguration> {
    public static Schema: ISchema<IAdsConfiguration> = {
        cacheMode: ['number'],
        placements: ['object'],
        defaultPlacement: ['object'],
        defaultBannerPlacement: ['string', 'undefined'],
        hidePrivacy: ['boolean', 'undefined'],
        hasArPlacement: ['boolean'],
        loadV5Enabled: ['boolean']
    };

    constructor(data: IAdsConfiguration) {
        super('Configuration', AdsConfiguration.Schema, data);
    }

    public getCacheMode(): CacheMode {
        return this.get('cacheMode');
    }

    public getPlacement(placementId: string): Placement {
        return this.getPlacements()[placementId];
    }

    public removePlacements(ids: string[]) {
        const placements = this.getPlacements();
        ids.forEach((id) => {
            delete placements[id];
        });
        this.set('placements', placements);
    }

    public getPlacementIds(): string[] {
        const placementIds: string[] = [];
        for (const placement in this.getPlacements()) {
            if (this.getPlacements().hasOwnProperty(placement)) {
                placementIds.push(placement);
            }
        }

        return placementIds;
    }

    public getPlacements(): { [id: string]: Placement } {
        return this.get('placements');
    }

    public getPlacementCount(): number {
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

    public getDefaultPlacement(): Placement {
        return this.get('defaultPlacement');
    }

    public getDefaultBannerPlacement(): Placement | undefined {
        return this.get('defaultBannerPlacement');
    }

    public getPlacementsForAdunit(adUnitId: string): string[] {
        const placements = this.getPlacements();

        return Object.keys(placements)
                     .map((placementId) => placements[placementId])
                     .filter(placement => placement.hasAdUnitId() && placement.getAdUnitId() === adUnitId)
                     .map((placement) => placement.getId());
    }

    public getPlacementsForGroupId(groupId: string): string[] {
        const placements = this.getPlacements();

        return Object.keys(placements)
                     .map((placementId) => placements[placementId])
                     .filter(placement => placement.hasGroupId() && placement.getGroupId() === groupId)
                     .map((placement) => placement.getId());
    }

    public getHidePrivacy(): boolean | undefined {
        return this.get('hidePrivacy');
    }

    public getHasArPlacement(): boolean {
        return this.get('hasArPlacement');
    }

    public isLoadV5Enabled(): boolean {
        return this.get('loadV5Enabled');
    }

    public getDTO(): { [key: string]: unknown } {
        const placements = [];
        for (const placement in this.getPlacements()) {
            if (this.getPlacements().hasOwnProperty(placement)) {
                placements.push(this.getPlacements()[placement].getDTO());
            }
        }

        let defaultPlacementId: string | undefined;
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
