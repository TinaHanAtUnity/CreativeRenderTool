import 'mocha';

import { Platform } from 'Constants/Platform';
import { UnityAds } from 'Native/Backend/UnityAds';
import { IUnityAdsListener } from 'Native/Backend/IUnityAdsListener';
import { DeviceInfo } from 'Native/Backend/Api/DeviceInfo';
import { ConfigManager } from 'Managers/ConfigManager';
import { CampaignManager } from 'Managers/CampaignManager';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { ProgrammaticOperativeEventManager } from 'Managers/ProgrammaticOperativeEventManager';

describe('MraidTest', () => {

    it('should handle happy path on Android', function(this: Mocha.ITestCallbackContext, done: MochaDone) {
        this.timeout(10000);
        let readyCount = 0;
        const listener: IUnityAdsListener = {
            onUnityAdsReady: (placement: string) => {
                if (++readyCount === 2) {
                    done();
                }
            },
            onUnityAdsStart: (placement: string) => {
                return;
            },
            onUnityAdsFinish: (placement: string, state: string) => {
                return;
            },
            onUnityAdsError: (error: string, message: string) => {
                return;
            },
            onUnityAdsClick: (placement: string) => {
                return;
            },
            onUnityAdsPlacementStateChanged: (placement: string, oldState: string, newState: string) => {
                return;
            }
        };

        DeviceInfo.setAdvertisingTrackingId('78db88cb-2026-4423-bfe0-07e9ed2701c3');
        DeviceInfo.setManufacturer('LGE');
        DeviceInfo.setModel('Nexus 5');
        DeviceInfo.setOsVersion('6.0.1');
        DeviceInfo.setScreenWidth(1080);
        DeviceInfo.setScreenHeight(1776);
        DeviceInfo.setTimeZone('GMT+02:00');

        ConfigManager.setTestBaseUrl('https://fake-ads-backend.applifier.info');
        CampaignManager.setBaseUrl('https://fake-ads-backend.applifier.info');
        ProgrammaticOperativeEventManager.setTestBaseUrl('https://fake-ads-backend.applifier.info');

        UnityAds.initialize(Platform.ANDROID, '444', listener, true);
    });

});
