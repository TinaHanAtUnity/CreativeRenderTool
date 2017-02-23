export class Url {

    public static addParameters(url: string, parameters: { [key: string]: any }): string {
        let newUrl: string = url.toString();
        if(newUrl.indexOf('?') !== -1) {
            newUrl += '&';
        } else {
            newUrl += '?';
        }

        const pairs: Object[] = [];
        for(const key in parameters) {
            if(parameters.hasOwnProperty(key)) {
                const value: string = parameters[key];
                if(value !== undefined) {
                    pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
                }
            }
        }

        newUrl += pairs.join('&');
        return newUrl;
    }

    public static getQueryParameter(locationString: string, parameter: string): string | null {
        const queryString: string[] = locationString.split('?')[1].split('&');

        for(let i: number = 0; i < queryString.length; i++) {
            const queryParam = queryString[i].split('=');
            if(queryParam[0] === parameter) {
                return queryParam[1];
            }
        }

        return null;
    }

    public static isValid(url: string): boolean {
        if(url && (url.match(/^http:./i) || url.match(/^https:./i))) {
            return true;
        }

        return false;
    }
}
