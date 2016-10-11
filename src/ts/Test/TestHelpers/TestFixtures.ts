import { Placement } from 'Models/Placement';
import { ClientInfo } from 'Models/ClientInfo';
import { INativeResponse } from 'Utilities/Request';
import { Platform } from 'Constants/Platform';
import { VastParser } from 'Utilities/VastParser';
import { NativeBridge } from 'Native/NativeBridge';
import { FakeDeviceInfo } from './FakeDeviceInfo';
import { DeviceInfo } from 'Models/DeviceInfo';
import { Campaign } from 'Models/Campaign';

export class TestFixtures {

    public static getPlacement(): Placement {
        return new Placement({
            id: 'fooId',
            name: 'fooName',
            'default': false,
            allowSkip: false,
            skipInSeconds: 0,
            disableBackButton: false,
            useDeviceOrientationForVideo: false,
            muteVideo: false,
        });
    }

    public static getCampaign(): Campaign {
        return new Campaign({
            id: '123abc',
            appStoreId: 'com.test',
            appStoreCountry: 'us',
            gameId: 1234,
            gameName: 'Test game',
            gameIcon: 'https://www.example.net/icon.png',
            rating: 1,
            ratingCount: 12345,
            endScreenLandscape: 'https://www.example.net/landscape.png',
            endScreenPortrait: 'https://www.example.net/portrait.png',
            trailerDownloadable: 'https://www.example.net/hdvideo.mp4',
            trailerDownloadableSize: 1234567,
            trailerStreaming: 'https://www.example.net/streamingvideo.mp4',
            clickAttributionUrl: 'https://www.example.net/click_attribution',
            clickAttributionUrlFollowsRedirects: false,
            bypassAppSheet: false
        }, 'abc123', 123);
    }

    public static getClientInfo(platform?: Platform): ClientInfo {
        if(typeof platform === 'undefined') {
            platform = Platform.ANDROID;
        }

        return new ClientInfo(platform, [
            '12345',
            false,
            'com.unity3d.ads.example',
            '2.0.0-test2',
            '2.0.0-alpha2',
            true,
            'http://example.com/config.json',
            'http://example.com/index.html',
            null
        ]);
    }

    public static getDeviceInfo(platform?: Platform): DeviceInfo {
        if(typeof platform === 'undefined') {
            platform = Platform.ANDROID;
        }

        return new FakeDeviceInfo(TestFixtures.getNativeBridge(), platform);
    }

    public static getOkNativeResponse(): INativeResponse {
        return {
            url: 'http://foo.url.com',
            response: 'foo response',
            responseCode: 200,
            headers: [['location', 'http://foobar.com']],
        };
    }

    public static getVastParser(): VastParser {
        let vastParser: VastParser;
        let domParser = new DOMParser();
        vastParser = new VastParser(domParser);
        return vastParser;
    }

    public static getNativeBridge(platform?: Platform): NativeBridge {
        if(typeof platform === 'undefined') {
            platform = Platform.TEST;
        }
        let backend = {
            handleInvocation: function() {
                // no-op
            },
            handleCallback: function() {
                // no-op
            }
        };
        return new NativeBridge(backend, platform);
    }
}
