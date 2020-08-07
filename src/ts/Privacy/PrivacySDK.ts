import { GamePrivacy, PrivacyMethod, UserPrivacy } from 'Privacy/Privacy';
import { LegalFramework } from 'Ads/Managers/UserPrivacyManager';
import { PrivacyTestEnvironment } from 'Privacy/PrivacyTestEnvironment';

export class PrivacySDK {
    private _gamePrivacy: GamePrivacy;
    private _userPrivacy: UserPrivacy;
    private _gdprEnabled: boolean;
    private _ageGateLimit: number;
    private _legalFramework: LegalFramework;
    private _useUnityAttDialog: boolean;

    constructor(gamePrivacy: GamePrivacy, userPrivacy: UserPrivacy, gdprEnabled: boolean, ageGateLimit: number, legalFramework: LegalFramework, useUnityAttDialog: boolean) {
        this._gamePrivacy = gamePrivacy;
        this._userPrivacy = userPrivacy;
        this._gdprEnabled = gdprEnabled;
        this._ageGateLimit = ageGateLimit;
        this._legalFramework = legalFramework;
        this._useUnityAttDialog = useUnityAttDialog;
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
        return PrivacyTestEnvironment.isSet('legalFramework') ?
            PrivacyTestEnvironment.get<LegalFramework>('legalFramework') : this._legalFramework;
    }

    public isUnityAttDialog(): boolean {
        return this._useUnityAttDialog;
    }
}
