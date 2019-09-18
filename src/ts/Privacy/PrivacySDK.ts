import {
    GamePrivacy,
    PrivacyMethod,
    UserPrivacy
} from 'Privacy/Privacy';
import { AgeGate } from 'Privacy/AgeGate';

export class PrivacySDK {
    private _gamePrivacy: GamePrivacy;
    private _userPrivacy: UserPrivacy;
    private _ageGate: AgeGate;
    private _testForceConsentUnit: boolean;

    constructor(gamePrivacy: GamePrivacy, userPrivacy: UserPrivacy, ageGate: AgeGate) {
        this._gamePrivacy = gamePrivacy;
        this._userPrivacy = userPrivacy;
        this._ageGate = ageGate;
        this._testForceConsentUnit = false;
    }

    public isConsentShowRequired(): boolean {
        if (this._testForceConsentUnit) {
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

    public getAgeGate(): AgeGate {
        return this._ageGate;
    }
}
