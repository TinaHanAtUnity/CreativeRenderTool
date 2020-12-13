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
import { MRAIDAdUnitParametersFactory } from 'MRAID/AdUnits/MRAIDAdUnitParametersFactory';
import { MRAIDView } from 'MRAID/Views/MRAIDView';
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
describe('AndroidDeviceOrientationTest', () => {
    const sandbox = sinon.createSandbox();
    const deviceOrientationTestCampaign = 'https://fake-ads-backend.unityads.unity3d.com/get_file/mraids/deviceorientation/deviceorientation_test.html';
    const orientationTestData = { alpha: 12, beta: 42, gamma: -4, absolute: true };
    let orientationTestResponse;
    let listener;
    let iframeSrc;
    afterEach(() => {
        sandbox.restore();
    });
    // Reset Autoclose settings after tests
    after(() => {
        AbstractAdUnit.setAutoCloseDelay(0);
        AbstractAdUnit.setAutoClose(false);
    });
    const setupFakeMetadata = (targetSandbox, config) => {
        targetSandbox.stub(TestEnvironment, 'get')
            .withArgs('forcedPlayableMRAID').returns(true)
            .withArgs('creativeUrl').returns(config.creativeUrl);
    };
    const initialize = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
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
        ConfigManager.setTestBaseUrl('https://fake-ads-backend.unityads.unity3d.com');
        CampaignManager.setBaseUrl('https://fake-ads-backend.unityads.unity3d.com');
        ProgrammaticOperativeEventManager.setTestBaseUrl('https://fake-ads-backend.unityads.unity3d.com');
        UnityAds.initialize(Platform.ANDROID, '444', listener, true);
    });
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
                const iframe = document.querySelector('#mraid-iframe');
                // loadingComplete will fire after the iframe is ready for testing purposes
                const loadingComplete = () => {
                    // devOrientationResponseListener will fire after the creative receives a deviceorientation event
                    const devOrientationResponseListener = (event) => {
                        if (event.data.type === 'deviceorientation_received') {
                            if (event.data.data.alpha && event.data.data.beta && event.data.data.gamma) {
                                orientationTestResponse = { alpha: event.data.data.alpha, beta: event.data.data.beta, gamma: event.data.data.gamma, absolute: event.data.data.absolute };
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
    describe('Verifying deviceorientation event behaviour', () => {
        before(function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(35000);
                setupFakeMetadata(sandbox, {
                    creativeUrl: deviceOrientationTestCampaign
                });
                yield showAdAndGatherInformation();
            });
        });
        it('should have loaded the content correctly', () => {
            assert.isNotEmpty(iframeSrc);
        });
        it('should receive the data sent', () => {
            assert.deepEqual(orientationTestData, orientationTestResponse, 'did not receive sent data');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQW5kcm9pZERldmljZU9yaWVudGF0aW9uVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Rlc3QvSW50ZWdyYXRpb24vQW5kcm9pZC9BbmRyb2lkRGV2aWNlT3JpZW50YXRpb25UZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDNUQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQy9ELE9BQU8sRUFBRSxpQ0FBaUMsRUFBRSxNQUFNLGdEQUFnRCxDQUFDO0FBQ25HLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUUxQyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFFNUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ25ELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUM1RCxPQUFPLE9BQU8sQ0FBQztBQUNmLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFDO0FBRS9CLE9BQU8sRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ2xGLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDOUIsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBRWpFLE9BQU8sRUFBRSw0QkFBNEIsRUFBRSxNQUFNLDRDQUE0QyxDQUFDO0FBQzFGLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUVsRCxNQUFNLFlBQVk7SUFBbEI7UUFFb0IsWUFBTyxHQUF3QixJQUFJLFdBQVcsRUFBVSxDQUFDO1FBQ3pELFlBQU8sR0FBd0IsSUFBSSxXQUFXLEVBQVUsQ0FBQztRQUN6RCxhQUFRLEdBQWdDLElBQUksV0FBVyxFQUFrQixD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