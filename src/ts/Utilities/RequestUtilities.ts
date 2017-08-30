import { Request, INativeResponse } from 'Utilities/Request';

export default class RequestUtilities {
    public static followUrl(request: Request, link: string): Promise<string> {
        // Follows the redirects of a URL, returning the final location.
        return new Promise((resolve, reject) => {
            const makeRequest = (url: string) => {
                url = url.trim();
                if (url.indexOf('http') === -1) {
                    // market:// or itunes:// urls can be opened directly
                    resolve(url);
                } else {
                    request.head(url).then((response: INativeResponse) => {
                        if (response.responseCode === 302) {
                            const location = Request.getHeader(response.headers, 'location');
                            if (location) {
                                makeRequest(location);
                            } else {
                                reject(new Error('302 Found did not have a "Location" header'));
                            }
                        } else if (Request.is2xxSuccessful(response.responseCode)) {
                            resolve(url);
                        } else {
                            reject(new Error(`Request to ${url} failed with status ${response.responseCode}`));
                        }
                    }).catch(reject);
                }
            };
            makeRequest(link);
        });
    }
}
