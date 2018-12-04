import { CampaignManager } from 'Ads/Managers/CampaignManager';
import { ProgrammaticOperativeEventManager } from 'Ads/Managers/ProgrammaticOperativeEventManager';
import { Backend } from 'Backend/Backend';
import { IUnityAdsListener } from 'Backend/IUnityAdsListener';
import { UnityAds } from 'Backend/UnityAds';

import { Platform } from 'Core/Constants/Platform';
import { ConfigManager } from 'Core/Managers/ConfigManager';
import 'mocha';
import { assert } from 'chai';
import { Observable1, Observable2, Observable3 } from 'Core/Utilities/Observable';
import { FinishState } from 'Core/Constants/FinishState';
import { VideoAdUnit } from 'Ads/AdUnits/VideoAdUnit';

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

describe('AndroidVastTest', () => {

    let listener: TestListener;
    let readyPlacement: string;

    before(() => {
        return new Promise((resolve) => {
            listener = new TestListener();
            const readyObserver = listener.onReady.subscribe((placement) => {
                readyPlacement = placement;
                listener.onReady.unsubscribe(readyObserver);
                resolve();
            });

            UnityAds.setBackend(new Backend(Platform.ANDROID));
            UnityAds.getBackend().Api.Request.setLog([]);
            UnityAds.getBackend().Api.Request.setPassthrough(true);

            UnityAds.getBackend().Api.DeviceInfo.setAdvertisingTrackingId('78db88cb-2026-4423-bfe0-07e9ed2701c3');
            UnityAds.getBackend().Api.DeviceInfo.setManufacturer('LGE');
            UnityAds.getBackend().Api.DeviceInfo.setModel('Nexus 5');
            UnityAds.getBackend().Api.DeviceInfo.setOsVersion('6.0.1');
            UnityAds.getBackend().Api.DeviceInfo.setScreenWidth(1080);
            UnityAds.getBackend().Api.DeviceInfo.setScreenHeight(1776);
            UnityAds.getBackend().Api.DeviceInfo.setTimeZone('GMT+02:00');

            ConfigManager.setTestBaseUrl('https://fake-ads-backend.unityads.unity3d.com');
            CampaignManager.setBaseUrl('https://fake-ads-backend.unityads.unity3d.com');
            ProgrammaticOperativeEventManager.setTestBaseUrl('https://fake-ads-backend.unityads.unity3d.com');

            UnityAds.initialize(Platform.ANDROID, '333', listener, true);
        });
    });

    it('should handle the happy path for initialization on Android', () => {
        assert.isNotFalse(readyPlacement);
    });

    it('should not send click event more than once', function(this: Mocha.ITestCallbackContext) {
        this.timeout(35000);

        const adFinished = new Promise((resolve) => {
            const finishListener = listener.onFinish.subscribe((placement, state) => {
                listener.onFinish.unsubscribe(finishListener);
                resolve(state);
            });
        });

        return new Promise((resolve, reject) => {
            adFinished.then((state) => {
                try {
                    assert.equal(state, FinishState[FinishState.COMPLETED]);

                    const log = UnityAds.getBackend().Api.Request.getLog('GET');
                    const clicks = log.filter((s) => s.indexOf('event=tracking_click_through') > -1);
                    assert.equal(clicks.length, 1);

                    resolve();
                } catch (e) {
                    reject(e);
                }
            });

            VideoAdUnit.clickCTAForTesting = true;
            if (UnityAds.isReady('video')) {
                UnityAds.show('video');
            }
        })
        .then(() => VideoAdUnit.clickCTAForTesting = false)
        .catch((e) => {
            VideoAdUnit.clickCTAForTesting = false;
            throw e;
        });
    });
});
