import { Platform } from 'Core/Constants/Platform';
export class Url {
    static decodeProtocol(url) {
        return url.replace(/^(https|http)%3A%2F%2F/i, '$1://');
    }
    static applyEncode(url, encodeFunc) {
        if (url) {
            let encodedUrl = '';
            let i = 0;
            while (i < url.length) {
                // Skip already encoded URL characters
                if (url[i] === '%' && (url.length - i) >= 3 && Url.isNumber(url[i + 1]) && Url.isNumber(url[i + 2])) {
                    encodedUrl += url[i++];
                    encodedUrl += url[i++];
                    encodedUrl += url[i++];
                    continue;
                }
                encodedUrl += encodeFunc(url[i]);
                i++;
            }
            return encodedUrl;
        }
        return url;
    }
    static encode(url) {
        return this.applyEncode(url, (str) => {
            return encodeURI(str);
        });
    }
    static encodeParam(param) {
        return this.applyEncode(param, (str) => {
            return encodeURIComponent(str);
        });
    }
    static encodeUrlWithQueryParams(url) {
        const queryIndex = url.indexOf('?');
        if (queryIndex === -1) {
            return Url.encode(url);
        }
        const urlAndQuery = url.split('?');
        const uri = urlAndQuery[0];
        const queryParams = urlAndQuery[1].split('&');
        const encodedQueryPairs = [];
        for (const queryPair of queryParams) {
            const queryParamSplitted = queryPair.split('=');
            const encodedQueryParam = [];
            for (const queryParam of queryParamSplitted) {
                encodedQueryParam.push(Url.encodeParam(queryParam));
            }
            encodedQueryPairs.push(encodedQueryParam.join('='));
        }
        const encodedUri = Url.encode(uri);
        return `${encodedUri}?${encodedQueryPairs.join('&')}`;
    }
    static parse(url) {
        const parser = document.createElement('a');
        parser.href = url;
        return {
            protocol: parser.protocol,
            host: parser.host,
            hostname: parser.hostname,
            port: parseInt(parser.port, 10),
            pathname: parser.pathname,
            search: parser.search,
            hash: parser.hash
        };
    }
    static addParameters(url, parameters, useHashBang) {
        let newUrl = url.toString();
        const firstParamPrefix = useHashBang ? '#' : '?';
        if (newUrl.indexOf(firstParamPrefix) !== -1) {
            newUrl += '&';
        }
        else {
            newUrl += firstParamPrefix;
        }
        const pairs = [];
        for (const key in parameters) {
            if (parameters.hasOwnProperty(key)) {
                const value = parameters[key];
                if (value !== undefined) {
                    pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
                }
            }
        }
        newUrl += pairs.join('&');
        return newUrl;
    }
    static getQueryParameter(locationString, parameter) {
        if (locationString.indexOf('?') === -1) {
            return null;
        }
        const queryString = locationString.split('?')[1].split('&');
        for (const entryPair of queryString) {
            const queryParam = entryPair.split('=');
            if (queryParam[0] === parameter) {
                return queryParam[1];
            }
        }
        return null;
    }
    static removeQueryParameter(locationString, parameter) {
        const parameterValue = Url.getQueryParameter(locationString, parameter);
        if (parameterValue == null) {
            return locationString;
        }
        return locationString.replace(new RegExp('&?' + parameter + '=' + parameterValue), '');
    }
    static isValid(url) {
        // note: this is not an attempt for full URL validation, instead this just checks that protocol is http(s) and
        // all URL characters are legal following RFC3986, using ASCII character ranges &-; and ?-[ is intentional
        if (url && (url.match(/^http:./i) || url.match(/^https:./i)) && Url.isValidUrlCharacters(url)) {
            return true;
        }
        return false;
    }
    static isValidUrlCharacters(url) {
        return url && url.match(/^([\!\$\#\&-\;\=\?-\[\]_a-z~{}|\\^`]|[\u00A1-\uFFFF]|%[0-9a-fA-F]{2})+$/i) ? true : false;
    }
    static isValidProtocol(url) {
        // itms-apps:// is the protocol for linking to an app store
        if (url && (url.match(/^http:./i) || url.match(/^https:./i) || url.match(/^itms-apps:/i))) {
            return true;
        }
        else {
            return false;
        }
    }
    static isRelativeProtocol(url) {
        if (url && url.match(/^\/\/./i)) {
            return true;
        }
        else {
            return false;
        }
    }
    static isInternalPTSTrackingProtocol(url) {
        if (url && url.match(/^https:\/\/tracking.prd.mz.internal.unity3d.com/i)) {
            return true;
        }
        else {
            return false;
        }
    }
    static getProtocol(url) {
        const urlElement = document.createElement('a');
        urlElement.setAttribute('href', url);
        return urlElement.protocol;
    }
    static isProtocolWhitelisted(url, platform) {
        let whitelisted = [];
        switch (platform) {
            case Platform.IOS:
                whitelisted = this.iosWhitelistedProtocols;
                break;
            case Platform.ANDROID:
                whitelisted = this.androidWhitelistedProtocols;
                break;
            default:
        }
        for (const protocol of whitelisted) {
            if (url.indexOf(protocol) === 0) {
                return true;
            }
        }
        return false;
    }
    static getAppStoreUrlTemplates(platform) {
        let appStoreUrlTemplates = [];
        switch (platform) {
            case Platform.IOS:
                appStoreUrlTemplates = this.iosAppStoreUrlTemplates;
                break;
            case Platform.ANDROID:
                appStoreUrlTemplates = this.androidAppStoreUrlTemplates;
                break;
            default:
        }
        return appStoreUrlTemplates;
    }
    static isNumber(c) {
        return c.match(/^[0-9a-fA-F]$/) !== null;
    }
}
Url.iosWhitelistedProtocols = ['itunes', 'itms', 'itmss', 'http', 'https'];
Url.androidWhitelistedProtocols = ['market', 'http', 'https'];
Url.iosAppStoreUrlTemplates = ['https://itunes.apple.com'];
Url.androidAppStoreUrlTemplates = ['https://play.google.com'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXJsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0NvcmUvVXRpbGl0aWVzL1VybC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFZbkQsTUFBTSxPQUFPLEdBQUc7SUFFTCxNQUFNLENBQUMsY0FBYyxDQUFDLEdBQVc7UUFDcEMsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLHlCQUF5QixFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFFTyxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQVcsRUFBRSxVQUFtQztRQUN2RSxJQUFJLEdBQUcsRUFBRTtZQUNMLElBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQztZQUNwQixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDVixPQUFPLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxFQUFFO2dCQUNuQixzQ0FBc0M7Z0JBQ3RDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFO29CQUNqRyxVQUFVLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ3ZCLFVBQVUsSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDdkIsVUFBVSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUN2QixTQUFTO2lCQUNaO2dCQUVELFVBQVUsSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JB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