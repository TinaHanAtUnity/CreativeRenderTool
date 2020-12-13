import DanishEndscreen from 'json/locale/da_DK/endscreen.json';
import DanishOverlay from 'json/locale/da_DK/overlay.json';
import GermanEndscreen from 'json/locale/de/endscreen.json';
import GermanOverlay from 'json/locale/de/overlay.json';
import GermanConsent from 'json/locale/de/consent.json';
import GermanMraid from 'json/locale/de/mraid.json';
import EnglishEndscreen from 'json/locale/en/endscreen.json';
import EnglishOverlay from 'json/locale/en/overlay.json';
import EnglishConsent from 'json/locale/en/consent.json';
import EnglishMraid from 'json/locale/en/mraid.json';
import EnglishPrivacy from 'json/locale/en/privacy.json';
import SpanishEndscreen from 'json/locale/es/endscreen.json';
import SpanishOverlay from 'json/locale/es/overlay.json';
import SpanishConsent from 'json/locale/es/consent.json';
import SpanishMraid from 'json/locale/es/mraid.json';
import SpanishPrivacy from 'json/locale/es/privacy.json';
import FinnishEndscreen from 'json/locale/fi/endscreen.json';
import FinnishOverlay from 'json/locale/fi/overlay.json';
import FinnishMraid from 'json/locale/fi/mraid.json';
import FrenchEndscreen from 'json/locale/fr/endscreen.json';
import FrenchOverlay from 'json/locale/fr/overlay.json';
import FrenchConsent from 'json/locale/fr/consent.json';
import FrenchMraid from 'json/locale/fr/mraid.json';
import IcelandicEndscreen from 'json/locale/is/endscreen.json';
import IcelandicOverlay from 'json/locale/is/overlay.json';
import ItalianEndscreen from 'json/locale/it/endscreen.json';
import ItalianOverlay from 'json/locale/it/overlay.json';
import ItalianConsent from 'json/locale/it/consent.json';
import ItalianMraid from 'json/locale/it/mraid.json';
import JapaneseEndscreen from 'json/locale/ja/endscreen.json';
import JapaneseOverlay from 'json/locale/ja/overlay.json';
import KoreanEndscreen from 'json/locale/ko/endscreen.json';
import KoreanOverlay from 'json/locale/ko/overlay.json';
import LithuanianEndscreen from 'json/locale/lt/endscreen.json';
import LithuanianOverlay from 'json/locale/lt/overlay.json';
import NorwegianEndscreen from 'json/locale/nb/endscreen.json';
import NorwegianOverlay from 'json/locale/nb/overlay.json';
import PortugueseEndscreen from 'json/locale/pt/endscreen.json';
import PortugueseOverlay from 'json/locale/pt/overlay.json';
import PortugueseConsent from 'json/locale/pt/consent.json';
import PortugueseMraid from 'json/locale/pt/mraid.json';
import RomanianEndscreen from 'json/locale/ro/endscreen.json';
import RomanianOverlay from 'json/locale/ro/overlay.json';
import RussianEndscreen from 'json/locale/ru/endscreen.json';
import RussianOverlay from 'json/locale/ru/overlay.json';
import RussianConsent from 'json/locale/ru/consent.json';
import RussianMraid from 'json/locale/ru/mraid.json';
import TurkishEndscreen from 'json/locale/tr/endscreen.json';
import TurkishOverlay from 'json/locale/tr/overlay.json';
import ChineseSimplifiedEndscreen from 'json/locale/zh_Hans/endscreen.json';
import ChineseSimplifiedOverlay from 'json/locale/zh_Hans/overlay.json';
import ChineseSimplifiedConsent from 'json/locale/zh_Hans/consent.json';
import ChineseSimplifiedMraid from 'json/locale/zh_Hans/mraid.json';
import ChineseSimplifiedPrivacy from 'json/locale/zh_Hans/privacy.json';
import ChineseTraditionalEndscreen from 'json/locale/zh_Hant/endscreen.json';
import ChineseTraditionalOverlay from 'json/locale/zh_Hant/overlay.json';
import ChineseTraditionalMraid from 'json/locale/zh_Hant/mraid.json';
export class Localization {
    constructor(language, namespace) {
        this._language = language;
        this._namespace = namespace;
    }
    static getLanguageMap(language, namespace) {
        const languageMap = Localization._languageMap[language];
        if (languageMap) {
            return languageMap[namespace];
        }
        for (const key in Localization._languageMap) {
            if (Localization._languageMap.hasOwnProperty(key)) {
                if (language.match(key)) {
                    return Localization._languageMap[key][namespace];
                }
            }
        }
        return undefined;
    }
    static setLanguageMap(language, namespace, map) {
        if (!Localization._languageMap) {
            Localization._languageMap = {};
        }
        if (!Localization._languageMap[language]) {
            Localization._languageMap[language] = {};
        }
        Localization._languageMap[language][namespace] = map;
    }
    static getLocalizedAbbreviations(language) {
        const localizedAbbreviations = Localization._localizedAbbreviations[language];
        if (localizedAbbreviations) {
            return localizedAbbreviations;
        }
        for (const key in Localization._localizedAbbreviations) {
            if (Localization._localizedAbbreviations.hasOwnProperty(key)) {
                if (language.match(key)) {
                    return Localization._localizedAbbreviations[key];
                }
            }
        }
        return undefined;
    }
    translate(phrase) {
        let languageMap = Localization.getLanguageMap(this._language, this._namespace);
        if (!languageMap || !(phrase in languageMap)) {
            // if translation for the phrase cannot be found, use English
            languageMap = Localization.getLanguageMap('en.*', this._namespace);
            if (!languageMap || !(phrase in languageMap)) {
                return phrase;
            }
        }
        return languageMap[phrase];
    }
    abbreviate(number) {
        const localizedAbbreviations = Localization.getLocalizedAbbreviations(this._language);
        if (!localizedAbbreviations) {
            return number.toString();
        }
        if (number >= 1000000) {
            return (Math.floor(number / 1000000)).toString() + ' ' + localizedAbbreviations.million;
        }
        if (number >= 10000) {
            return (Math.floor(number / 1000)).toString() + ' ' + localizedAbbreviations.thousand;
        }
        return number.toString();
    }
}
Localization._languageMap = {
    'en.*': {
        'endscreen': EnglishEndscreen,
        'overlay': EnglishOverlay,
        'consent': EnglishConsent,
        'mraid': EnglishMraid,
        'privacy': EnglishPrivacy
    },
    'ru.*': {
        'endscreen': RussianEndscreen,
        'overlay': RussianOverlay,
        'consent': RussianConsent,
        'mraid': RussianMraid
    },
    'ja.*': {
        'endscreen': JapaneseEndscreen,
        'overlay': JapaneseOverlay
    },
    'ko.*': {
        'endscreen': KoreanEndscreen,
        'overlay': KoreanOverlay
    },
    'it.*': {
        'endscreen': ItalianEndscreen,
        'overlay': ItalianOverlay,
        'consent': ItalianConsent,
        'mraid': ItalianMraid
    },
    'de.*': {
        'endscreen': GermanEndscreen,
        'overlay': GermanOverlay,
        'consent': GermanConsent,
        'mraid': GermanMraid
    },
    'zh(_TW|_HK|_MO|_#?Hant)?(_TW|_HK|_MO|_#?Hant)+$': {
        'endscreen': ChineseTraditionalEndscreen,
        'overlay': ChineseTraditionalOverlay,
        'mraid': ChineseTraditionalMraid
    },
    'zh(((_#?Hans)?(_\\D\\D)?)|((_\\D\\D)?(_#?Hans)?))$': {
        'endscreen': ChineseSimplifiedEndscreen,
        'overlay': ChineseSimplifiedOverlay,
        'consent': ChineseSimplifiedConsent,
        'mraid': ChineseSimplifiedMraid,
        'privacy': ChineseSimplifiedPrivacy
    },
    'fi.*': {
        'endscreen': FinnishEndscreen,
        'overlay': FinnishOverlay,
        'mraid': FinnishMraid
    },
    'es.*': {
        'endscreen': SpanishEndscreen,
        'overlay': SpanishOverlay,
        'consent': SpanishConsent,
        'mraid': SpanishMraid,
        'privacy': SpanishPrivacy
    },
    'fr.*': {
        'endscreen': FrenchEndscreen,
        'overlay': FrenchOverlay,
        'consent': FrenchConsent,
        'mraid': FrenchMraid
    },
    'tr.*': {
        'endscreen': TurkishEndscreen,
        'overlay': TurkishOverlay
    },
    'da_DK': {
        'endscreen': DanishEndscreen,
        'overlay': DanishOverlay
    },
    'nb.*': {
        'endscreen': NorwegianEndscreen,
        'overlay': NorwegianOverlay
    },
    'lt.*': {
        'endscreen': LithuanianEndscreen,
        'overlay': LithuanianOverlay
    },
    'is.*': {
        'endscreen': IcelandicEndscreen,
        'overlay': IcelandicOverlay
    },
    'ro.*': {
        'endscreen': RomanianEndscreen,
        'overlay': RomanianOverlay
    },
    'pt.*': {
        'endscreen': PortugueseEndscreen,
        'overlay': PortugueseOverlay,
        'consent': PortugueseConsent,
        'mraid': PortugueseMraid
    }
};
Localization._localizedAbbreviations = {
    'en.*': {
        thousand: 'k',
        million: 'm'
    },
    'zh.*': {
        thousand: '千',
        million: '百万'
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTG9jYWxpemF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0NvcmUvVXRpbGl0aWVzL0xvY2FsaXphdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLGVBQWUsTUFBTSxrQ0FBa0MsQ0FBQztBQUMvRCxPQUFPLGFBQWEsTUFBTSxnQ0FBZ0MsQ0FBQztBQUMzRCxPQUFPLGVBQWUsTUFBTSwrQkFBK0IsQ0FBQztBQUM1RCxPQUFPLGFBQWEsTUFBTSw2QkFBNkIsQ0FBQztBQUN4RCxPQUFPLGFBQWEsTUFBTSw2QkFBNkIsQ0FBQztBQUN4RCxPQUFPLFdBQVcsTUFBTSwyQkFBMkIsQ0FBQztBQUNwRCxPQUFPLGdCQUFnQixNQUFNLCtCQUErQixDQUFDO0FBQzdELE9BQU8sY0FBYyxNQUFNLDZCQUE2QixDQUFDO0FBQ3pELE9BQU8sY0FBYyxNQUFNLDZCQUE2QixDQUFDO0FBQ3pELE9BQU8sWUFBWSxNQUFNLDJCQUEyQixDQUFDO0FBQ3JELE9BQU8sY0FBYyxNQUFNLDZCQUE2QixDQUFDO0FBQ3pELE9BQU8sZ0JBQWdCLE1BQU0sK0JBQStCLENBQUM7QUFDN0QsT0FBTyxjQUFjLE1BQU0sNkJBQTZCLENBQUM7QUFDekQsT0FBTyxjQUFjLE1BQU0sNkJBQTZCLENBQUM7QUFDekQsT0FBTyxZQUFZLE1BQU0sMkJBQTJCLENBQUM7QUFDckQsT0FBTyxjQUFjLE1BQU0sNkJBQTZCLENBQUM7QUFDekQsT0FBTyxnQkFBZ0IsTUFBTSwrQkFBK0IsQ0FBQztBQUM3RCxPQUFPLGNBQWMsTUFBTSw2QkFBNkIsQ0FBQztBQUN6RCxPQUFPLFlBQVksTUFBTSwyQkFBMkIsQ0FBQztBQUNyRCxPQUFPLGVBQWUsTUFBTSwrQkFBK0IsQ0FBQztBQUM1RCxPQUFPLGFBQWEsTUFBTSw2QkFBNkIsQ0FBQztBQUN4RCxPQUFPLGFBQWEsTUFBTSw2QkFBNkIsQ0FBQztBQUN4RCxPQUFPLFdBQVcsTUFBTSwyQkFB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