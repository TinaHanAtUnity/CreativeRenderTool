// Based on underscore.js templates

class Template {

    private static _matcher = /<%=([\s\S]+?)%>|<%([\s\S]+?)%>|$/g;

    private static _escapes = {
        "'": "'",
        '\\': '\\',
        '\r': 'r',
        '\n': 'n',
        '\u2028': 'u2028',
        '\u2029': 'u2029'
    };

    private static _escapeRegExp = /\\|'|\r|\n|\u2028|\u2029/g;

    private static _escapeChar = (match) => {
        return '\\' + Template._escapes[match];
    };

    private _templateFunction: (data: any) => string;

    constructor(templateString: string) {
        let index = 0;
        let source = "__p+='";
        templateString.replace(Template._matcher, function(match, interpolate, evaluate, offset) {
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
            let templateFunction = new Function('data', source);
            this._templateFunction = function(data) {
                return templateFunction.call(this, data);
            };
        } catch (error) {
            error.source = source;
            throw error;
        }
    }

    render(data: any): string {
        return this._templateFunction(data);
    }

}

export = Template;