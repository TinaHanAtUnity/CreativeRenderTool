import EnglishEndscreen from 'json/locale/en/endscreen.json';
import EnglishOverlay from 'json/locale/en/overlay.json';
import RussianEndscreen from 'json/locale/ru/endscreen.json';
import RussianOverlay from 'json/locale/ru/overlay.json';

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
        }
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
