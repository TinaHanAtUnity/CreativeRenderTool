import { Platform } from 'Core/Constants/Platform';

export interface IUrl {
    protocol: string;
    host: string;
    hostname: string;
    port: number;
    pathname: string;
    search: string;
    hash: string;
}

export class Url {

    public static decodeProtocol(url: string): string {
        return url.replace(/^(https|http)%3A%2F%2F/i, '$1://');
    }

    private static applyEncode(url: string, encodeFunc: (url: string) => string): string {
        if (url) {
            let encodedUrl = '';
            let i = 0;
            while(i < url.length) {
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

    public static encode(url: string): string {
        return this.applyEncode(url, (str: string) => {
            return encodeURI(str);
        });
    }

    public static encodeParam(param: string): string {
        return this.applyEncode(param, (str: string) => {
            return encodeURIComponent(str);
        });
    }

    public static encodeUrlWithQueryParams(url: string): string {
        const queryIndex = url.indexOf('?');
        if (queryIndex === -1) {
            return Url.encode(url);
        }

        const urlAndQuery: string[] = url.split('?');
        const uri: string = urlAndQuery[0];
        const queryParams: string[] = urlAndQuery[1].split('&');
        const encodedQueryPairs: string[] = [];
        for (const queryPair of queryParams) {
            const queryParam = queryPair.split('=');
            encodedQueryPairs.push(Url.encodeParam(queryParam[0]) + '=' + Url.encodeParam(queryParam[1]));
        }

        const encodedUri = Url.encode(uri);
        return `${encodedUri}?${encodedQueryPairs.join('&')}`;
    }

    public static parse(url: string): IUrl {
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

    public static addParameters(url: string, parameters: { [key: string]: unknown }): string {
        let newUrl: string = url.toString();
        if (newUrl.indexOf('?') !== -1) {
            newUrl += '&';
        } else {
            newUrl += '?';
        }

        const pairs: string[] = [];
        for(const key in parameters) {
            if (parameters.hasOwnProperty(key)) {
                const value = <string>parameters[key];
                if (value !== undefined) {
                    pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
                }
            }
        }

        newUrl += pairs.join('&');
        return newUrl;
    }

    public static getQueryParameter(locationString: string, parameter: string): string | null {
        if (locationString.indexOf('?') === -1) {
            return null;
        }
        const queryString: string[] = locationString.split('?')[1].split('&');

        for(const entryPair of queryString) {
            const queryParam = entryPair.split('=');
            if (queryParam[0] === parameter) {
                return queryParam[1];
            }
        }

        return null;
    }

    public static removeQueryParameter(locationString: string, parameter: string): string {
        const parameterValue = Url.getQueryParameter(locationString, parameter);

        if (parameterValue == null) {
            return locationString;
        }

        return locationString.replace(new RegExp('&?' + parameter + '=' + parameterValue), '');
    }

    public static isValid(url: string): boolean {
        // note: this is not an attempt for full URL validation, instead this just checks that protocol is http(s) and
        // all URL characters are legal following RFC3986, using ASCII character ranges &-; and ?-[ is intentional
        if (url && (url.match(/^http:./i) || url.match(/^https:./i) && url.match(/^([\!\$\#\&-\;\=\?-\[\]_a-z~{}|\\^`]|[\u00A1-\uFFFF]|%[0-9a-fA-F]{2})+$/i))) {
            return true;
        }

        return false;
    }

    public static isValidProtocol(url: string): boolean {
        if (url && (url.match(/^http:./i) || url.match(/^https:./i))) {
            return true;
        } else {
            return false;
        }
    }

    public static isRelativeUrl(url: string): boolean {
        if (url && url.match(/^\/\/./i)) {
            return true;
        } else {
            return false;
        }
    }

    public static getProtocol(url: string): string {
        const urlElement = document.createElement('a');
        urlElement.setAttribute('href', url);
        return urlElement.protocol;
    }

    public static isProtocolWhitelisted(url: string, platform: Platform): boolean {
        let whitelisted: string[] = [];

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

    private static iosWhitelistedProtocols = ['itunes', 'itms', 'itmss', 'http', 'https'];
    private static androidWhitelistedProtocols = ['market', 'http', 'https'];

    private static isNumber(c: string): boolean {
        return c.match(/^[0-9a-fA-F]$/) !== null;
    }
}
