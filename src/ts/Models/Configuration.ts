import { Placement } from 'Models/Placement';
import { ISchema, Model } from 'Models/Model';

export enum CacheMode {
    FORCED,
    ALLOWED,
    DISABLED
}

interface IConfiguration extends ISchema {
    enabled: [boolean, string[]];
    country: [string, string[]];
    coppaCompliant: [boolean, string[]];
    placementLevelControl: [boolean, string[]];
    abGroup: [number, string[]];
    gamerId: [string, string[]];
    cacheMode: [CacheMode, string[]];
    placements: [{ [id: string]: Placement }, string[]];
    defaultPlacement: [Placement | undefined, string[]];
}

export class Configuration extends Model<IConfiguration> {
    constructor(configJson: any) {
        super({
            enabled: [false, ['boolean']],
            country: ['', ['string']],
            coppaCompliant: [false, ['boolean']],
            placementLevelControl: [false, ['boolean']],
            abGroup: [0, ['number']],
            gamerId: ['', ['string']],
            cacheMode: [CacheMode.FORCED, ['object']],
            placements: [{}, ['object']],
            defaultPlacement: [undefined, ['object', 'undefined']]
        });

        this.set('enabled', configJson.enabled);
        this.set('country', configJson.country);
        this.set('coppaCompliant', configJson.coppaCompliant);
        const placementLevelControl: boolean = configJson.placementLevelControl;
        this.set('placementLevelControl', placementLevelControl);

        if(placementLevelControl) {
            this.set('abGroup', configJson.abGroup);
            this.set('gamerId', configJson.gamerId);
        }

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

            default:
                throw new Error('Unknown assetCaching value "' + configJson.assetCaching + '"');
        }

        const placements = configJson.placements;

        placements.forEach((rawPlacement: any): void => {
            const placement: Placement = new Placement(rawPlacement);
            this.getPlacements()[placement.getId()] = placement;
            if(placement.isDefault()) {
                this.set('defaultPlacement', placement);
            }
        });
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

    public isPlacementLevelControl(): boolean {
        return this.get('placementLevelControl');
    }

    public getAbGroup(): number {
        return this.get('abGroup');
    }

    public getGamerId(): string {
        return this.get('gamerId');
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

    public getDefaultPlacement(): Placement | undefined {
        return this.get('defaultPlacement');
    }

    public getDTO(): { [key: string]: any } {
        const placements = [];
        for(const placement in this.getPlacements()) {
            if(this.getPlacements().hasOwnProperty(placement)) {
                placements.push(this.getPlacements()[placement].getDTO());
            }
        }

        let defaultPlacementId: string | undefined = undefined;
        const defaultPlacement = this.getDefaultPlacement();
        if (defaultPlacement) {
            defaultPlacementId = defaultPlacement.getId();
        }
        return {
            'enabled': this.isEnabled(),
            'country': this.getCountry(),
            'coppaCompliant': this.isCoppaCompliant(),
            'placementLevelControl': this.isPlacementLevelControl(),
            'abGroup': this.getAbGroup(),
            'gamerId': this.getGamerId(),
            'cacheMode': CacheMode[this.getCacheMode()].toLowerCase(),
            'placements': placements,
            'defaultPlacement': defaultPlacementId
        };
    }
}
