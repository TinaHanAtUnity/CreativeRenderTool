export class DOMUtils {
    // This implementation is taken from https://developer.mozilla.org/en/docs/Web/API/DOMParser
    static parseFromString(markup, type) {
        if (/^\s*text\/html\s*(?:;|$)/i.test(type)) {
            const doc = document.implementation.createHTMLDocument('');
            if (markup.toLowerCase().indexOf('<!doctype') > -1) {
                doc.documentElement.innerHTML = markup;
            }
            else {
                doc.body.innerHTML = markup;
            }
            return doc;
        }
        else {
            return DOMUtils.nativeParse.apply(new DOMParser(), [markup, type]);
        }
    }
}
DOMUtils.nativeParse = DOMParser.prototype.parseFromString;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRE9NVXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQ29yZS9VdGlsaXRpZXMvRE9NVXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxPQUFPLFFBQVE7SUFFakIsNEZBQTRGO0lBRXJGLE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBYyxFQUFFLElBQW1CO1FBQzdELElBQUksMkJBQTJCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3hDLE1BQU0sR0FBRyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsa0JBQWtCLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDM0QsSUFBSSxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO2dCQUNoRCxHQUFHLENBQUMsZUFBZSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUM7YUFDMUM7aUJBQU07Z0JBQ0gsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDO2FBQy9CO1lBQ0QsT0FBTyxHQUFHLENBQUM7U0FDZDthQUFNO1lBQ0gsT0FBTyxRQUFRLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLFNBQVMsRUFBRSxFQUFFLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7U0FDdEU7SUFDTCxDQUFDOztBQUVjLG9CQUFXLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMifQ==