import { TestApi } from './TestApi';

export class Url extends TestApi {

    public resolve(host: string): any[] {
        return ['OK', host, '8.8.8.8'];
    }

    public get(url: string, headers: [string, string][]): any[] {
        if(url.indexOf('/fill') !== -1) {
            let campaignResponse: {} = {
                'campaign': {
                    'id': '000000000000000000000000',
                    'gameId': 11017,
                    'gameName': 'Test Game (android)',
                    'bypassAppSheet': false,
                    'rating': '4.5',
                    'ratingCount': 10000,
                    'gameIcon': 'http://static.applifier.com/impact/11017/test_game_icon.png',
                    'endScreenLandscape': 'http://static.applifier.com/impact/11017/test_endscreen_landscape.png',
                    'endScreenPortrait': 'http://static.applifier.com/impact/11017/test_endscreen_portrait.png',
                    'trailerDownloadable': 'http://static.applifier.com/impact/11017/blue_test_trailer.mp4',
                    'trailerStreaming': 'http://static.applifier.com/impact/11017/blue_test_trailer.mp4',
                    'trailerDownloadableSize': 1445875,
                    'appStoreId': 'com.iUnity.angryBots'
                },
                'gamerId': '000000000000000000000000',
                'abGroup': 0
            };
            setTimeout(() => {
                this.getNativeBridge().handleEvent(['URL_COMPLETE', url, JSON.stringify(campaignResponse), 200, []]);
            }, 0);
            return ['OK'];
        } else if(url.indexOf('/configuration') !== -1) {
            let configResponse: {} = {
                country: 'FI',
                enabled: true,
                placements: [
                    {
                        id: 'incentivizedPlacement',
                        name: 'Incentivized placement',
                        default: false,
                        allowSkip: false,
                        disableBackButton: true,
                        muteVideo: false,
                        useDeviceOrientationForVideo: false
                    },
                    {
                        id: 'defaultVideoAndPicturePlacement',
                        name: 'Video ad placement',
                        default: true,
                        allowSkip: true,
                        disableBackButton: true,
                        muteVideo: false,
                        useDeviceOrientationForVideo: false,
                        skipInSeconds: 5
                    }
                ]
            };
            setTimeout(() => {
                this.getNativeBridge().handleEvent(['URL_COMPLETE', url, JSON.stringify(configResponse), 200, []]);
            }, 0);
            return ['OK'];
        } else if(url.indexOf('/success') !== -1) {
            setTimeout(() => {
                this.getNativeBridge().handleEvent(['URL_COMPLETE', url, 'Success response', 200, []]);
            }, 0);
            return ['OK'];
        } else if(url.indexOf('/fail') !== -1) {
            setTimeout(() => {
                this.getNativeBridge().handleEvent(['URL_FAILED', url, 'Fail response']);
            }, 0);
            return ['OK'];
        } else if(url.indexOf('/forwardheader') !== -1) {
            if(headers[0][0] === 'X-Test') {
                setTimeout(() => {
                    this.getNativeBridge().handleEvent(['URL_COMPLETE', url, headers[0][1], 200, []]);
                }, 0);
            } else {
                setTimeout(() => {
                    this.getNativeBridge().handleEvent(['URL_FAILED', url, 'No X-Test header found']);
                }, 0);
            }
            return ['OK'];
        }
    }

    public post(url: string, body: string, headers: [string, string][]): any[] {
        if(url.indexOf('/success') !== -1) {
            setTimeout(() => {
                this.getNativeBridge().handleEvent(['URL_COMPLETE', url, 'Success response', 200, []]);
            }, 0);
            return ['OK'];
        } else if(url.indexOf('/fail') !== -1) {
            setTimeout(() => {
                this.getNativeBridge().handleEvent(['URL_FAILED', url, 'Fail response']);
            }, 0);
            return ['OK'];
        } else if(url.indexOf('/forwardheader') !== -1) {
            if(headers[0][0] === 'X-Test') {
                setTimeout(() => {
                    this.getNativeBridge().handleEvent(['URL_COMPLETE', url, headers[0][1], 200, []]);
                }, 0);
            } else {
                setTimeout(() => {
                    this.getNativeBridge().handleEvent(['URL_FAILED', url, 'No X-Test header found']);
                }, 0);
            }
            return ['OK'];
        } else if(url.indexOf('/forwardbody') !== -1) {
            setTimeout(() => {
                this.getNativeBridge().handleEvent(['URL_COMPLETE', url, body, 200, []]);
            }, 0);
            return ['OK'];
        }
    }
}