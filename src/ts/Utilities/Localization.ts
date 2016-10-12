import EnglishEndscreen from 'json/locale/en/endscreen.json';
import FinnishEndscreen from 'json/locale/fi/endscreen.json';

export class Localization {

    private static _languageMap = {
        'en': JSON.parse(EnglishEndscreen),
        'fi': JSON.parse(FinnishEndscreen)
    };

    private _language: string;

    constructor(language: string) {
        this._language = language;
    }

    public translate(phrase: string): string {
        const map = Localization._languageMap[this._language];
        if(!map || !(phrase in map)) {
            return phrase;
        }
        return map[phrase];
    }

}
