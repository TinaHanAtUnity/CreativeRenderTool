import { Backend } from 'Native/Backend/Backend';

export class Request {

    public static get(id: string, url: string, headers: [string, string][], connectTimeout: number, readTimeout: number) {
        let xhr = new XMLHttpRequest();
        xhr.onload = (event: Event) => {
            Backend.sendEvent('REQUEST', 'COMPLETE', id, url, xhr.responseText, xhr.status, xhr.getAllResponseHeaders());
        };
        xhr.open('GET', url);
        xhr.send();
    }

    public static post(id: string, url: string, body: string, headers: [string, string][], connectTimeout: number, readTimeout: number) {
        if(url.match(/games\/[0-9]+\/fill/)) {
            // tslint:disable:no-string-literal
            window['nativebridge']['handleEvent'](['REQUEST', 'COMPLETE', id, url, JSON.stringify({
                'abGroup': 8,
                'campaign': {
                    'appStoreId': 'com.machinezone.gow',
                    'bypassAppSheet': false,
                    'endScreenLandscape': 'http://cdn-highwinds.unityads.unity3d.com/impact/images/13480/59936aff93307f7e/rooftop-800x600.jpg',
                    'endScreenPortrait': 'http://cdn-highwinds.unityads.unity3d.com/impact/images/13480/466897a6fd7dd7f6/rooftop-600x800.jpg',
                    'gameIcon': 'https://static.applifier.com/impact/game-icons/Hy50CZE0.png',
                    'gameId': 13480,
                    'gameName': 'Game of War - Fire Age', 'id': '57a3d3f8d5b61a110861998d',
                    'rating': '4.143917',
                    'ratingCount': 614638,
                    'trailerDownloadable': 'http://cdn-highwinds.unityads.unity3d.com/impact/videos/13480/c542cd1da8af6177/rooftop-g-30/m31-1000.mp4',
                    'trailerDownloadableSize': 3552035,
                    'trailerStreaming': 'http://cdn-highwinds.unityads.unity3d.com/impact/videos/13480/c542cd1da8af6177/rooftop-g-30/b30-400.mp4'
                },
                'gamerId': '5714e06697e6810700104b1c'
            }), 200, []]);
            // tslint:enable:no-string-literal
            return;
        }

        let xhr = new XMLHttpRequest();
        xhr.onload = (event: Event) => {
            Backend.sendEvent('REQUEST', 'COMPLETE', id, url, xhr.responseText, xhr.status, xhr.getAllResponseHeaders());
        };
        xhr.open('POST', url);
        xhr.send(body);
    }

}