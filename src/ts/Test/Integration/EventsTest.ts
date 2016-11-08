import 'mocha';
import { assert } from 'chai';

import { Platform } from 'Constants/Platform';
import { UnityAds } from 'Native/Backend/UnityAds';
import { IUnityAdsListener } from 'Native/Backend/IUnityAdsListener';
import { UnityAdsError } from 'Constants/UnityAdsError';
import { FinishState } from 'Constants/FinishState';
import { DeviceInfo } from 'Native/Backend/Api/DeviceInfo';
import { EndScreen } from 'Views/EndScreen';
import { Request } from 'Native/Backend/Api/Request';

describe('EventsTest', () => {

    const validateRequestLog = (requestLog: string[]) => {
        assert.equal(requestLog.length, 9, 'Request log length should be 9 for showing one ad');
        assert(requestLog[0].match('configuration'), '1st request was not a configuration request');
        assert(requestLog[1].match('fill'), '2nd request was not a fill request');
        assert(requestLog[2].match('show'), '3rd request was not a show event');
        assert(requestLog[3].match('video_start'), '4th request was not a video_start event');
        assert(requestLog[4].match('first_quartile'), '5th request was not a first_quartile event');
        assert(requestLog[5].match('midpoint'), '6th request was not a midpoint event');
        assert(requestLog[6].match('third_quartile'), '7th request was not a third_quartile event');
        assert(requestLog[7].match('fill'), '8th request was not a fill request');
        assert(requestLog[8].match('video_end'), '9th request was not a video_end event');
    };

    it('should include all operational events on Android', function(this: Mocha.ITestDefinition, done: MochaDone) {
        this.timeout(60000);
        let readyCount = 0;
        const listener: IUnityAdsListener = {
            onUnityAdsReady: (placement: string) => {
                if(++readyCount === 2) {
                    UnityAds.show(placement);
                }
            },
            onUnityAdsStart: (placement: string) => {
                return;
            },
            onUnityAdsFinish: (placement: string, state: FinishState) => {
                if(state === FinishState.COMPLETED) {
                    setTimeout(() => {
                        validateRequestLog(Request.getLog());
                        done();
                    }, 2500);
                }
                return;
            },
            onUnityAdsError: (error: UnityAdsError, message: string) => {
                return;
            }
        };

        Request.setLog([]);

        DeviceInfo.setAdvertisingTrackingId('78db88cb-2026-4423-bfe0-07e9ed2701c3');
        DeviceInfo.setLimitAdTrackingFlag(true);
        DeviceInfo.setAndroidId('de88c6a5d783745b');
        DeviceInfo.setManufacturer('LGE');
        DeviceInfo.setModel('Nexus 5');
        DeviceInfo.setOsVersion('6.0.1');
        DeviceInfo.setApiLevel(23);
        DeviceInfo.setRooted(false);
        DeviceInfo.setScreenWidth(1080);
        DeviceInfo.setScreenHeight(1776);
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
        DeviceInfo.setNetworkOperator(24412);
        DeviceInfo.setNetworkOperatorName('DNA');
        DeviceInfo.setHeadset(false);
        DeviceInfo.setDeviceVolume(1);
        DeviceInfo.setBatteryLevel(1);
        DeviceInfo.setBatteryStatus('ok');
        DeviceInfo.setRingerMode(0);

        EndScreen.setAutoClose(true);

        UnityAds.initialize(Platform.ANDROID, '14851', listener, true);
    });

    it('should handle happy path on iOS', function(this: Mocha.ITestDefinition, done: MochaDone) {
        this.timeout(60000);
        let readyCount = 0;
        const listener: IUnityAdsListener = {
            onUnityAdsReady: (placement: string) => {
                if(++readyCount === 2) {
                    UnityAds.show(placement);
                }
            },
            onUnityAdsStart: (placement: string) => {
                return;
            },
            onUnityAdsFinish: (placement: string, state: FinishState) => {
                if(state === FinishState.COMPLETED) {
                    setTimeout(() => {
                        validateRequestLog(Request.getLog());
                        done();
                    }, 2500);
                }
                return;
            },
            onUnityAdsError: (error: UnityAdsError, message: string) => {
                return;
            }
        };

        Request.setLog([]);

        DeviceInfo.setAdvertisingTrackingId('DA276DED-8DFE-4C57-A75E-9D7F7BBF2D21');
        DeviceInfo.setLimitAdTrackingFlag(true);
        DeviceInfo.setManufacturer('Apple');
        DeviceInfo.setModel('iPhone7,2');
        DeviceInfo.setOsVersion('10.1.1');
        DeviceInfo.setRooted(false);
        DeviceInfo.setScreenWidth(357);
        DeviceInfo.setScreenHeight(647);
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
        DeviceInfo.setNetworkOperator(24412);
        DeviceInfo.setNetworkOperatorName('DNA');
        DeviceInfo.setHeadset(false);
        DeviceInfo.setDeviceVolume(1);
        DeviceInfo.setBatteryLevel(1);
        DeviceInfo.setBatteryStatus('ok');
        DeviceInfo.setUserInterfaceIdiom(0);
        DeviceInfo.setSimulator(false);

        EndScreen.setAutoClose(true);

        UnityAds.initialize(Platform.IOS, '14850', listener, true);
    });

});
