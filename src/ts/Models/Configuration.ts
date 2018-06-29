import { Placement } from 'Models/Placement';
import { ISchema, Model } from 'Models/Model';
import { ABGroup } from 'Models/ABGroup';

export enum CacheMode {
    FORCED,
    ALLOWED,
    DISABLED,
    ADAPTIVE
}

export interface IConfiguration {
    enabled: boolean;
    country: string;
    coppaCompliant: boolean;
    abGroup: ABGroup;
    gamerId: string;
    properties: string;
    cacheMode: CacheMode;
    placements: { [id: string]: Placement };
    defaultPlacement: Placement;
    analytics: boolean;
    test: boolean;
    projectId: string;
    token: string;
    jaegerTracing: boolean;
    organizationId: string | undefined;
    gdprEnabled: boolean;
    optOutRecorded: boolean;
    optOutEnabled: boolean;
    defaultBannerPlacement: Placement | undefined;
}

export class Configuration extends Model<IConfiguration> {
    public static Schema: ISchema<IConfiguration> = {
        enabled: ['boolean'],
        country: ['string'],
        coppaCompliant: ['boolean'],
        abGroup: ['object'],
        gamerId: ['string'],
        properties: ['string'],
        cacheMode: ['number'],
        placements: ['object'],
        defaultPlacement: ['object'],
        analytics: ['boolean'],
        test: ['boolean'],
        projectId: ['string'],
        token: ['string'],
        jaegerTracing: ['boolean'],
        organizationId: ['string', 'undefined'],
        gdprEnabled: ['boolean'],
        optOutRecorded: ['boolean'],
        optOutEnabled: ['boolean'],
        defaultBannerPlacement: ['string', 'undefined']
    };

    constructor(data: IConfiguration) {
        super('Configuration', Configuration.Schema, data);
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

    public isAnalyticsEnabled(): boolean {
        return this.get('analytics');
    }

    public isJaegerTracingEnabled(): boolean {
        return this.get('jaegerTracing');
    }

    public getAbGroup(): ABGroup {
        return this.get('abGroup');
    }

    public getGamerId(): string {
        return this.get('gamerId');
    }

    public getProperties(): string {
        return this.get('properties');
    }

    public getToken(): string {
        return this.get('token');
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

    public getUnityProjectId(): string {
        return this.get('projectId');
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
            'abGroup': this.getAbGroup().toNumber(),
            'gamerToken': this.getToken(),
            'cacheMode': CacheMode[this.getCacheMode()].toLowerCase(),
            'placements': placements,
            'defaultPlacement': defaultPlacementId,
            'projectId': this.getUnityProjectId()
        };
    }

    public getTestMode(): boolean {
       return this.get('test');
    }

    public getOrganizationId(): string | undefined {
        return this.get('organizationId');
    }
}
