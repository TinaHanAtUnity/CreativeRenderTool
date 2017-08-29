import { Placement } from 'Models/Placement';
import { ClientInfo } from 'Models/ClientInfo';
import { INativeResponse } from 'Utilities/Request';
import { Platform } from 'Constants/Platform';
import { VastParser } from 'Utilities/VastParser';
import { NativeBridge } from 'Native/NativeBridge';
import { FakeDeviceInfo } from './FakeDeviceInfo';
import { DeviceInfo } from 'Models/DeviceInfo';
import DummyCampaign from 'json/DummyCampaign.json';
import DummyMRAIDCampaign from 'json/DummyMRAIDCampaign.json';
import DummyDisplayInterstitialCampaign from 'json/DummyDisplayInterstitialCampaign.json';
import { PerformanceCampaign } from 'Models/PerformanceCampaign';
import { MRAIDCampaign } from 'Models/MRAIDCampaign';
import { Configuration } from 'Models/Configuration';
import { ICacheDiagnostics } from 'Utilities/Cache';
import { DisplayInterstitialCampaign } from "Models/DisplayInterstitialCampaign";

export class TestFixtures {
    public static getDisplayInterstitialCampaign(): DisplayInterstitialCampaign {
        const json = JSON.parse(DummyDisplayInterstitialCampaign);
        return new DisplayInterstitialCampaign(json.display.markup, json.gamerId, json.abGroup);
    }

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

    public static getMRAIDCampaign(): MRAIDCampaign {
        const json = JSON.parse(DummyMRAIDCampaign);
        return new MRAIDCampaign(json.mraid, json.gamerId, json.abGroup, json.mraid.inlinedURL, '<div>resource</div>', json.mraid.tracking);
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
            2000,
            '2.0.0-alpha2',
            true,
            'http://example.com/config.json',
            'http://example.com/index.html',
            null,
            '2.0.0-webview',
            123456,
            false
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

    public static getConfiguration(): Configuration {
        return new Configuration({
            enabled: true,
            country: 'US',
            coppaCompliant: false,
            placementLevelControl: false,
            assetCaching: 'disabled',
            placements: [],
            gamerId: 'abc123',
            abGroup: 0
        });
    }

    public static getCacheDiagnostics(): ICacheDiagnostics {
        return {
            creativeType: 'TEST',
            gamerId: '1234abcd',
            targetGameId: 5678,
            targetCampaignId: '123456abcdef'
        };
    }
}
