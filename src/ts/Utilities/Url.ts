export default class Url {

    public static addParameters(url: string, parameters: {}): string {
        let newUrl: string = url.toString();
        if (newUrl.indexOf('?') !== -1) {
            newUrl += '&';
        } else {
            newUrl += '?';
        }

        let pairs: Object[] = [];
        for (let key in parameters) {
            if(parameters.hasOwnProperty(key)) {
                let value: string = parameters[key];
                if (value !== undefined) {
                    pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
                }
            }
        }

        newUrl += pairs.join('&');
        return newUrl;
    }

}
