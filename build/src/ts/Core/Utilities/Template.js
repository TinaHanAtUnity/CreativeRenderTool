/* tslint:disable:quotemark */
// based on underscore.js templates
export class Template {
    constructor(templateString, localization) {
        this._localization = localization;
        let index = 0;
        let source = "__p+='";
        templateString.replace(Template._matcher, (match, interpolate, evaluate, offset) => {
            source += templateString.slice(index, offset).replace(Template._escapeRegExp, Template._escapeChar);
            index = offset + match.length;
            if (interpolate) {
                source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
            }
            else if (evaluate) {
                source += "';\n" + evaluate + "\n__p+='";
            }
            return match;
        });
        source += "';\n";
        source = "var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};\n" + source + 'return __p;\n';
        try {
            const templateFunction = new Function('data', source);
            this._templateFunction = (data) => {
                return templateFunction.call(this, data);
            };
        }
        catch (error) {
            error.source = source;
            throw error;
        }
    }
    render(data) {
        if (this._localization) {
            data.t = (phrase) => this._localization.translate(phrase);
        }
        else {
            data.t = (phrase) => phrase;
        }
        return this._templateFunction(data);
    }
}
Template._matcher = /<%=([\s\S]+?)%>|<%([\s\S]+?)%>|$/g;
Template._escapes = {
    "'": "'",
    '\\': '\\',
    '\r': 'r',
    '\n': 'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
};
Template._escapeRegExp = /\\|'|\r|\n|\u2028|\u2029/g;
Template._escapeChar = (match) => {
    return '\\' + Template._escapes[match];
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVtcGxhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQ29yZS9VdGlsaXRpZXMvVGVtcGxhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsOEJBQThCO0FBQzlCLG1DQUFtQztBQUluQyxNQUFNLE9BQU8sUUFBUTtJQXNCakIsWUFBWSxjQUFzQixFQUFFLFlBQTJCO1FBQzNELElBQUksQ0FBQyxhQUFhLEdBQUcsWUFBWSxDQUFDO1FBQ2xDLElBQUksS0FBSyxHQUFXLENBQUMsQ0FBQztRQUN0QixJQUFJLE1BQU0sR0FBVyxRQUFRLENBQUM7UUFDOUIsY0FBYyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsS0FBYSxFQUFFLFdBQW1CLEVBQUUsUUFBZ0IsRUFBRSxNQUFjLEVBQVUsRUFBRTtZQUN2SCxNQUFNLElBQUksY0FBYyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3BHLEtBQUssR0FBRyxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztZQUU5QixJQUFJLFdBQVcsRUFBRTtnQkFDYixNQUFNLElBQUksYUFBYSxHQUFHLFdBQVcsR0FBRyxzQkFBc0IsQ0FBQzthQUNsRTtpQkFBTSxJQUFJLFFBQVEsRUFBRTtnQkFDakIsTUFBTSxJQUFJLE1BQU0sR0FBRyxRQUFRLEdBQUcsVUFBVSxDQUFDO2FBQzVDO1lBRUQsT0FBTyxLQUFLLENBQUM7UUFDakIsQ0FBQyxDQUFDLENBQUM7UUFDSCxNQUFNLElBQUksTUFBTSxDQUFDO1FBRWpCLE1BQU0sR0FBRywyRkFBMkYsR0FBRyxNQUFNLEdBQUcsZUFBZSxDQUFDO1FBRWhJLElBQUk7WUFDQSxNQUFNLGdCQUFnQixHQUFHLElBQUksUUFBUSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztZQUN0RCxJQUFJLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxJQUFhLEVBQUUsRUFBRTtnQkFDdkMsT0FBTyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzdDLENBQUMsQ0FBQztTQUNMO1FBQUMsT0FBTyxLQUFLLEVBQUU7WUFDWixLQUFLLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztZQUN0QixNQUFNLEtBQUssQ0FBQztTQUNmO0lBQ0wsQ0FBQztJQUVNLE1BQU0sQ0FBQyxJQUFnQztRQUMxQyxJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7WUFDcEIsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQWMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLGFBQWMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDdEU7YUFBTTtZQUNILElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFjLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQztTQUN2QztRQUNELE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3hDLENBQUM7O0FBMURjLGlCQUFRLEdBQVcsbUNBQW1DLENBQUM7QUFFdkQsaUJBQVEsR0FBOEI7SUFDakQsR0FBRyxFQUFFLEdBQUc7SUFDUixJQUFJLEVBQUUsSUFBSTtJQUNWLElBQUksRUFBRSxHQUFHO0lBQ1QsSUFBSSxFQUFFLEdBQUc7SUFDVCxRQUFRLEVBQUUsT0FBTztJQUNqQixRQUFRLEVBQUUsT0FBTztDQUNwQixDQUFDO0FBRWEsc0JBQWEsR0FBVywyQkFBMkIsQ0FBQztBQUVwRCxvQkFBVyxHQUFzRCxDQUFDLEtBQWEsRUFBVSxFQUFFO0lBQ3RHLE9BQU8sSUFBSSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDM0MsQ0FBQyxDQUFBIn0=