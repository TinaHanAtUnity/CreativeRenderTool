import EnglishEndscreen from 'json/locale/en/endscreen.json';
import EnglishOverlay from 'json/locale/en/overlay.json';
import EnglishLoadingScreen from 'json/locale/en/loadingscreen.json';
import RussianEndscreen from 'json/locale/ru/endscreen.json';
import RussianOverlay from 'json/locale/ru/overlay.json';
import RussianLoadingScreen from 'json/locale/ru/loadingscreen.json';
import JapaneseEndscreen from 'json/locale/ja/endscreen.json';
import JapaneseOverlay from 'json/locale/ja/overlay.json';
import KoreanEndscreen from 'json/locale/ko/endscreen.json';
import KoreanOverlay from 'json/locale/ko/overlay.json';
import ItalianEndscreen from 'json/locale/it/endscreen.json';
import ItalianOverlay from 'json/locale/it/overlay.json';
import ItalianLoadingScreen from 'json/locale/it/loadingscreen.json';
import GermanEndscreen from 'json/locale/de/endscreen.json';
import GermanOverlay from 'json/locale/de/overlay.json';
import GermanLoadingScreen from 'json/locale/de/loadingscreen.json';
import ChineseSimplifiedEndscreen from 'json/locale/zh_Hans/endscreen.json';
import ChineseSimplifiedOverlay from 'json/locale/zh_Hans/overlay.json';
import ChineseTraditionalEndscreen from 'json/locale/zh_Hant/endscreen.json';
import ChineseTraditionalOverlay from 'json/locale/zh_Hant/overlay.json';
import ChineseSimplifiedLoadingScreen from 'json/locale/zh_Hans/loadingscreen.json';
import ChineseTraditionalLoadingScreen from 'json/locale/zh_Hant/loadingscreen.json';
import FinnishEndscreen from 'json/locale/fi/endscreen.json';
import FinnishOverlay from 'json/locale/fi/overlay.json';
import FinnishLoadingScreen from 'json/locale/fi/loadingscreen.json';
import SpanishEndscreen from 'json/locale/es/endscreen.json';
import SpanishOverlay from 'json/locale/es/overlay.json';
import SpanishLoadingScreen from 'json/locale/es/loadingscreen.json';
import FrenchEndscreen from 'json/locale/fr/endscreen.json';
import FrenchOverlay from 'json/locale/fr/overlay.json';
import FrenchLoadingScreen from 'json/locale/fr/loadingscreen.json';
import TurkishEndscreen from 'json/locale/tr/endscreen.json';
import TurkishOverlay from 'json/locale/tr/overlay.json';
import DanishEndscreen from 'json/locale/da_DK/endscreen.json';
import DanishOverlay from 'json/locale/da_DK/overlay.json';
import NorwegianEndscreen from 'json/locale/nb/endscreen.json';
import NorwegianOverlay from 'json/locale/nb/overlay.json';
import LithuanianEndscreen from 'json/locale/lt/endscreen.json';
import LithuanianOverlay from 'json/locale/lt/overlay.json';
import IcelandicEndscreen from 'json/locale/is/endscreen.json';
import IcelandicOverlay from 'json/locale/is/overlay.json';
import RomanianEndscreen from 'json/locale/ro/endscreen.json';
import RomanianOverlay from 'json/locale/ro/overlay.json';
import PortugueseEndscreen from 'json/locale/pt/endscreen.json';
import PortugueseOverlay from 'json/locale/pt/overlay.json';
import PortugueseLoadingScreen from 'json/locale/pt/loadingscreen.json';

interface ILanguageMap {
    [key: string]: { // device language regexp
        [key: string]: { // namespace
            [key: string]: string // translation map
        }
    };
}

interface ILocalizedAbbreviations {
    [key: string]: { // device language regexp
        thousand: string,
        million: string
    };
}

export class Localization {

    public static getLanguageMap(language: string, namespace: string): { [key: string]: string } | undefined {
        const languageMap = Localization._languageMap[language];
        if(languageMap) {
            return languageMap[namespace];
        }
        for(const key in Localization._languageMap) {
            if(Localization._languageMap.hasOwnProperty(key)) {
                if(language.match(key)) {
                    return Localization._languageMap[key][namespace];
                }
            }
        }
        return undefined;
    }

    public static setLanguageMap(language: string, namespace: string, map: { [key: string]: string }) {
        if(!Localization._languageMap) {
            Localization._languageMap = {};
        }
        if(!Localization._languageMap[language]) {
            Localization._languageMap[language] = {};
        }
        Localization._languageMap[language][namespace] = map;
    }

    public static getLocalizedAbbreviations(language: string): { thousand: string, million: string } | undefined {
        const localizedAbbreviations = Localization._localizedAbbreviations[language];
        if(localizedAbbreviations) {
            return localizedAbbreviations;
        }
        for(const key in Localization._localizedAbbreviations) {
            if(Localization._localizedAbbreviations.hasOwnProperty(key)) {
                if(language.match(key)) {
                    return Localization._localizedAbbreviations[key];
                }
            }
        }
        return undefined;
    }

    private static _languageMap: ILanguageMap = {
        'en.*': {
            'endscreen': JSON.parse(EnglishEndscreen),
            'overlay': JSON.parse(EnglishOverlay),
            'loadingscreen': JSON.parse(EnglishLoadingScreen)
        },
        'ru.*': {
            'endscreen': JSON.parse(RussianEndscreen),
            'overlay': JSON.parse(RussianOverlay),
            'loadingscreen': JSON.parse(RussianLoadingScreen)
        },
        'ja.*': {
            'endscreen': JSON.parse(JapaneseEndscreen),
            'overlay': JSON.parse(JapaneseOverlay)
        },
        'ko.*': {
            'endscreen': JSON.parse(KoreanEndscreen),
            'overlay': JSON.parse(KoreanOverlay)
        },
        'it.*': {
            'endscreen': JSON.parse(ItalianEndscreen),
            'overlay': JSON.parse(ItalianOverlay),
            'loadingscreen': JSON.parse(ItalianLoadingScreen)
        },
        'de.*': {
            'endscreen': JSON.parse(GermanEndscreen),
            'overlay': JSON.parse(GermanOverlay),
            'loadingscreen': JSON.parse(GermanLoadingScreen)
        },
        'zh(_Hant)?(_TW|_HK|_MO|_Hant)+$': {
            'endscreen': JSON.parse(ChineseTraditionalEndscreen),
            'overlay': JSON.parse(ChineseTraditionalOverlay),
            'loadingscreen': JSON.parse(ChineseTraditionalLoadingScreen)
        },
        'zh(_Hans)?(_\\D\\D)?$': {
            'endscreen': JSON.parse(ChineseSimplifiedEndscreen),
            'overlay': JSON.parse(ChineseSimplifiedOverlay),
            'loadingscreen': JSON.parse(ChineseSimplifiedLoadingScreen)
        },
        'fi.*': {
            'endscreen': JSON.parse(FinnishEndscreen),
            'overlay': JSON.parse(FinnishOverlay),
            'loadingscreen': JSON.parse(FinnishLoadingScreen)
        },
        'es.*': {
            'endscreen': JSON.parse(SpanishEndscreen),
            'overlay': JSON.parse(SpanishOverlay),
            'loadingscreen': JSON.parse(SpanishLoadingScreen)
        },
        'fr.*': {
            'endscreen': JSON.parse(FrenchEndscreen),
            'overlay': JSON.parse(FrenchOverlay),
            'loadingscreen': JSON.parse(FrenchLoadingScreen)
        },
        'tr.*': {
            'endscreen': JSON.parse(TurkishEndscreen),
            'overlay': JSON.parse(TurkishOverlay)
        },
        'da_DK': {
            'endscreen': JSON.parse(DanishEndscreen),
            'overlay': JSON.parse(DanishOverlay)
        },
        'nb.*': {
            'endscreen': JSON.parse(NorwegianEndscreen),
            'overlay': JSON.parse(NorwegianOverlay)
        },
        'lt.*': {
            'endscreen': JSON.parse(LithuanianEndscreen),
            'overlay': JSON.parse(LithuanianOverlay)
        },
        'is.*': {
            'endscreen': JSON.parse(IcelandicEndscreen),
            'overlay': JSON.parse(IcelandicOverlay)
        },
        'ro.*': {
            'endscreen': JSON.parse(RomanianEndscreen),
            'overlay': JSON.parse(RomanianOverlay)
        },
        'pt.*': {
            'endscreen': JSON.parse(PortugueseEndscreen),
            'overlay': JSON.parse(PortugueseOverlay),
            'loadingscreen': JSON.parse(PortugueseLoadingScreen)
        }
    };

    private static _localizedAbbreviations: ILocalizedAbbreviations = {
        'en.*': {
            thousand: 'k',
            million: 'm'
        },
        'zh.*': {
            thousand: '千',
            million: '百万'
        }
    };

    private _language: string;
    private _namespace: string;

    constructor(language: string, namespace: string) {
        this._language = language;
        this._namespace = namespace;
    }

    public translate(phrase: string): string {
        const languageMap = Localization.getLanguageMap(this._language, this._namespace);
        if(!languageMap || !(phrase in languageMap)) {
            return phrase;
        }
        return languageMap[phrase];
    }

    public abbreviate(number: number): string {
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
