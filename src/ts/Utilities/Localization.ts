import EnglishEndscreen from 'json/locale/en/endscreen.json';
import EnglishOverlay from 'json/locale/en/overlay.json';
import RussianEndscreen from 'json/locale/ru/endscreen.json';
import RussianOverlay from 'json/locale/ru/overlay.json';
import JapaneseEndscreen from 'json/locale/ja/endscreen.json';
import JapaneseOverlay from 'json/locale/ja/overlay.json';
import KoreanEndscreen from 'json/locale/ko/endscreen.json';
import KoreanOverlay from 'json/locale/ko/overlay.json';
import ItalianEndscreen from 'json/locale/it/endscreen.json';
import ItalianOverlay from 'json/locale/it/overlay.json';
import GermanEndscreen from 'json/locale/de/endscreen.json';
import GermanOverlay from 'json/locale/de/overlay.json';
import ChineseSimplifiedEndscreen from 'json/locale/zh_Hans/endscreen.json';
import ChineseSimplifiedOverlay from 'json/locale/zh_Hans/overlay.json';
import ChineseTraditionalEndscreen from 'json/locale/zh_Hant/endscreen.json';
import ChineseTraditionalOverlay from 'json/locale/zh_Hant/overlay.json';
import FinnishEndscreen from 'json/locale/fi/endscreen.json';
import FinnishOverlay from 'json/locale/fi/overlay.json';
import SpanishEndscreen from 'json/locale/es/endscreen.json';
import SpanishOverlay from 'json/locale/es/overlay.json';
import FrenchEndscreen from 'json/locale/fr/endscreen.json';
import FrenchOverlay from 'json/locale/fr/overlay.json';
import TurkishEndscreen from 'json/locale/tr/endscreen.json';
import TurkishOverlay from 'json/locale/tr/overlay.json';
import DanishEndscreen from 'json/locale/da_DK/endscreen.json';
import DanishOverlay from 'json/locale/da_DK/overlay.json';
import NorwegianEndscreen from 'json/locale/nb/endscreen.json';
import NorwegianOverlay from 'json/locale/nb/overlay.json';

interface ILanguageMap {
    [key: string]: { // device language regexp
        [key: string]: { // namespace
            [key: string]: string // translation map
        }
    };
}

export class Localization {

    private static _languageMap: ILanguageMap = {
        'en.*': {
            'endscreen': JSON.parse(EnglishEndscreen),
            'overlay': JSON.parse(EnglishOverlay)
        },
        'ru.*': {
            'endscreen': JSON.parse(RussianEndscreen),
            'overlay': JSON.parse(RussianOverlay)
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
            'overlay': JSON.parse(ItalianOverlay)
        },
        'de.*': {
            'endscreen': JSON.parse(GermanEndscreen),
            'overlay': JSON.parse(GermanOverlay)
        },
        'zh(_Hant)?(_TW|_HK|_MO|_Hant)+$': {
            'endscreen': JSON.parse(ChineseTraditionalEndscreen),
            'overlay': JSON.parse(ChineseTraditionalOverlay)
        },
        'zh(_Hans)?(_\\D\\D)?$': {
            'endscreen': JSON.parse(ChineseSimplifiedEndscreen),
            'overlay': JSON.parse(ChineseSimplifiedOverlay)
        },
        'fi.*': {
            'endscreen': JSON.parse(FinnishEndscreen),
            'overlay': JSON.parse(FinnishOverlay)
        },
        'es.*': {
            'endscreen': JSON.parse(SpanishEndscreen),
            'overlay': JSON.parse(SpanishOverlay)
        },
        'fr.*': {
            'endscreen': JSON.parse(FrenchEndscreen),
            'overlay': JSON.parse(FrenchOverlay)
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
    };

    private _language: string;
    private _namespace: string;

    public static getLanguageMap(language: string, namespace: string): { [key: string]: string } | undefined {
        const languageMap = Localization._languageMap[language];
        if(languageMap) {
            return languageMap[namespace];
        }
        for(let key in Localization._languageMap) {
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

}
