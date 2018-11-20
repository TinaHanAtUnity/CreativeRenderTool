import { Placement } from 'Ads/Models/Placement';
import { GamePrivacy } from 'Ads/Models/Privacy';
import { CacheMode } from 'Core/Models/CoreConfiguration';
import { ISchema, Model } from 'Core/Models/Model';

export interface IAdsConfiguration {
    cacheMode: CacheMode;
    placements: { [id: string]: Placement };
    defaultPlacement: Placement;
    gdprEnabled: boolean;
    optOutRecorded: boolean;
    optOutEnabled: boolean;
    defaultBannerPlacement: Placement | undefined;
    gamePrivacy: GamePrivacy;
}

export class AdsConfiguration extends Model<IAdsConfiguration> {
    public static Schema: ISchema<IAdsConfiguration> = {
        cacheMode: ['number'],
        placements: ['object'],
        defaultPlacement: ['object'],
        gdprEnabled: ['boolean'],
        optOutRecorded: ['boolean'],
        optOutEnabled: ['boolean'],
        defaultBannerPlacement: ['string', 'undefined'],
        gamePrivacy: ['object']
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
        for(const placement in this.getPlacements()) {
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
        if(!this.getPlacements()) {
            return 0;
        }

        let count = 0;
        for(const placement in this.getPlacements()) {
            if(this.getPlacements().hasOwnProperty(placement)) {
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

    public isGDPREnabled(): boolean {
        return this.get('gdprEnabled');
    }

    public setGDPREnabled(enabled: boolean) {
        this.set('gdprEnabled', enabled);
    }

    public isOptOutRecorded(): boolean {
        return this.get('optOutRecorded');
    }

    public setOptOutRecorded(recorded: boolean) {
        this.set('optOutRecorded', recorded);
    }

    public isOptOutEnabled(): boolean {
        return this.get('optOutEnabled');
    }

    public setOptOutEnabled(optOutEnabled: boolean) {
        this.set('optOutEnabled', optOutEnabled);
    }

    public getGamePrivacy(): GamePrivacy {
        return this.get('gamePrivacy');
    }

    public getDTO(): { [key: string]: any } {
        const placements = [];
        for(const placement in this.getPlacements()) {
            if(this.getPlacements().hasOwnProperty(placement)) {
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
