import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { CampaignManager } from 'Ads/Managers/CampaignManager';
import { ProgrammaticOperativeEventManager } from 'Ads/Managers/ProgrammaticOperativeEventManager';
import { Backend } from 'Backend/Backend';
import { IUnityAdsListener } from 'Backend/IUnityAdsListener';
import { UnityAds } from 'Backend/UnityAds';

import { Platform } from 'Core/Constants/Platform';
import { ConfigManager } from 'Core/Managers/ConfigManager';
import 'mocha';
// import { fakeARUtils } from 'TestHelpers/FakeARUtils2';
import * as sinon from 'sinon';

import { Observable1, Observable2, Observable3 } from 'Core/Utilities/Observable';
import { assert } from 'chai';
import { TestEnvironment } from 'Core/Utilities/TestEnvironment';
import { ARUtil } from 'AR/Utilities/ARUtil';
import { PermissionsUtil } from 'Core/Utilities/Permissions';
import { AbstractAdUnitParametersFactory } from 'Ads/AdUnits/AdUnitParametersFactory';
import { MRAIDAdUnitParametersFactory } from 'MRAID/AdUnits/MRAIDAdUnitParametersFactory';
import { MRAIDView } from 'MRAID/Views/MRAIDView';

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
    forceAR: boolean;
    forceGDPRBanner: boolean;
    debugJSConsole: boolean;
}

describe('AndroidAUIEssentialsTest', () => {
    const sandbox = sinon.createSandbox();
    const playableTestUrl = 'https://fake-ads-backend.unityads.unity3d.com/get_file/mraids/game_of_war/android/index_android.html';
    const arTestUrl = 'https://fake-ads-backend.unityads.unity3d.com/get_file/ar/test_bridge_index.html';

    let listener: TestListener;
    let iframeSrc: string;
    let containerSrc: string;

    afterEach(() => {
        sandbox.restore();
    });

    const fakeARSupport = (targetSandbox: sinon.SinonSandbox) => {
        targetSandbox.stub(ARUtil, 'isARSupported').callsFake(() => {
            return Promise.resolve<boolean>(true);
         });
        targetSandbox.stub(PermissionsUtil, 'checkPermissionInManifest').callsFake(() => {
            return Promise.resolve<boolean>(true);
         });
        targetSandbox.stub(PermissionsUtil, 'checkPermissions').callsFake(() => {
            return Promise.resolve<boolean>(true);
        });
    };

    const setupFakeMetadata = (targetSandbox: sinon.SinonSandbox, config: ITestMetadataConfig) => {
        targetSandbox.stub(TestEnvironment, 'get')
            .withArgs('debugJsConsole').returns(config.debugJSConsole)
            .withArgs('forcedPlayableMRAID').returns(!config.forceAR)
            .withArgs('forcedARMRAID').returns(config.forceAR)
            .withArgs('forcedGDPRBanner').returns(config.forceGDPRBanner)
            .withArgs('creativeUrl').returns(config.forceAR ? arTestUrl : playableTestUrl)
            .withArgs('serverUrl').returns('')
            .withArgs('auctionUrl').returns('')
            .withArgs('forceAuctionProtocol').returns('')
            .withArgs('forceAuthorization').returns('')
            .withArgs('abGroup').returns('')
            .withArgs('campaignId').returns('')
            .withArgs('country').returns('');
    };

    const initialize = async () => {
        return new Promise((resolve) => {
            fakeARSupport(sandbox);
            listener = new TestListener();
            const readyObserver = listener.onReady.subscribe((placement) => {
                listener.onReady.unsubscribe(readyObserver);
                resolve();
            });

            // We must reset these parameters manually because the webview does not get completely reset between runs.
            // The way metadata is read during initialization prevents false value from updating it to the respective systems.
            AbstractAdUnitParametersFactory.setForcedGDPRBanner(false);
            AbstractAdUnitParametersFactory.setForcedConsentUnit(false);
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

            AbstractAdUnit.setAutoCloseDelay(1000);
            AbstractAdUnit.setAutoClose(true);

            ConfigManager.setTestBaseUrl('https://fake-ads-backend.unityads.unity3d.com');
            CampaignManager.setBaseUrl('https://fake-ads-backend.unityads.unity3d.com');
            ProgrammaticOperativeEventManager.setTestBaseUrl('https://fake-ads-backend.unityads.unity3d.com');

            UnityAds.initialize(Platform.ANDROID, '444', listener, true);
            });
    };

    const showAdWhenReady = (placement: string) => {
        if(UnityAds.isReady(placement)) {
            UnityAds.show(placement);
        } else {
            window.setTimeout(showAdWhenReady, 20, placement);
        }
    };

    const waitUntilLoaded = (sel: string) => {
        return new Promise((resolve) => {
            const checkEl = () => {
                const el = <HTMLIFrameElement>document.querySelector(sel);
                if (el && el.srcdoc) {
                    resolve();
                } else {
                    window.setTimeout(checkEl, 20);
                }
            };
            checkEl();
        });
    };

    const showAdAndGatherSources = () => {
        iframeSrc = '';
        containerSrc = '';
        return new Promise((resolve) => {
            const finishListener = listener.onFinish.subscribe((placement) => {
                listener.onFinish.unsubscribe(finishListener);
                resolve();
            });

            const startListener = listener.onStart.subscribe((placement) => {
                listener.onStart.unsubscribe(startListener);
                waitUntilLoaded('#mraid-iframe').then(() => {
                    const iframe = <HTMLIFrameElement>document.querySelector('#mraid-iframe');
                    iframeSrc = iframe.srcdoc;

                    const container = <HTMLDivElement>document.querySelector('#extended-mraid');
                    containerSrc = container.innerHTML;
                });
            });
            showAdWhenReady('defaultVideoAndPictureZone');
        });
    };

    describe('Analysing playable container, AR Mode', () => {
        before(async function(this: Mocha.ITestCallbackContext) {
            this.timeout(35000);
            setupFakeMetadata(sandbox, {
                forceAR: true,
                forceGDPRBanner: true,
                debugJSConsole: true
            });
            await initialize().then(showAdAndGatherSources);
        });

        it ('should have loaded the content correctly', () => {
            assert.isNotNull(iframeSrc);
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
                forceAR: false,
                forceGDPRBanner: false,
                debugJSConsole: false
            });
            await initialize().then(showAdAndGatherSources);
        });

        it ('should have loaded the content correctly', () => {
            assert.isNotNull(iframeSrc);
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
});
