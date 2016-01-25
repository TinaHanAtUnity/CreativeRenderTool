/* tslint:disable:no-string-literal */

export class Url {

    public get(url: string, headers: [string, string][]): any[] {
        let campaignResponse: {} = {
            'data': {
                'campaigns': [{
                    'id': '000000000000000000000000',
                    'gameId': 11017,
                    'gameName': 'Test Game (android)',
                    'tagLine': 'Unity Ads test campaign',
                    'clickUrl': 'http://impact.applifier.com/mobile/campaigns/000000000000000000000000/click/50507b163822f20000000001?test=true&platform=android&gameId=12345',
                    'customClickUrl': '',
                    'bypassAppSheet': false,
                    'rating': '4.5',
                    'ratingCount': 10000,
                    'cacheVideo': true,
                    'allowCache': true,
                    'gameIcon': 'http://static.applifier.com/impact/11017/test_game_icon.png',
                    'picture': 'http://static.applifier.com/impact/11017/test_game_icon.png',
                    'endScreen': 'http://static.applifier.com/impact/11017/test_endscreen_landscape.png',
                    'endScreenPortrait': 'http://static.applifier.com/impact/11017/test_endscreen_portrait.png',
                    'trailerDownloadable': 'http://static.applifier.com/impact/11017/blue_test_trailer.mp4',
                    'trailerStreaming': 'http://static.applifier.com/impact/11017/blue_test_trailer.mp4',
                    'trailerSize': 1445875,
                    'iTunesId': 'com.iUnity.angryBots',
                    'network': 'mobile_android'
                }],
                'gamerId': '000000000000000000000000',
                'abGroup': 0
            }
        };
        setTimeout(() => {
            window['nativebridge'].handleEvent('URL_COMPLETE', url, JSON.stringify(campaignResponse), 200, []);
        }, 0);
        return ['OK'];
    }

}