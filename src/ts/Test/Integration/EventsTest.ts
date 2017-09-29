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
import { CampaignManager } from 'Managers/CampaignManager';
import { OperativeEventManager } from 'Managers/OperativeEventManager';

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

    const validateRequestLog = (requestLog: string[], campaignIds: string[]) => {
        assert.equal(findEventCount(requestLog, '/games/\\d+/configuration'), 1, 'Did not find a configuration request');
        assert.equal(findEventCount(requestLog, '/v\\d+/games/\\d+/requests'), 3, 'Did not find 3 fill requests');
        for(const campaignId of campaignIds) {
            assert.equal(findEventCount(requestLog, '/mobile/gamers/[0-9a-f]+/video/video_start/' + campaignId), 1, 'Did not find a video_start event for campaignId: ' + campaignId);
            assert.equal(findEventCount(requestLog, '/mobile/gamers/[0-9a-f]+/video/first_quartile/' + campaignId), 1, 'Did not find a first_quartile event for campaignId: ' + campaignId);
            assert.equal(findEventCount(requestLog, '/mobile/gamers/[0-9a-f]+/video/midpoint/' + campaignId), 1, 'Did not find a midpoint event for campaignId: ' + campaignId);
            assert.equal(findEventCount(requestLog, '/mobile/gamers/[0-9a-f]+/video/third_quartile/' + campaignId), 1, 'Did not find a third_quartile event for campaignId: ' + campaignId);
            assert.equal(findEventCount(requestLog, '/mobile/gamers/[0-9a-f]+/video/video_end/' + campaignId), 1, 'Did not find a video_end event for campaignId: ' + campaignId);
        }
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
                if(startCount === 1) {
                    UnityAds.show(placement);
                }
            },
            onUnityAdsStart: (placement: string) => {
                ++startCount;
            },
            onUnityAdsFinish: (placement: string, state: FinishState) => {
                if(state === FinishState.COMPLETED) {
                    if(startCount === 2) {
                        setTimeout(() => {
                            validateRequestLog(Request.getLog(), ['000000000000000000000000', '005472656d6f7220416e6472']);
                            assert.equal(startCount, 2, 'onUnityAdsStart was not called exactly 2 times');
                            done();
                        }, 2500);
                    }
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

        DeviceInfo.setAdvertisingTrackingId('78db88cb-2026-4423-bfe0-07e9ed2701c3');
        DeviceInfo.setManufacturer('LGE');
        DeviceInfo.setModel('Nexus 5');
        DeviceInfo.setOsVersion('6.0.1');
        DeviceInfo.setScreenWidth(1776);
        DeviceInfo.setScreenHeight(1080);
        DeviceInfo.setTimeZone('GMT+02:00');

        AbstractAdUnit.setAutoClose(true);

        ConfigManager.setTestBaseUrl('https://fake-ads-backend.applifier.info');
        CampaignManager.setBaseUrl('https://fake-ads-backend.applifier.info');
        OperativeEventManager.setTestBaseUrl('https://fake-ads-backend.applifier.info');

        UnityAds.initialize(Platform.ANDROID, '111', listener, true);
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
                if(startCount === 1) {
                    UnityAds.show(placement);
                }
            },
            onUnityAdsStart: (placement: string) => {
                ++startCount;
            },
            onUnityAdsFinish: (placement: string, state: FinishState) => {
                if(state === FinishState.COMPLETED) {
                    if(startCount === 2) {
                        setTimeout(() => {
                            validateRequestLog(Request.getLog(), ['000000000000000000000000', '00005472656d6f7220694f53']);
                            assert.equal(startCount, 2, 'onUnityAdsStart was not called exactly 2 times');
                            done();
                        }, 2500);
                    }
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

        DeviceInfo.setAdvertisingTrackingId('DA276DED-8DFE-4C57-A75E-9D7F7BBF2D21');
        DeviceInfo.setManufacturer('Apple');
        DeviceInfo.setModel('iPhone7,2');
        DeviceInfo.setOsVersion('10.1.1');
        DeviceInfo.setScreenWidth(647);
        DeviceInfo.setScreenHeight(357);
        DeviceInfo.setTimeZone('+0200');

        AbstractAdUnit.setAutoClose(true);

        ConfigManager.setTestBaseUrl('https://fake-ads-backend.applifier.info');
        CampaignManager.setBaseUrl('https://fake-ads-backend.applifier.info');
        OperativeEventManager.setTestBaseUrl('https://fake-ads-backend.applifier.info');

        UnityAds.initialize(Platform.IOS, '111', listener, true);
    });

});
