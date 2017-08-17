import { Placement } from 'Models/Placement';
import { ClientInfo } from 'Models/ClientInfo';
import { INativeResponse } from 'Utilities/Request';
import { Platform } from 'Constants/Platform';
import { VastParser } from 'Utilities/VastParser';
import { NativeBridge } from 'Native/NativeBridge';
import { FakeDeviceInfo } from './FakeDeviceInfo';
import { DeviceInfo } from 'Models/DeviceInfo';
import { PerformanceCampaign } from 'Models/PerformanceCampaign';
import { MRAIDCampaign } from 'Models/MRAIDCampaign';
import { Configuration } from 'Models/Configuration';
import { ICacheDiagnostics } from 'Utilities/Cache';

import OnCometMraidPlcCampaignFollowsRedirects from 'json/OnCometMraidPlcCampaignFollowsRedirects.json';
import OnCometMraidPlcCampaign from 'json/OnCometMraidPlcCampaign.json';
import OnCometVideoPlcCampaign from 'json/OnCometVideoPlcCampaign.json';
import OnProgrammaticMraidUrlPlcCampaign from 'json/OnProgrammaticMraidUrlPlcCampaign.json';

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
        const json = JSON.parse(OnCometVideoPlcCampaign);
        const performanceJson = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);
        return new PerformanceCampaign(performanceJson, this.getConfiguration().getGamerId(), this.getConfiguration().getAbGroup());
    }

    public static getPlayableMRAIDCampaignFollowsRedirects(): MRAIDCampaign {
        const json = JSON.parse(OnCometMraidPlcCampaignFollowsRedirects);
        const playableMraidJson = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);
        return new MRAIDCampaign(playableMraidJson, this.getConfiguration().getGamerId(), this.getConfiguration().getAbGroup(), playableMraidJson.mraidUrl);
    }

    public static getPlayableMRAIDCampaign(): MRAIDCampaign {
        const json = JSON.parse(OnCometMraidPlcCampaign);
        const playableMraidJson = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);
        return new MRAIDCampaign(playableMraidJson, this.getConfiguration().getGamerId(), this.getConfiguration().getAbGroup(), playableMraidJson.mraidUrl);
    }

    public static getProgrammaticMRAIDCampaign(): MRAIDCampaign {
        const json = JSON.parse(OnProgrammaticMraidUrlPlcCampaign);
        const mraidJson = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);
        mraidJson.id = 'testId';
        return new MRAIDCampaign(mraidJson, this.getConfiguration().getGamerId(), this.getConfiguration().getAbGroup(), mraidJson.inlinedUrl, '<div>resource</div>', json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].trackingUrls);
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
            abGroup: 0,
            useAuction: true,
            properties: 'abc123'
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
