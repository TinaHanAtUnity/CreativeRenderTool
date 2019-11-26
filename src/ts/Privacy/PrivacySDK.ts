import { GamePrivacy, PrivacyMethod, UserPrivacy } from 'Privacy/Privacy';
import { LegalFramework } from 'Ads/Managers/UserPrivacyManager';

export class PrivacySDK {
    private _gamePrivacy: GamePrivacy;
    private _userPrivacy: UserPrivacy;
    private _gdprEnabled: boolean;
    private _ageGateLimit: number;
    private _legalFramework: LegalFramework;

    constructor(gamePrivacy: GamePrivacy, userPrivacy: UserPrivacy, gdprEnabled: boolean, ageGateLimit: number, legalFramework: LegalFramework) {
        this._gamePrivacy = gamePrivacy;
        this._userPrivacy = userPrivacy;
        this._gdprEnabled = gdprEnabled;
        this._ageGateLimit = ageGateLimit;
        this._legalFramework = legalFramework;
    }

    public getGamePrivacy(): GamePrivacy {
        return this._gamePrivacy;
    }

    public getUserPrivacy(): UserPrivacy {
        return this._userPrivacy;
    }

    public isGDPREnabled(): boolean {
        return this._gdprEnabled;
    }

    public setGDPREnabled(enabled: boolean) {
        this._gdprEnabled = enabled;
    }

    public isOptOutRecorded(): boolean {
        return this._userPrivacy.isRecorded();
    }

    public isOptOutEnabled(): boolean {
        if (!this.isOptOutRecorded()) {
            return false;
        }
        return !this._userPrivacy.getPermissions().ads;
    }

    public isAgeGateEnabled(): boolean {
        if (this._ageGateLimit > 0) {
            return true;
        }

        return false;
    }

    public getAgeGateLimit(): number {
        return this._ageGateLimit;
    }

    public getLegalFramework(): LegalFramework {
        return this._legalFramework;
    }

    public getSubmittablePrivacy(limitAdTracking: boolean | undefined): UserPrivacy {
        if (this.isOptOutRecorded()) {
            return this.getUserPrivacy();
        }
        const gamePrivacyMethod = this.getGamePrivacy().getMethod();
        let permissions = UserPrivacy.PERM_ALL_FALSE;

        if (!limitAdTracking) {
            switch (gamePrivacyMethod) {
                case PrivacyMethod.UNITY_CONSENT: permissions = UserPrivacy.PERM_ALL_FALSE;
                    break;
                case PrivacyMethod.LEGITIMATE_INTEREST: permissions = UserPrivacy.PERM_OPTIN_LEGITIMATE_INTEREST;
                    break;
                case PrivacyMethod.DEVELOPER_CONSENT: permissions = UserPrivacy.PERM_ALL_FALSE;
                    break;
                case PrivacyMethod.DEFAULT: permissions = UserPrivacy.PERM_ALL_TRUE;
                    break;
                default: permissions = UserPrivacy.PERM_ALL_FALSE;
            }
        }
        return new UserPrivacy({method: gamePrivacyMethod, permissions: permissions, version: 0});
    }
}
