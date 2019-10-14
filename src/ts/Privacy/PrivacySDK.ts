import { GamePrivacy, PrivacyMethod, UserPrivacy } from 'Privacy/Privacy';
import { LegalFramework } from 'Ads/Managers/UserPrivacyManager';

export class PrivacySDK {
    private _gamePrivacy: GamePrivacy;
    private _userPrivacy: UserPrivacy;
    private _testForceConsentUnit: boolean;
    private _gdprEnabled: boolean;
    private _optOutRecorded: boolean;
    private _optOutEnabled: boolean;
    private _ageGateLimit: number;
    private _legalFramework: LegalFramework;

    constructor(gamePrivacy: GamePrivacy, userPrivacy: UserPrivacy, gdprEnabled: boolean, optOutRecorded: boolean, optOutEnabled: boolean, ageGateLimit: number, legalFramework: LegalFramework) {
        this._gamePrivacy = gamePrivacy;
        this._userPrivacy = userPrivacy;
        this._testForceConsentUnit = false;
        this._gdprEnabled = gdprEnabled;
        this._optOutRecorded = optOutRecorded;
        this._optOutEnabled = optOutEnabled;
        this._ageGateLimit = ageGateLimit;
        this._legalFramework = legalFramework;
    }

    public isConsentShowRequired(): boolean {
        if (this._testForceConsentUnit) {
            return true;
        }

        if (this.isAgeGateShowRequired()) {
            return true;
        }

        if (!this._gamePrivacy.isEnabled() && this._gamePrivacy.getMethod() !== PrivacyMethod.UNITY_CONSENT) {
            return false;
        }

        if (!this._userPrivacy.isRecorded()) {
            return true;
        }

        const methodChangedSinceConsent = this._gamePrivacy.getMethod() !== this._userPrivacy.getMethod();
        const versionUpdatedSinceConsent = this._gamePrivacy.getVersion() > this._userPrivacy.getVersion();

        return methodChangedSinceConsent || versionUpdatedSinceConsent;
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
        return this._optOutRecorded;
    }

    public setOptOutRecorded(recorded: boolean) {
        this._optOutRecorded = recorded;
    }

    public isOptOutEnabled(): boolean {
        return this._optOutEnabled;
    }

    public setOptOutEnabled(optOutEnabled: boolean) {
        this._optOutEnabled = optOutEnabled;
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

    public disableAgeGate(): void {
        this._ageGateLimit = 0;
    }

    public getLegalFramework(): LegalFramework {
        return this._legalFramework;
    }

    private isAgeGateShowRequired(): boolean {
        if (this.isAgeGateEnabled()) {
            if (this.getGamePrivacy().getMethod() === PrivacyMethod.LEGITIMATE_INTEREST && this.isGDPREnabled() && !this.isOptOutRecorded()) {
                return true;
            }

            if (this.getGamePrivacy().getMethod() === PrivacyMethod.UNITY_CONSENT && !this.getUserPrivacy().isRecorded()) {
                return true;
            }
        }

        return false;
    }
}
