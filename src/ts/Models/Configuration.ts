import { Placement } from 'Models/Placement';

export enum CacheMode {
    FORCED,
    ALLOWED,
    DISABLED
}

export class Configuration {

    private _enabled: boolean;
    private _country: string;
    private _coppaCompliant: boolean;
    private _placementLevelControl: boolean;
    private _analytics: boolean;
    private _abGroup: number;
    private _gamerId: string;
    private _properties: string;
    private _cacheMode: CacheMode;
    private _placements: { [id: string]: Placement } = {};
    private _defaultPlacement: Placement;

    constructor(configJson: any) {
        this._enabled = configJson.enabled;
        this._country = configJson.country;
        this._coppaCompliant = configJson.coppaCompliant;
        this._placementLevelControl = configJson.placementLevelControl;

        if(this._placementLevelControl) {
            this._abGroup = configJson.abGroup;
            this._gamerId = configJson.gamerId;
            this._properties = configJson.properties;
        }

        this._analytics = configJson.analytics ? true : false;

        switch(configJson.assetCaching) {
            case 'forced':
                this._cacheMode = CacheMode.FORCED;
                break;

            case 'allowed':
                this._cacheMode = CacheMode.ALLOWED;
                break;

            case 'disabled':
                this._cacheMode = CacheMode.DISABLED;
                break;

            default:
                throw new Error('Unknown assetCaching value "' + configJson.assetCaching + '"');
        }

        const placements = configJson.placements;

        placements.forEach((rawPlacement: any): void => {
            const placement: Placement = new Placement(rawPlacement);
            this._placements[placement.getId()] = placement;
            if(placement.isDefault()) {
                this._defaultPlacement = placement;
            }
        });
    }

    public isEnabled(): boolean {
        return this._enabled;
    }

    public getCountry(): string {
        return this._country;
    }

    public isCoppaCompliant(): boolean {
        return this._coppaCompliant;
    }

    public isPlacementLevelControl(): boolean {
        return this._placementLevelControl;
    }

    public isAnalyticsEnabled(): boolean {
        return this._analytics;
    }

    public getAbGroup(): number {
        return this._abGroup;
    }

    public getGamerId(): string {
        return this._gamerId;
    }

    public getProperties(): string {
        return this._properties;
    }

    public getCacheMode(): CacheMode {
        return this._cacheMode;
    }

    public getPlacement(placementId: string): Placement {
        return this._placements[placementId];
    }

    public getPlacements(): { [id: string]: Placement } {
        return this._placements;
    }

    public getPlacementCount(): number {
        if(!this._placements) {
            return 0;
        }

        let count = 0;
        for(const placement in this._placements) {
            if(this._placements.hasOwnProperty(placement)) {
                count++;
            }
        }

        return count;
    }

    public getDefaultPlacement(): Placement {
        return this._defaultPlacement;
    }
}
