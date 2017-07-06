import { Placement } from 'Models/Placement';
import { Model } from 'Models/Model';

export enum CacheMode {
    FORCED,
    ALLOWED,
    DISABLED,
    ADAPTIVE
}

interface IConfiguration {
    enabled: boolean;
    country: string;
    coppaCompliant: boolean;
    useAuction: boolean;
    abGroup: number;
    gamerId: string;
    properties: string;
    cacheMode: CacheMode;
    placements: { [id: string]: Placement };
    defaultPlacement: Placement;
    analytics: boolean;
}

export class Configuration extends Model<IConfiguration> {
    constructor(configJson: any) {
        super('Configuration', {
            enabled: ['boolean'],
            country: ['string'],
            coppaCompliant: ['boolean'],
            useAuction: ['boolean'],
            abGroup: ['number'],
            gamerId: ['string'],
            properties: ['string'],
            cacheMode: ['number'],
            placements: ['object'],
            defaultPlacement: ['object'],
            analytics: ['boolean']
        });

        this.set('enabled', configJson.enabled);
        this.set('country', configJson.country);
        this.set('coppaCompliant', configJson.coppaCompliant);
        const useAuction: boolean = configJson.useAuction;

        if(useAuction) {
            this.set('useAuction', useAuction);
            this.set('abGroup', configJson.abGroup);
            this.set('gamerId', configJson.gamerId);
            this.set('properties', configJson.properties);
        }

        this.set('analytics', configJson.analytics ? true : false);

        switch(configJson.assetCaching) {
            case 'forced':
                this.set('cacheMode', CacheMode.FORCED);
                break;

            case 'allowed':
                this.set('cacheMode', CacheMode.ALLOWED);
                break;

            case 'disabled':
                this.set('cacheMode', CacheMode.DISABLED);
                break;

            case 'adaptive':
                this.set('cacheMode', CacheMode.ADAPTIVE);
                break;

            default:
                throw new Error('Unknown assetCaching value "' + configJson.assetCaching + '"');
        }
        this.set('cacheMode', CacheMode.ADAPTIVE);

        const placements = configJson.placements;

        if (placements) {
            this.set('placements', {});
            placements.forEach((rawPlacement: any): void => {
                const placement: Placement = new Placement(rawPlacement);
                this.getPlacements()[placement.getId()] = placement;
                if(placement.isDefault()) {
                    this.set('defaultPlacement', placement);
                }
            });
        }
    }

    public isEnabled(): boolean {
        return this.get('enabled');
    }

    public getCountry(): string {
        return this.get('country');
    }

    public isCoppaCompliant(): boolean {
        return this.get('coppaCompliant');
    }

    public isAuction(): boolean {
        return this.get('useAuction');
    }

    public isAnalyticsEnabled(): boolean {
        return this.get('analytics');
    }

    public getAbGroup(): number {
        return this.get('abGroup');
    }

    public getGamerId(): string {
        return this.get('gamerId');
    }

    public getProperties(): string {
        return this.get('properties');
    }

    public getCacheMode(): CacheMode {
        return this.get('cacheMode');
    }

    public getPlacement(placementId: string): Placement {
        return this.getPlacements()[placementId];
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
            'enabled': this.isEnabled(),
            'country': this.getCountry(),
            'coppaCompliant': this.isCoppaCompliant(),
            'placementLevelControl': this.isAuction(),
            'abGroup': this.getAbGroup(),
            'gamerId': this.getGamerId(),
            'cacheMode': CacheMode[this.getCacheMode()].toLowerCase(),
            'placements': placements,
            'defaultPlacement': defaultPlacementId
        };
    }
}
