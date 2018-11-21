import 'mocha';
import * as sinon from 'sinon';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { MraidWebPlayerEventBridge } from 'MRAID/EventBridge/MraidWebPlayerEventBridge';
import { MRAIDEvents, IMRAIDHandler } from 'MRAID/EventBridge/AbstractMraidEventBridge';
import { Backend } from 'Backend/Backend';
import { ICoreApi } from 'Core/ICore';
import { Platform } from 'Core/Constants/Platform';
import { InterstitialWebPlayerContainer } from 'Ads/Utilities/WebPlayer/InterstitialWebPlayerContainer';
import { Observable1 } from 'Core/Utilities/Observable';
import { WebPlayerApi } from 'Ads/Native/WebPlayer';
import { IAdsApi } from 'Ads/IAds';
import { Sdk } from 'Backend/Api/Sdk';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('MraidWebPlayerEventBridge', () => {
        let handler: IMRAIDHandler;
        let mraidBridge: MraidWebPlayerEventBridge;
        let webPlayerAPI: WebPlayerApi;
        let nativeBridge: NativeBridge;
        let backend: Backend;
        let core: ICoreApi;
        let ads: IAdsApi;
        let container: InterstitialWebPlayerContainer;

        beforeEach(() => {
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            ads = TestFixtures.getAdsApi(nativeBridge);
            webPlayerAPI =  new WebPlayerApi(nativeBridge);
            (<any>webPlayerAPI).onWebPlayerEvent = new Observable1<string>();
            (<any>nativeBridge).Webplayer = webPlayerAPI;

            handler = {
                onBridgeSetOrientationProperties: sinon.spy(),
                onBridgeOpen: sinon.spy(),
                onBridgeLoad: sinon.spy(),
                onBridgeAnalyticsEvent: sinon.spy(),
                onBridgeClose: sinon.spy(),
                onBridgeStateChange: sinon.spy(),
                onBridgeResizeWebview: sinon.spy(),
                onBridgeSendStats: sinon.spy(),
                onBridgeAREvent: sinon.spy()
            };

            mraidBridge = new MraidWebPlayerEventBridge(core, handler);
            container = new InterstitialWebPlayerContainer(platform, ads);
            mraidBridge.connect(container);
        });

        afterEach(() => {
            mraidBridge.disconnect();
        });

        describe('receiving MRAID events', () => {
            const tests = [{
                event: MRAIDEvents.OPEN,
                data: ['unityads.unity3d.com'],
                verify: (data?: any) => sinon.assert.calledWith(<sinon.SinonSpy>handler.onBridgeOpen, JSON.parse(data)[0])
            },
            {
                event: MRAIDEvents.CLOSE,
                data: [],
                verify: (data?: any) => sinon.assert.called(<sinon.SinonSpy>handler.onBridgeClose)
            },
            {
                event: MRAIDEvents.ORIENTATION,
                data: [{
                        'allowOrientationChange': true,
                        'forceOrientation': 'portrait'
                    }],
                verify: (data?: any) => sinon.assert.calledWith(<sinon.SinonSpy>handler.onBridgeSetOrientationProperties, true, Orientation.PORTRAIT)
            },
            {
                event: MRAIDEvents.ORIENTATION,
                data: [{
                        'allowOrientationChange': true,
                        'forceOrientation': 'landscape'
                    }],
                verify: (data?: any) => sinon.assert.calledWith(<sinon.SinonSpy>handler.onBridgeSetOrientationProperties, true, Orientation.LANDSCAPE)
            },
            {
                event: MRAIDEvents.LOADED,
                data: [],
                verify: (data?: any) => sinon.assert.called(<sinon.SinonSpy>handler.onBridgeLoad)
            },
            {
                event: MRAIDEvents.ANALYTICS_EVENT,
                data: ['x', 'y'],
                verify: (data?: any) => sinon.assert.calledWith(<sinon.SinonSpy>handler.onBridgeAnalyticsEvent, JSON.parse(data)[0], JSON.parse(data)[1])
            },
            {
                event: MRAIDEvents.STATE_CHANGE,
                data: ['test'],
                verify: (data?: any) => sinon.assert.calledWith(<sinon.SinonSpy>handler.onBridgeStateChange, JSON.parse(data)[0])
            }
            ];

            for (const test of tests) {
                const eventType = `"${test.event}"`;
                const params = JSON.stringify(test.data);
                describe(`${eventType} MRAID event`, () => {
                    beforeEach(() => {
                        container.onWebPlayerEvent.trigger(`[
                            ${eventType},
                            ${params}
                        ]`);
                    });
                    it(`should handle the ${eventType} event`, () => {
                        test.verify(params);
                    });
                });
            }
        });
    });
});
