import { CampaignManager } from 'Ads/Managers/CampaignManager';
import { ProgrammaticOperativeEventManager } from 'Ads/Managers/ProgrammaticOperativeEventManager';
import { DeviceInfo } from 'Backend/Api/DeviceInfo';
import { IUnityAdsListener } from 'Backend/IUnityAdsListener';
import { UnityAds } from 'Backend/UnityAds';

import { Platform } from 'Core/Constants/Platform';
import { ConfigManager } from 'Core/Managers/ConfigManager';
import 'mocha';
import { Backend } from '../../../src/ts/Backend/Backend';

describe('IosMraidTest', () => {

    it('should handle happy path on iOS', function(this: Mocha.ITestCallbackContext, done: MochaDone) {
        this.timeout(10000);
        let readyCount = 0;
        const listener: IUnityAdsListener = {
            onUnityAdsReady: (placement: string) => {
                if(++readyCount === 2) {
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

        UnityAds.setBackend(new Backend(Platform.ANDROID));

        UnityAds.getBackend().Api.DeviceInfo.setAdvertisingTrackingId('DA276DED-8DFE-4C57-A75E-9D7F7BBF2D21');
        UnityAds.getBackend().Api.DeviceInfo.setManufacturer('Apple');
        UnityAds.getBackend().Api.DeviceInfo.setModel('iPhone7,2');
        UnityAds.getBackend().Api.DeviceInfo.setOsVersion('10.1.1');
        UnityAds.getBackend().Api.DeviceInfo.setScreenWidth(357);
        UnityAds.getBackend().Api.DeviceInfo.setScreenHeight(647);
        UnityAds.getBackend().Api.DeviceInfo.setTimeZone('+0200');

        ConfigManager.setTestBaseUrl('https://fake-ads-backend.applifier.info');
        CampaignManager.setBaseUrl('https://fake-ads-backend.applifier.info');
        ProgrammaticOperativeEventManager.setTestBaseUrl('https://fake-ads-backend.applifier.info');

        UnityAds.initialize(Platform.IOS, '444', listener, true);
    });

});
