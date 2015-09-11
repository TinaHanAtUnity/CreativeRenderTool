class Url {

    static addParameters(url: string, parameters: {}) {
        let newUrl = url.toString();
        if (newUrl.indexOf('?') !== -1) {
            newUrl += "&";
        }
        else {
            newUrl += "?";
        }

        let pairs = [];
        for (let key in parameters) {
            let value = parameters[key];
            if (value !== undefined) {
                pairs.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
            }
        }

        newUrl += pairs.join("&");
        return newUrl;
    }

}

export = Url;