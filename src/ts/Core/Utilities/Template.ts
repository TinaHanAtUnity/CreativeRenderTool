/* tslint:disable:quotemark */
// based on underscore.js templates

import { Localization } from 'Core/Utilities/Localization';

export class Template {

    private static _matcher: RegExp = /<%=([\s\S]+?)%>|<%([\s\S]+?)%>|$/g;

    private static _escapes: { [key: string]: string } = {
        "'": "'",
        '\\': '\\',
        '\r': 'r',
        '\n': 'n',
        '\u2028': 'u2028',
        '\u2029': 'u2029'
    };

    private static _escapeRegExp: RegExp = /\\|'|\r|\n|\u2028|\u2029/g;

    private static _escapeChar: (substring: string, ...args: unknown[]) => string = (match: string): string => {
        return '\\' + Template._escapes[match];
    }

    private _localization?: Localization;
    private _templateFunction: (data: unknown) => string;

    constructor(templateString: string, localization?: Localization) {
        this._localization = localization;
        let index: number = 0;
        let source: string = "__p+='";
        templateString.replace(Template._matcher, (match: string, interpolate: string, evaluate: string, offset: number): string => {
            source += templateString.slice(index, offset).replace(Template._escapeRegExp, Template._escapeChar);
            index = offset + match.length;

            if(interpolate) {
                source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
            } else if(evaluate) {
                source += "';\n" + evaluate + "\n__p+='";
            }

            return match;
        });
        source += "';\n";

        source = "var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};\n" + source + 'return __p;\n';

        try {
            const templateFunction = new Function('data', source);
            this._templateFunction = (data: unknown) => {
                return templateFunction.call(this, data);
            };
        } catch(error) {
            error.source = source;
            throw error;
        }
    }

    public render(data: unknown): string {
        if(this._localization) {
            data.t = (phrase: string) => this._localization!.translate(phrase);
        } else {
            data.t = (phrase: string) => phrase;
        }
        return this._templateFunction(data);
    }

}
