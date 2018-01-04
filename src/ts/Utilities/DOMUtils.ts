export class DOMUtils {

    // This implementation is taken from https://developer.mozilla.org/en/docs/Web/API/DOMParser

    public static parseFromString(markup: string, type: string): Document {
        if (/^\s*text\/html\s*(?:;|$)/i.test(type)) {
            const doc = document.implementation.createHTMLDocument("");
            if (markup.toLowerCase().indexOf('<!doctype') > -1) {
                doc.documentElement.innerHTML = markup;
            } else {
                doc.body.innerHTML = markup;
            }
            return doc;
        } else {
            return DOMUtils.nativeParse.apply(new DOMParser(), arguments);
        }
    }

    private static nativeParse = DOMParser.prototype.parseFromString;
}
