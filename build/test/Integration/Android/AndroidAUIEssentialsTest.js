import * as tslib_1 from "tslib";
import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { CampaignManager } from 'Ads/Managers/CampaignManager';
import { ProgrammaticOperativeEventManager } from 'Ads/Managers/ProgrammaticOperativeEventManager';
import { Backend } from 'Backend/Backend';
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
import { MRAIDAdUnitParametersFactory } from 'MRAID/AdUnits/MRAIDAdUnitParametersFactory';
import { MRAIDView } from 'MRAID/Views/MRAIDView';
import { CampaignResponseUtils } from 'Ads/Utilities/CampaignResponseUtils';
import { RequestManager } from 'Core/Managers/RequestManager';
import { AdsConfigurationParser } from 'Ads/Parsers/AdsConfigurationParser';
import { PrivacyTestEnvironment } from 'Privacy/PrivacyTestEnvironment';
class TestListener {
    constructor() {
        this.onReady = new Observable1();
        this.onStart = new Observable1();
        this.onFinish = new Observable2();
        this.onError = new Observable2();
        this.onClick = new Observable1();
        this.onPlacementStateChanged = new Observable3();
    }
    onUnityAdsReady(placement) {
        this.onReady.trigger(placement);
    }
    onUnityAdsStart(placement) {
        this.onStart.trigger(placement);
    }
    onUnityAdsFinish(placement, state) {
        this.onFinish.trigger(placement, state);
    }
    onUnityAdsError(error, message) {
        this.onError.trigger(error, message);
    }
    onUnityAdsClick(placement) {
        this.onClick.trigger(placement);
    }
    onUnityAdsPlacementStateChanged(placement, oldState, newState) {
        this.onPlacementStateChanged.trigger(placement, newState, oldState);
    }
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
    let listener;
    let iframeSrc;
    let containerSrc;
    afterEach(() => {
        sandbox.restore();
    });
    // Reset settings after tests
    after(() => {
        AbstractAdUnit.setAutoCloseDelay(0);
        AbstractAdUnit.setAutoClose(false);
        RequestManager.setTestAuctionProtocol(undefined);
    });
    const fakeARSupport = (targetSandbox) => {
        targetSandbox.stub(ARUtil, 'isARSupported').returns(Promise.resolve(true));
        targetSandbox.stub(PermissionsUtil, 'checkPermissionInManifest').returns(Promise.resolve(true));
        targetSandbox.stub(PermissionsUtil, 'checkPermissions').returns(Promise.resolve(true));
    };
    const setupFakeMetadata = (targetSandbox, config) => {
        let creativeUrl;
        if (config.forceAR) {
            creativeUrl = arTestUrl;
        }
        else if (config.forcePlayable) {
            creativeUrl = playableTestUrl;
        }
        else {
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
        targetSandbox.stub(PrivacyTestEnvironment, 'get')
            .withArgs('showGDPRBanner').returns(config.forceGDPRBanner);
        targetSandbox.stub(PrivacyTestEnvironment, 'isSet')
            .withArgs('showGDPRBanner').returns(config.forceGDPRBannerSet);
    };
    const initialize = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
        fakeARSupport(sandbox);
        // We must reset these parameters manually because the webview does not get completely reset between runs.
        // The way metadata is read during initialization prevents false value from updating it to the respective systems.
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
    });
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
                const iframe = document.querySelector('#mraid-iframe');
                // loadingComplete will fire after the iframe is ready for testing purposes
                const loadingComplete = () => {
                    setTimeout(() => {
                        iframeSrc = iframe.srcdoc;
                        const container = document.querySelector('#extended-mraid');
                        containerSrc = container.innerHTML;
                        UnityAds.getBackend().Api.AdUnit.close();
                    }, 250);
                };
                // contentDocument should be undefined until the iframe is ready
                if (!iframe.contentDocument) {
                    // In case no contentDocument present, wait until load event
                    iframe.addEventListener('load', loadingComplete, true);
                }
                else {
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
    const showAndResolve = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
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
    });
    describe('Analysing playable container, AR Mode', () => {
        before(function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(35000);
                setupFakeMetadata(sandbox, {
                    forcePlayable: false,
                    forceAR: true,
                    forceGDPRBanner: true,
                    forceGDPRBannerSet: true,
                    debugJSConsole: true
                });
                yield showAdAndGatherSources(); // initialize().then(showAdAndGatherSources);
            });
        });
        it('should have loaded the content correctly', () => {
            assert.isNotEmpty(iframeSrc);
        });
        it('should have enabled debugJsConsole', () => {
            const dom = new DOMParser().parseFromString(iframeSrc, 'text/html');
            const debugJsConsoleStub = dom.querySelector('#debug-js-console');
            assert.isNull(debugJsConsoleStub);
            const debugJsConsoleScript = dom.querySelector('#debug-js-console-script');
            assert.isNotNull(debugJsConsoleScript);
        });
        it('should have enabled AR support', () => {
            const dom = new DOMParser().parseFromString(iframeSrc, 'text/html');
            const webArStub = dom.querySelector('#webar');
            assert.isNull(webArStub);
            const webArScript = dom.querySelector('#webar-script');
            assert.isNotNull(webArScript);
        });
        it('should have enabled GDPR banner', () => {
            const dom = new DOMParser().parseFromString(containerSrc, 'text/html');
            const gdprBanner = dom.querySelector('.gdpr-pop-up');
            assert.strictEqual(gdprBanner.style.visibility, 'visible');
            const privacyButton = dom.querySelector('.privacy-button');
            assert.strictEqual(privacyButton.style.visibility, 'hidden');
        });
    });
    describe('Analysing playable container, Playable Mode', () => {
        before(function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(35000);
                setupFakeMetadata(sandbox, {
                    forcePlayable: true,
                    forceAR: false,
                    forceGDPRBanner: false,
                    forceGDPRBannerSet: true,
                    debugJSConsole: false
                });
                yield showAdAndGatherSources();
            });
        });
        it('should have loaded the content correctly', () => {
            assert.isNotEmpty(iframeSrc);
        });
        it('should not have enabled debugJsConsole', () => {
            const dom = new DOMParser().parseFromString(iframeSrc, 'text/html');
            const debugJsConsoleScript = dom.querySelector('#debug-js-console-script');
            assert.isNull(debugJsConsoleScript);
            const debugJsConsoleStub = dom.querySelector('#debug-js-console');
            assert.isNotNull(debugJsConsoleStub);
        });
        it('should not have enabled AR support', () => {
            const dom = new DOMParser().parseFromString(iframeSrc, 'text/html');
            const webArStub = dom.querySelector('#webar');
            assert.isNotNull(webArStub);
            const webArScript = dom.querySelector('#webar-script');
            assert.isNull(webArScript);
        });
        it('should not have enabled GDPR banner', () => {
            const dom = new DOMParser().parseFromString(containerSrc, 'text/html');
            const gdprBanner = dom.querySelector('.gdpr-pop-up');
            assert.strictEqual(gdprBanner.style.visibility, 'hidden');
            const privacyButton = dom.querySelector('.privacy-button');
            assert.strictEqual(privacyButton.style.visibility, 'visible');
        });
    });
    describe('Forcing video creative pack', () => {
        let setCampaignResponseSpy;
        before(function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(35000);
                setupFakeMetadata(sandbox, {
                    forcePlayable: false,
                    forceAR: false,
                    forceGDPRBanner: false,
                    forceGDPRBannerSet: true,
                    debugJSConsole: false,
                    creativePack: testCreativePack
                });
                setCampaignResponseSpy = sandbox.spy(CampaignManager, 'setCampaignResponse');
                yield showAndResolve();
            });
        });
        it('should have set correct campaign response', () => {
            const response = CampaignResponseUtils.getVideoCreativePackResponse(Platform.ANDROID, testCreativePack);
            assert.isTrue(setCampaignResponseSpy.calledWith(response));
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQW5kcm9pZEFVSUVzc2VudGlhbHNUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vdGVzdC9JbnRlZ3JhdGlvbi9BbmRyb2lkL0FuZHJvaWRBVUlFc3NlbnRpYWxzVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQzVELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUMvRCxPQUFPLEVBQUUsaUNBQWlDLEVBQUUsTUFBTSxnREFBZ0QsQ0FBQztBQUNuRyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFMUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBRTVDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUNuRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDNUQsT0FBTyxPQUFPLENBQUM7QUFDZixPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUUvQixPQUFPLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUNsRixPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzlCLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUNqRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDN0MsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBRTdELE9BQU8sRUFBRSw0QkFBNEIsRUFBRSxNQUFNLDRDQUE0QyxDQUFDO0FBQzFGLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUVsRCxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUM1RSxP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