import EnglishEndscreen from 'json/locale/en/endscreen.json';
import EnglishOverlay from 'json/locale/en/overlay.json';
import FinnishEndscreen from 'json/locale/fi/endscreen.json';
import FinnishOverlay from 'json/locale/fi/overlay.json';
import TaiwanEndscreen from 'json/locale/zh_TW/endscreen.json';
import TaiwanOverlay from 'json/locale/zh_TW/overlay.json';

export class Localization {

    private static _languageMap = {
        'en.*': {
            'endscreen': JSON.parse(EnglishEndscreen),
            'overlay': JSON.parse(EnglishOverlay)
        },
        'fi.*': {
            'endscreen': JSON.parse(FinnishEndscreen),
            'overlay': JSON.parse(FinnishOverlay)
        },
        'zh_TW': {
            'endscreen': JSON.parse(TaiwanEndscreen),
            'overlay': JSON.parse(TaiwanOverlay)
        }
    };

    private _language: string;
    private _namespace: string;

    constructor(language: string, namespace: string) {
        this._language = language;
        this._namespace = namespace;
    }

    public translate(phrase: string): string {
        const languageMap = this.getLanguageMap(this._language, this._namespace);
        if(!languageMap || !(phrase in languageMap)) {
            return phrase;
        }
        return languageMap[phrase];
    }

    private getLanguageMap(language: string, namespace: string): { [key: string]: string } | undefined {
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

}
