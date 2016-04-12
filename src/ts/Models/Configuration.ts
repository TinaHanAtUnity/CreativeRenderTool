import { Placement } from 'Models/Placement';

export class Configuration {

    private _enabled: boolean;
    private _country: string;
    private _placements: { [id: string]: Placement } = {};
    private _defaultPlacement: Placement = null;

    constructor(configJson: any) {
        this._enabled = configJson.enabled;
        this._country = configJson.country;

        let placements = configJson.placements;

        placements.forEach((rawPlacement: any): void => {
            let placement: Placement = new Placement(rawPlacement);
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

    public getPlacement(placementId: string): Placement {
        return this._placements[placementId];
    }

    public getPlacements(): { [id: string]: Placement } {
        return this._placements;
    }

    public getDefaultPlacement(): Placement {
        return this._defaultPlacement;
    }

}
