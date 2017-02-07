import { Placement } from 'Models/Placement';
import { ClientInfo } from 'Models/ClientInfo';
import { INativeResponse } from 'Utilities/Request';
import { Platform } from 'Constants/Platform';
import { VastParser } from 'Utilities/VastParser';
import { NativeBridge } from 'Native/NativeBridge';
import { FakeDeviceInfo } from './FakeDeviceInfo';
import { DeviceInfo } from 'Models/DeviceInfo';
import DummyCampaign from 'json/DummyCampaign.json';
import { PerformanceCampaign } from 'Models/PerformanceCampaign';

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

    public static getCampaign(): PerformanceCampaign {
        return new PerformanceCampaign(JSON.parse(DummyCampaign), 'abc123', 123);
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
        const domParser = new DOMParser();
        vastParser = new VastParser(domParser);
        return vastParser;
    }

    public static getNativeBridge(platform?: Platform): NativeBridge {
        if(typeof platform === 'undefined') {
            platform = Platform.TEST;
        }
        const backend = {
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
