import { Platform } from "Constants/Platform";

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

    public static encode(url: string): string {
        if(url) {
            url = url.replace(/"/g, '%22');
            url = url.replace(/</g, '%3C');
            url = url.replace(/>/g, '%3E');
            url = url.replace(/#/g, '%23');
            url = url.replace(/{/g, '%7B');
            url = url.replace(/}/g, '%7D');
            url = url.replace(/\|/g, '%7C');
            url = url.replace(/\\/g, '%5C');
            url = url.replace(/\^/g, '%5E');
            url = url.replace(/~/g, '%7E');
            url = url.replace(/\[/g, '%5B');
            url = url.replace(/]/g, '%5D');
            url = url.replace(/`/g, '%60');
        }

        return url;
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

    public static addParameters(url: string, parameters: { [key: string]: any }): string {
        let newUrl: string = url.toString();
        if(newUrl.indexOf('?') !== -1) {
            newUrl += '&';
        } else {
            newUrl += '?';
        }

        const pairs: string[] = [];
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
        if (locationString.indexOf('?') === -1) {
            return null;
        }
        const queryString: string[] = locationString.split('?')[1].split('&');

        for(const entryPair of queryString) {
            const queryParam = entryPair.split('=');
            if(queryParam[0] === parameter) {
                return queryParam[1];
            }
        }

        return null;
    }

    public static isValid(url: string): boolean {
        // note: this is not an attempt for full URL validation, instead this just checks that protocol is http(s) and
        // all URL characters are legal following RFC3986, using ASCII character ranges &-; and ?-[ is intentional
        if(url && (url.match(/^http:./i) || url.match(/^https:./i) && url.match(/^([\!\$\#\&-\;\=\?-\[\]_a-z~{}|\\^`]|[\u00A1-\uFFFF]|%[0-9a-fA-F]{2})+$/i))) {
            return true;
        }

        return false;
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
        }

        for (const protocol of whitelisted) {
            if (url.indexOf(protocol) === 0) {
                return true;
            }
        }
        return false;
    }

    private static iosWhitelistedProtocols = ['market', 'itunes', 'itms', 'itmss'];
    private static androidWhitelistedProtocols = ['market'];
}
