import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { CampaignManager } from 'Ads/Managers/CampaignManager';
import { ProgrammaticOperativeEventManager } from 'Ads/Managers/ProgrammaticOperativeEventManager';
import { Backend } from 'Backend/Backend';
import { IUnityAdsListener } from 'Backend/IUnityAdsListener';
import { UnityAds } from 'Backend/UnityAds';

import { Platform } from 'Core/Constants/Platform';
import { ConfigManager } from 'Core/Managers/ConfigManager';
import 'mocha';
import * as sinon from 'sinon';

import { Observable1, Observable2, Observable3 } from 'Core/Utilities/Observable';
import { assert } from 'chai';
import { TestEnvironment } from 'Core/Utilities/TestEnvironment';
import { ARUtil } from 'AR/Utilities/ARUtil';
import { PermissionsUtil } from 'Core/Utilities/Permissions';
import { AbstractAdUnitParametersFactory } from 'Ads/AdUnits/AdUnitParametersFactory';
import { MRAIDAdUnitParametersFactory } from 'MRAID/AdUnits/MRAIDAdUnitParametersFactory';
import { MRAIDView } from 'MRAID/Views/MRAIDView';
import { ITestCreativePack } from 'Ads/Models/CreativePack';
import { CampaignResponseUtils } from 'Ads/Utilities/CampaignResponseUtils';
import { RequestManager } from 'Core/Managers/RequestManager';
import { JsonParser } from 'Core/Utilities/JsonParser';
import CreativePackResponseAndroid from 'json/CreativePackResponseAndroid.json';
import CreativePackResponseIos from 'json/CreativePackResponseIos.json';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { AdsConfigurationParser } from 'Ads/Parsers/AdsConfigurationParser';

class TestListener implements IUnityAdsListener {

    public readonly onReady: Observable1<string> = new Observable1<string>();
    public readonly onStart: Observable1<string> = new Observable1<string>();
    public readonly onFinish: Observable2<string, string> = new Observable2<string, string>();
    public readonly onError: Observable2<string, string> = new Observable2<string, string>();
    public readonly onClick: Observable1<string> = new Observable1<string>();
    public readonly onPlacementStateChanged: Observable3<string, string, string> = new Observable3<string, string, string>();

    public onUnityAdsReady(placement: string) {
        this.onReady.trigger(placement);
    }

    public onUnityAdsStart(placement: string) {
        this.onStart.trigger(placement);
    }
    public onUnityAdsFinish(placement: string, state: string) {
        this.onFinish.trigger(placement, state);
    }

    public onUnityAdsError(error: string, message: string) {
        this.onError.trigger(error, message);
    }

    public onUnityAdsClick(placement: string) {
        this.onClick.trigger(placement);
    }

    public onUnityAdsPlacementStateChanged(placement: string, oldState: string, newState: string) {
        this.onPlacementStateChanged.trigger(placement, newState, oldState);
    }
}

interface ITestMetadataConfig {
    forcePlayable: boolean;
    forceAR: boolean;
    forceGDPRBanner: boolean;
    debugJSConsole: boolean;
    creativePack?: string;
}

describe('AndroidAUIEssentialsTest', () => {
    const sandbox = sinon.createSandbox();
    const playableTestUrl = 'https://fake-ads-backend.unityads.unity3d.com/get_file/mraids/game_of_war/android/index_android.html';
    const arTestUrl = 'https://fake-ads-backend.unityads.unity3d.com/get_file/ar/test_bridge_index.html';
    const testCreativePack = JSON.stringify({
        gameIcon: 'http://cdn.unityads.unity3d.com/impact/11017/test_game_icon.png',
        endScreenLandscape: 'http://cdn.unityads.unity3d.com/impact/11017/test_endscreen_landscape.png',
        endScreenPortrait: 'http://cdn.unityads.unity3d.com/impact/11017/test_endscreen_portrait.png',
        trailerDownloadable: 'http://cdn.unityads.unity3d.com/impact/11017/blue_test_trailer.mp4',
        trailerStreaming: 'http://cdn.unityads.unity3d.com/impact/11017/blue_test_trailer.mp4',
        appStoreId: '1463016906',
        appStoreName: 'Creative Testing'
    });

    let listener: TestListener;
    let iframeSrc: string;
    let containerSrc: string;

    afterEach(() => {
        sandbox.restore();
    });

    // Reset settings after tests
    after(() => {
        AbstractAdUnit.setAutoCloseDelay(0);
        AbstractAdUnit.setAutoClose(false);
        RequestManager.setTestAuctionProtocol(undefined);
    });

    const fakeARSupport = (targetSandbox: sinon.SinonSandbox) => {
        targetSandbox.stub(ARUtil, 'isARSupported').returns(Promise.resolve(true));
        targetSandbox.stub(PermissionsUtil, 'checkPermissionInManifest').returns(Promise.resolve(true));
        targetSandbox.stub(PermissionsUtil, 'checkPermissions').returns(Promise.resolve(true));
    };

    const setupFakeMetadata = (targetSandbox: sinon.SinonSandbox, config: ITestMetadataConfig) => {
        let creativeUrl;
        if (config.forceAR) {
            creativeUrl = arTestUrl;
        } else if (config.forcePlayable) {
            creativeUrl = playableTestUrl;
        } else {
            creativeUrl = '';
        }

        targetSandbox.stub(TestEnvironment, 'get')
            .withArgs('debugJsConsole').returns(config.debugJSConsole)
            .withArgs('forcedPlayableMRAID').returns(config.forcePlayable)
            .withArgs('forcedARMRAID').returns(config.forceAR)
            .withArgs('forcedGDPRBanner').returns(config.forceGDPRBanner)
            .withArgs('creativeUrl').returns(creativeUrl)
            .withArgs('serverUrl').returns('')
            .withArgs('auctionUrl').returns('')
            .withArgs('forceAuctionProtocol').returns('')
            .withArgs('forceAuthorization').returns('')
            .withArgs('abGroup').returns('')
            .withArgs('campaignId').returns('')
            .withArgs('country').returns('')
            .withArgs('creativePack').returns(config.creativePack);
    };

    const initialize = async () => {
        fakeARSupport(sandbox);
        // We must reset these parameters manually because the webview does not get completely reset between runs.
        // The way metadata is read during initialization prevents false value from updating it to the respective systems.
        AbstractAdUnitParametersFactory.setForcedGDPRBanner(false);
        MRAIDAdUnitParametersFactory.setForcedExtendedMRAID(false);
        MRAIDAdUnitParametersFactory.setForcedARMRAID(false);
        MRAIDView.setDebugJsConsole(false);

        UnityAds.setBackend(new Backend(Platform.ANDROID));
        UnityAds.getBackend().Api.Request.setPassthrough(true);

        UnityAds.getBackend().Api.DeviceInfo.setAdvertisingTrackingId('78db88cb-2026-4423-bfe0-07e9ed2701c3');
        UnityAds.getBackend().Api.DeviceInfo.setManufacturer('LGE');
        UnityAds.getBackend().Api.DeviceInfo.setModel('Nexus 5');
        UnityAds.getBackend().Api.DeviceInfo.setOsVersion('6.0.1');
        UnityAds.getBackend().Api.DeviceInfo.setScreenWidth(1080);
        UnityAds.getBackend().Api.DeviceInfo.setScreenHeight(1776);
        UnityAds.getBackend().Api.DeviceInfo.setTimeZone('GMT+02:00');

        AbstractAdUnit.setAutoCloseDelay(10000);
        AbstractAdUnit.setAutoClose(true);

        AdsConfigurationParser.setTestHasArPlacement(true);
        ConfigManager.setTestBaseUrl('https://fake-ads-backend.unityads.unity3d.com');
        CampaignManager.setBaseUrl('https://fake-ads-backend.unityads.unity3d.com');
        ProgrammaticOperativeEventManager.setTestBaseUrl('https://fake-ads-backend.unityads.unity3d.com');

        UnityAds.initialize(Platform.ANDROID, '444', listener, true);
    };

    const showAdAndGatherSources = () => {
        listener = new TestListener();
        iframeSrc = '';
        containerSrc = '';
        return new Promise((resolve) => {
            const readyListener = listener.onReady.subscribe((placement) => {
                listener.onReady.unsubscribe(readyListener);
                UnityAds.show(placement);
            });

            const startListener = listener.onStart.subscribe((placement) => {
                listener.onStart.unsubscribe(startListener);
                const iframe = <HTMLIFrameElement>document.querySelector('#mraid-iframe');
                // loadingComplete will fire after the iframe is ready for testing purposes
                const loadingComplete = () => {

                    setTimeout(() => {
                        iframeSrc = iframe.srcdoc;

                        const container = <HTMLDivElement>document.querySelector('#extended-mraid');
                        containerSrc = container.innerHTML;

                        UnityAds.getBackend().Api.AdUnit.close();
                    }, 250);
                };

                // contentDocument should be undefined until the iframe is ready
                if (!iframe.contentDocument) {
                    // In case no contentDocument present, wait until load event
                    iframe.addEventListener('load', loadingComplete, true);
                } else {
                    // In case contentDocument is present, the iframe should be ready for testing purposes.
                    loadingComplete();
                }
            });

            const finishListener = listener.onFinish.subscribe((placement) => {
                listener.onFinish.unsubscribe(finishListener);
                resolve();
            });

            initialize();
        });
    };

    const showAndResolve = async () => {
        listener = new TestListener();
        return new Promise((resolve) => {
            const readyListener = listener.onReady.subscribe((placement) => {
                listener.onReady.unsubscribe(readyListener);
                UnityAds.show(placement);
            });

            const startListener = listener.onStart.subscribe((placement) => {
                listener.onStart.unsubscribe(startListener);
                setTimeout(() => UnityAds.getBackend().Api.AdUnit.close(), 250);
            });

            const finishListener = listener.onFinish.subscribe((placement) => {
                listener.onFinish.unsubscribe(finishListener);
                resolve();
            });

            initialize();
        });
    };

    describe('Analysing playable container, AR Mode', () => {
        before(async function(this: Mocha.ITestCallbackContext) {
            this.timeout(35000);
            setupFakeMetadata(sandbox, {
                forcePlayable: false,
                forceAR: true,
                forceGDPRBanner: true,
                debugJSConsole: true
            });
            await showAdAndGatherSources(); // initialize().then(showAdAndGatherSources);
        });

        it ('should have loaded the content correctly', () => {
            assert.isNotEmpty(iframeSrc);
        });

        it ('should have enabled debugJsConsole', () => {
            const dom = new DOMParser().parseFromString(iframeSrc, 'text/html');

            const debugJsConsoleStub = dom.querySelector('#debug-js-console');
            assert.isNull(debugJsConsoleStub);

            const debugJsConsoleScript = dom.querySelector('#debug-js-console-script');
            assert.isNotNull(debugJsConsoleScript);
        });

        it ('should have enabled AR support', () => {
            const dom = new DOMParser().parseFromString(iframeSrc, 'text/html');

            const webArStub = dom.querySelector('#webar');
            assert.isNull(webArStub);

            const webArScript = dom.querySelector('#webar-script');
            assert.isNotNull(webArScript);
        });

        it('should have enabled GDPR banner', () => {
            const dom = new DOMParser().parseFromString(containerSrc, 'text/html');

            const gdprBanner = <HTMLElement>dom.querySelector('.gdpr-pop-up');
            assert.strictEqual(gdprBanner.style.visibility, 'visible');

            const privacyButton = <HTMLElement>dom.querySelector('.privacy-button');
            assert.strictEqual(privacyButton.style.visibility, 'hidden');
        });
    });

    describe('Analysing playable container, Playable Mode', () => {
        before(async function(this: Mocha.ITestCallbackContext) {
            this.timeout(35000);
            setupFakeMetadata(sandbox, {
                forcePlayable: true,
                forceAR: false,
                forceGDPRBanner: false,
                debugJSConsole: false
            });
            await showAdAndGatherSources();
        });

        it ('should have loaded the content correctly', () => {
            assert.isNotEmpty(iframeSrc);
        });

        it ('should not have enabled debugJsConsole', () => {
            const dom = new DOMParser().parseFromString(iframeSrc, 'text/html');

            const debugJsConsoleScript = dom.querySelector('#debug-js-console-script');
            assert.isNull(debugJsConsoleScript);

            const debugJsConsoleStub = dom.querySelector('#debug-js-console');
            assert.isNotNull(debugJsConsoleStub);
        });

        it ('should not have enabled AR support', () => {
            const dom = new DOMParser().parseFromString(iframeSrc, 'text/html');

            const webArStub = dom.querySelector('#webar');
            assert.isNotNull(webArStub);

            const webArScript = dom.querySelector('#webar-script');
            assert.isNull(webArScript);
        });

        it('should not have enabled GDPR banner', () => {
            const dom = new DOMParser().parseFromString(containerSrc, 'text/html');

            const gdprBanner = <HTMLElement>dom.querySelector('.gdpr-pop-up');
            assert.strictEqual(gdprBanner.style.visibility, 'hidden');

            const privacyButton = <HTMLElement>dom.querySelector('.privacy-button');
            assert.strictEqual(privacyButton.style.visibility, 'visible');
        });
    });

    describe('Forcing video creative pack', () => {
        let setCampaignResponseSpy: sinon.SinonSpy;

        before(async function(this: Mocha.ITestCallbackContext) {
            this.timeout(35000);
            setupFakeMetadata(sandbox, {
                forcePlayable: false,
                forceAR: false,
                forceGDPRBanner: false,
                debugJSConsole: false,
                creativePack: testCreativePack
            });
            setCampaignResponseSpy = sandbox.spy(CampaignManager, 'setCampaignResponse');
            await showAndResolve();
        });

        it('should have set correct campaign response', () => {
            const response = CampaignResponseUtils.getVideoCreativePackResponse(Platform.ANDROID, testCreativePack);
            assert.isTrue(setCampaignResponseSpy.calledWith(response));
        });
    });
});
