import { IRawPlacement, Placement } from 'Ads/Models/Placement';
import { GamePrivacy, IPermissions, IRequestPrivacy, PrivacyMethod, UserPrivacy } from 'Ads/Models/Privacy';
import { CacheMode } from 'Core/Models/CoreConfiguration';
import { ISchema, Model } from 'Core/Models/Model';

export interface IRawAdsConfiguration {
    assetCaching: string;
    placements: IRawPlacement[];
    defaultPlacement: string;
    gdprEnabled: boolean;
    optOutRecorded: boolean;
    optOutEnabled: boolean;
    defaultBannerPlacement: string | undefined;
    gamePrivacy: string | undefined;
    userPrivacy: string | undefined;
}

export interface IAdsConfiguration {
    cacheMode: CacheMode;
    placements: { [id: string]: Placement };
    defaultPlacement: Placement;
    gdprEnabled: boolean;
    optOutRecorded: boolean;
    optOutEnabled: boolean;
    defaultBannerPlacement: Placement | undefined;
    gamePrivacy: GamePrivacy;
    userPrivacy?: UserPrivacy;
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
        gamePrivacy: ['object'],
        userPrivacy: ['object', 'undefined']
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

    public getPrivacyMethod(): PrivacyMethod {
        const gamePrivacy = this.getGamePrivacy();
        if (gamePrivacy) {
            return gamePrivacy.getMethod();
        }
        if (!this.isGDPREnabled()) {
            return PrivacyMethod.DEFAULT;
        }
        // TODO: what other cases are there?
        throw new Error('getPrivacymethod(): This privacy case has not been implemented');
    }

    public isFirstRequest() {
        if (!this.getUserPrivacy()) {
            return true;
        }
        return false;
    }

    public getPrivacy(): IRequestPrivacy {
        const userPrivacy = this.getUserPrivacy();
        let userPermissions;
        if (userPrivacy) {
            userPermissions = userPrivacy.getPermissions();
        } else {
            userPermissions = {};
        }
        return {
            'method': this.getPrivacyMethod(),
            'firstRequest': this.isFirstRequest(),
            'permissions': userPermissions
        };
    }

    public addUserConsent(permissions: IPermissions): void {
        let userPrivacy: UserPrivacy | undefined = this.getUserPrivacy();
        if (userPrivacy) {
            userPrivacy.setPermissions(permissions);
            return;
        }

        const gamePrivacy: GamePrivacy | undefined = this.getGamePrivacy();
        let method: PrivacyMethod;
        if (gamePrivacy) {
            method = gamePrivacy.getMethod();
        } else {
            method = PrivacyMethod.DEFAULT;
        }
        userPrivacy = new UserPrivacy({method: method, permissions: permissions});
        this.setUserPrivacy(userPrivacy);
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

    public getUserPrivacy(): UserPrivacy | undefined {
        return this.get('userPrivacy');
    }

    public setUserPrivacy(userPrivacy: UserPrivacy): void {
        this.set('userPrivacy', userPrivacy);
    }

    public isConsentShowRequired(): boolean {
        // TODO: Remove before flight
        const removeBeforeFlight = true;
        if (removeBeforeFlight) {
            return true;
        }

        // TODO: there was going to be a case where we might have to request consent again, will this be server-side?
        if (!this.isGDPREnabled()) {
            return false;
        }
        const userPrivacy = this.getUserPrivacy();
        if(userPrivacy) {
            return false;
        }
        return true;
    }

    public getDTO(): { [key: string]: unknown } {
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
