import { Localization } from 'Core/Utilities/Localization';
import { LegalFramework } from 'Ads/Managers/UserPrivacyManager';
export class PrivacyLocalization extends Localization {
    constructor(language, namespace, legalFramework) {
        super(PrivacyLocalization.resolveLanguage(language, namespace, legalFramework), namespace);
    }
    static resolveLanguage(language, namespace, legalFramework) {
        if (namespace !== 'privacy' && namespace !== 'consent') {
            return language;
        }
        if (namespace === 'consent' && !this.isPrivacyUnitTranslationAvailable(language)) {
            return 'en.*';
        }
        if (namespace === 'privacy' && !this.isPrivacySettingsTranslationAvailable(language, legalFramework)) {
            return 'en.*';
        }
        return language;
    }
    static isPrivacyUnitTranslationAvailable(language) {
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
    static isPrivacySettingsTranslationAvailable(language, legalFramework) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJpdmFjeUxvY2FsaXphdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy90cy9Qcml2YWN5L1ByaXZhY3lMb2NhbGl6YXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQzNELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUVqRSxNQUFNLE9BQU8sbUJBQW9CLFNBQVEsWUFBWTtJQUVqRCxZQUFZLFFBQWdCLEVBQUUsU0FBaUIsRUFBRSxjQUE4QjtRQUMzRSxLQUFLLENBQUMsbUJBQW1CLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsY0FBYyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDL0YsQ0FBQztJQUVPLE1BQU0sQ0FBQyxlQUFlLENBQUMsUUFBZ0IsRUFBRSxTQUFpQixFQUFFLGNBQThCO1FBQzlGLElBQUksU0FBUyxLQUFLLFNBQVMsSUFBSSxTQUFTLEtBQUssU0FBUyxFQUFFO1lBQ3BELE9BQU8sUUFBUSxDQUFDO1NBQ25CO1FBRUQsSUFBSSxTQUFTLEtBQUssU0FBUyxJQUFJLENBQUMsSUFBSSxDQUFDLGlDQUFpQyxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQzlFLE9BQU8sTUFBTSxDQUFDO1NBQ2pCO1FBQ0QsSUFBSSxTQUFTLEtBQUssU0FBUyxJQUFJLENBQUMsSUFBSSxDQUFDLHFDQUFxQyxDQUFDLFFBQVEsRUFBRSxjQUFjLENBQUMsRUFBRTtZQUNsRyxPQUFPLE1BQU0sQ0FBQztTQUNqQjtRQUVELE9BQU8sUUFBUSxDQUFDO0lBQ3BCLENBQUM7SUFFTyxNQUFNLENBQUMsaUNBQWlDLENBQUMsUUFBZ0I7UUFDN0QsSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztlQUNuQixRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztlQUN0QixRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztlQUN0QixRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztlQUN0QixRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztlQUN0QixRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztlQUN0QixRQUFRLENBQUMsS0FBSyxDQUFDLG9EQUFvRCxDQUFDLEVBQUU7WUFDekUsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFFTyxNQUFNLENBQUMscUNBQXFDLENBQUMsUUFBZ0IsRUFBRSxjQUE4QjtRQUNqRyxxQ0FBcUM7UUFDckMsSUFBSSxjQUFjLEtBQUssY0FBYyxDQUFDLElBQUksRUFBRTtZQUN4QyxPQUFPLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1NBQ2hEO1FBRUQsSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLG9EQUFvRCxDQUFDLEVBQUU7WUFDdEUsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUVELE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7Q0FDSiJ9