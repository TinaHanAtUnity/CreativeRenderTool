import { Placement } from '../../src/ts/Models/Placement';
import { ClientInfo } from '../../src/ts/Models/ClientInfo';
import { INativeResponse } from '../../src/ts/Utilities/Request';
import { Platform } from '../../src/ts/Constants/Platform';
import { VastParser } from '../../src/ts/Utilities/VastParser';
import { NativeBridge } from '../../src/ts/Native/NativeBridge';
import * as xmldom from 'xmldom';

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

    public static getClientInfo(): ClientInfo {
        return new ClientInfo(Platform.ANDROID, [
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
        let domParser = new xmldom.DOMParser({errorHandler: {}});
        vastParser = new VastParser(domParser);
        return vastParser;
    }

    public static getNativeBridge(): NativeBridge {
        let backend = {
            handleInvocation: function() {
                // no-op
            },
            handleCallback: function() {
                // no-op
            }
        };
        return new NativeBridge(backend);
    }
}
