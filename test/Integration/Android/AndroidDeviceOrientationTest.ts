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
    creativeUrl: string;
}

interface IDeviceOrientationData {
    alpha: number;
    beta: number;
    gamma: number;
    absolute: boolean;
}

describe('AndroidDeviceOrientationTest', () => {
    const sandbox = sinon.createSandbox();
    const deviceOrientationTestCampaign = 'https://fake-ads-backend.unityads.unity3d.com/get_file/mraids/deviceorientation/deviceorientation_test.html';

    const orientationTestData: IDeviceOrientationData = {alpha: 12, beta: 42, gamma: -4, absolute: true};
    let orientationTestResponse: IDeviceOrientationData;

    let listener: TestListener;
    let iframeSrc: string;

    afterEach(() => {
        sandbox.restore();
    });

    // Reset Autoclose settings after tests
    after(() => {
        AbstractAdUnit.setAutoCloseDelay(0);
        AbstractAdUnit.setAutoClose(false);
    });

    const setupFakeMetadata = (targetSandbox: sinon.SinonSandbox, config: ITestMetadataConfig) => {
        targetSandbox.stub(TestEnvironment, 'get')
            .withArgs('forcedPlayableMRAID').returns(true)
            .withArgs('creativeUrl').returns(config.creativeUrl);
    };

    const initialize = async () => {
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

        ConfigManager.setTestBaseUrl('https://fake-ads-backend.unityads.unity3d.com');
        CampaignManager.setBaseUrl('https://fake-ads-backend.unityads.unity3d.com');
        ProgrammaticOperativeEventManager.setTestBaseUrl('https://fake-ads-backend.unityads.unity3d.com');

        UnityAds.initialize(Platform.ANDROID, '444', listener, true);
    };

    const showAdAndGatherInformation = () => {
        listener = new TestListener();
        iframeSrc = '';
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
                    // devOrientationResponseListener will fire after the creative receives a deviceorientation event
                    const devOrientationResponseListener = (event: any) => {
                    if (event.data.type === 'deviceorientation_received') {
                        if (event.data.data.alpha && event.data.data.beta && event.data.data.gamma) {
                            orientationTestResponse = {alpha: event.data.data.alpha, beta: event.data.data.beta, gamma: event.data.data.gamma, absolute: event.data.data.absolute};
                            window.removeEventListener('message', devOrientationResponseListener);
                            UnityAds.getBackend().Api.AdUnit.close();
                        }
                    }
                    };

                    iframeSrc = iframe.srcdoc;
                    window.addEventListener('message', devOrientationResponseListener);

                    setTimeout(() => {
                    window.dispatchEvent(new DeviceOrientationEvent('deviceorientation', orientationTestData));
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

    describe('Verifying deviceorientation event behaviour', () => {
        before(async function(this: Mocha.ITestCallbackContext) {
            this.timeout(35000);
            setupFakeMetadata(sandbox, {
                creativeUrl: deviceOrientationTestCampaign
            });
            await showAdAndGatherInformation();
        });

        it ('should have loaded the content correctly', () => {
            assert.isNotEmpty(iframeSrc);
        });

        it ('should receive the data sent', () => {
          assert.deepEqual(orientationTestData, orientationTestResponse, 'did not receive sent data');
        });
    });
});
