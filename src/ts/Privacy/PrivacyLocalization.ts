import { Localization } from 'Core/Utilities/Localization';
import { LegalFramework } from 'Ads/Managers/UserPrivacyManager';

export class PrivacyLocalization extends Localization {

    constructor(language: string, namespace: string, legalFramework: LegalFramework) {
        super(PrivacyLocalization.resolveLanguage(language, namespace, legalFramework), namespace);
    }

    private static resolveLanguage(language: string, namespace: string, legalFramework?: LegalFramework): string {
        if (namespace !== 'privacy' && namespace !== 'consent') {
            return language;
        }

        if (namespace === 'consent' && !this.isPrivacyUnitTranslationAvailable(language, legalFramework)) {
            return 'en.*';
        }
        if (namespace === 'privacy' && !this.isPrivacySettingsTranslationAvailable(language, legalFramework)) {
            return 'en.*';
        }

        return language;
    }

    private static isPrivacyUnitTranslationAvailable(language: string, legalFramework?: LegalFramework) {
        if (language.match('fr.*')
            || language.match('de.*')
            || language.match('es.*')
            || language.match('ru.*')
            || language.match('pt.*')
            || language.match('it.*')
            || language.match('zh(((_#?Hans)?(_\\D\\D)?)|((_\\D\\D)?(_#?Hans)?))$')) {
            return true;
        }
        return false;
    }

    private static isPrivacySettingsTranslationAvailable(language: string, legalFramework?: LegalFramework): boolean {
        // only Spanish is available for CCPA
        if (legalFramework === LegalFramework.CCPA) {
            return language.match('es.*') ? true : false;
        }

        if (language.match('zh(((_#?Hans)?(_\\D\\D)?)|((_\\D\\D)?(_#?Hans)?))$')) {
            return true;
        }

        return false;
    }
}
