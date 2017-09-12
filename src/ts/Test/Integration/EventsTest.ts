import 'mocha';
import { assert } from 'chai';

import { Platform } from 'Constants/Platform';
import { UnityAds } from 'Native/Backend/UnityAds';
import { IUnityAdsListener } from 'Native/Backend/IUnityAdsListener';
import { UnityAdsError } from 'Constants/UnityAdsError';
import { FinishState } from 'Constants/FinishState';
import { DeviceInfo } from 'Native/Backend/Api/DeviceInfo';
import { Request } from 'Native/Backend/Api/Request';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { PlacementState } from 'Models/Placement';
import { ConfigManager } from 'Managers/ConfigManager';
import { SessionManager } from 'Managers/SessionManager';
import { CampaignManager } from 'Managers/CampaignManager';
import { Sdk } from 'Native/Backend/Api/Sdk';

describe('EventsTest', () => {

    const findEventCount = (requestLog: string[], regexp: string) => {
        let count = 0;
        requestLog.forEach(log => {
             if(log.match(regexp)) {
                 ++count;
             }
        });
        return count;
    };

    const validateRequestLog = (requestLog: string[]) => {
        assert.equal(findEventCount(requestLog, '/games/\\d+/configuration'), 1, 'Did not find a configuration request');
        // assert.equal(findEventCount(requestLog, '/games/\\d+/fill'), 2, 'Did not find 2 fill requests');
        assert.equal(findEventCount(requestLog, '/v\\d+/games/\\d+/requests'), 2, 'Did not find 2 fill requests');
        assert.equal(findEventCount(requestLog, '/mobile/gamers/[0-9a-f]+/video/video_start'), 1, 'Did not find a video_start event');
        assert.equal(findEventCount(requestLog, '/mobile/gamers/[0-9a-f]+/video/first_quartile'), 1, 'Did not find a first_quartile event');
        assert.equal(findEventCount(requestLog, '/mobile/gamers/[0-9a-f]+/video/midpoint'), 1, 'Did not find a midpoint event');
        assert.equal(findEventCount(requestLog, '/mobile/gamers/[0-9a-f]+/video/third_quartile'), 1, 'Did not find a third_quartile event');
        assert.equal(findEventCount(requestLog, '/mobile/gamers/[0-9a-f]+/video/video_end'), 1, 'Did not find a video_end event');
    };

    it('should include all operational events on Android', function(this: Mocha.ITestCallbackContext, done: MochaDone) {
        this.timeout(60000);
        let readyCount = 0;
        let startCount = 0;
        const listener: IUnityAdsListener = {
            onUnityAdsReady: (placement: string) => {
                if(++readyCount === 1) {
                    UnityAds.show(placement);
                }
            },
            onUnityAdsStart: (placement: string) => {
                ++startCount;
            },
            onUnityAdsFinish: (placement: string, state: FinishState) => {
                if(state === FinishState.COMPLETED) {
                    setTimeout(() => {
                        validateRequestLog(Request.getLog());
                        assert.equal(startCount, 1, 'onUnityAdsStart was not called exactly 1 time');
                        done();
                    }, 2500);
                }
            },
            onUnityAdsError: (error: UnityAdsError, message: string) => {
                done(new Error(message));
            },
            onUnityAdsClick: (placement: string) => {
                return;
            },
            onUnityAdsPlacementStateChanged: (placement: string, oldState: PlacementState, newState: PlacementState) => {
                return;
            }
        };

        Request.setLog([]);

        Sdk.setAppName('com.test.app.name');
        Sdk.setAppVersion('1.2.3-appversion');
        Sdk.setSdkVersion(2000);
        Sdk.setSdkVersionName('2.0.0-sdkversion');
        Sdk.setDebuggable(false);
        Sdk.setConfigUrl('https://test.config.url');
        Sdk.setWebViewUrl('https://test.webview.url');
        Sdk.setWebViewHash(null);
        Sdk.setWebViewVersion('2.0.0.-webviewversion');
        Sdk.setInitTimeStamp(12345);
        Sdk.setReinitialized(false);

        DeviceInfo.setAdvertisingTrackingId('78db88cb-2026-4423-bfe0-07e9ed2701c3');
        DeviceInfo.setLimitAdTrackingFlag(true);
        DeviceInfo.setAndroidId('de88c6a5d783745b');
        DeviceInfo.setManufacturer('LGE');
        DeviceInfo.setModel('Nexus 5');
        DeviceInfo.setOsVersion('6.0.1');
        DeviceInfo.setApiLevel(23);
        DeviceInfo.setRooted(false);
        DeviceInfo.setScreenWidth(1776);
        DeviceInfo.setScreenHeight(1080);
        DeviceInfo.setScreenDensity(480);
        DeviceInfo.setScreenLayout(268435794);
        DeviceInfo.setScreenBrightness(1);
        DeviceInfo.setSystemLanguage('en_US');
        DeviceInfo.setTimeZone('GMT+02:00');
        DeviceInfo.setTotalMemory(1899508);
        DeviceInfo.setFreeMemory(1000000);
        DeviceInfo.setTotalSpace(13162172);
        DeviceInfo.setFreeSpace(10159440);
        DeviceInfo.setConnectionType('wifi');
        DeviceInfo.setNetworkType(0);
        DeviceInfo.setNetworkOperator('24412');
        DeviceInfo.setNetworkOperatorName('DNA');
        DeviceInfo.setHeadset(false);
        DeviceInfo.setDeviceVolume(1);
        DeviceInfo.setBatteryLevel(1);
        DeviceInfo.setBatteryStatus(1);
        DeviceInfo.setRingerMode(0);

        AbstractAdUnit.setAutoClose(true);

        ConfigManager.setTestBaseUrl('https://fake-ads-backend.applifier.info');
        CampaignManager.setBaseUrl('https://fake-ads-backend.applifier.info');
        SessionManager.setTestBaseUrl('https://fake-ads-backend.applifier.info');

        UnityAds.initialize(Platform.ANDROID, '456', listener, true);
    });

    it('should include all operational events on iOS', function(this: Mocha.ITestCallbackContext, done: MochaDone) {
        this.timeout(60000);
        let readyCount = 0;
        let startCount = 0;
        const listener: IUnityAdsListener = {
            onUnityAdsReady: (placement: string) => {
                if(++readyCount === 1) {
                    UnityAds.show(placement);
                }
            },
            onUnityAdsStart: (placement: string) => {
                ++startCount;
            },
            onUnityAdsFinish: (placement: string, state: FinishState) => {
                if(state === FinishState.COMPLETED) {
                    setTimeout(() => {
                        validateRequestLog(Request.getLog());
                        assert.equal(startCount, 1, 'onUnityAdsStart was not called exactly 1 time');
                        done();
                    }, 2500);
                }
            },
            onUnityAdsError: (error: UnityAdsError, message: string) => {
                done(new Error(message));
            },
            onUnityAdsClick: (placement: string) => {
                return;
            },
            onUnityAdsPlacementStateChanged: (placement: string, oldState: PlacementState, newState: PlacementState) => {
                return;
            }
        };

        Request.setLog([]);

        Sdk.setAppName('com.test.app.name');
        Sdk.setAppVersion('1.2.3-appversion');
        Sdk.setSdkVersion(2000);
        Sdk.setSdkVersionName('2.0.0-sdkversion');
        Sdk.setDebuggable(false);
        Sdk.setConfigUrl('https://test.config.url');
        Sdk.setWebViewUrl('https://test.webview.url');
        Sdk.setWebViewHash(null);
        Sdk.setWebViewVersion('2.0.0.-webviewversion');
        Sdk.setInitTimeStamp(12345);
        Sdk.setReinitialized(false);

        DeviceInfo.setAdvertisingTrackingId('DA276DED-8DFE-4C57-A75E-9D7F7BBF2D21');
        DeviceInfo.setLimitAdTrackingFlag(true);
        DeviceInfo.setManufacturer('Apple');
        DeviceInfo.setModel('iPhone7,2');
        DeviceInfo.setOsVersion('10.1.1');
        DeviceInfo.setRooted(false);
        DeviceInfo.setScreenWidth(647);
        DeviceInfo.setScreenHeight(357);
        DeviceInfo.setScreenScale(2);
        DeviceInfo.setScreenBrightness(1);
        DeviceInfo.setSystemLanguage('en_US');
        DeviceInfo.setTimeZone('+0200');
        DeviceInfo.setTotalMemory(1899508);
        DeviceInfo.setFreeMemory(1000000);
        DeviceInfo.setTotalSpace(13162172);
        DeviceInfo.setFreeSpace(10159440);
        DeviceInfo.setConnectionType('wifi');
        DeviceInfo.setNetworkType(0);
        DeviceInfo.setNetworkOperator('24412');
        DeviceInfo.setNetworkOperatorName('DNA');
        DeviceInfo.setHeadset(false);
        DeviceInfo.setDeviceVolume(1);
        DeviceInfo.setBatteryLevel(1);
        DeviceInfo.setBatteryStatus(1);
        DeviceInfo.setUserInterfaceIdiom(0);
        DeviceInfo.setSimulator(false);
        DeviceInfo.setStatusBarHeight(0);

        AbstractAdUnit.setAutoClose(true);

        ConfigManager.setTestBaseUrl('https://fake-ads-backend.applifier.info');
        CampaignManager.setBaseUrl('https://fake-ads-backend.applifier.info');
        SessionManager.setTestBaseUrl('https://fake-ads-backend.applifier.info');

        UnityAds.initialize(Platform.IOS, '456', listener, true);
    });

});
