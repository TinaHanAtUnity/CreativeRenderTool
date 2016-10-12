import EnglishEndscreen from 'json/locale/en/endscreen.json';
import EnglishOverlay from 'json/locale/en/overlay.json';
import FinnishEndscreen from 'json/locale/fi/endscreen.json';
import FinnishOverlay from 'json/locale/fi/overlay.json';

export class Localization {

    private static _languageMap = {
        'en': {
            'endscreen': JSON.parse(EnglishEndscreen),
            'overlay': JSON.parse(EnglishOverlay)
        },
        'fi': {
            'endscreen': JSON.parse(FinnishEndscreen),
            'overlay': JSON.parse(FinnishOverlay)
        }
    };

    private _language: string;
    private _namespace: string;

    constructor(language: string, namespace: string) {
        this._language = language;
        this._namespace = namespace;
    }

    public translate(phrase: string): string {
        const languageMap = Localization._languageMap[this._language];
        if(!languageMap) {
            return phrase;
        }
        const namespaceMap = languageMap[this._namespace];
        if(!namespaceMap || !(phrase in namespaceMap)) {
            return phrase;
        }
        return namespaceMap[phrase];
    }

}
