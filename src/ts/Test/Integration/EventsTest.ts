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

    let currentGameId: number;
    const videoEvents = ['video_start', 'first_quartile', 'midpoint', 'third_quartile', 'video_end'];

    const findEventCount = (requestLog: string[], regexp: string) => {
        let count = 0;
        requestLog.forEach(log => {
             if(log.match(regexp)) {
                 ++count;
             }
        });
        return count;
    };

    const validateRequestLog = (requestLog: string[], validationRegexps: string[]) => {
        assert.equal(findEventCount(requestLog, '/games/\\d+/configuration'), 1, 'Did not find a configuration request');
        assert.equal(findEventCount(requestLog, '/v\\d+/games/\\d+/requests'), 3, 'Did not find 3 fill requests');

        for(const regexp of validationRegexps) {
            for(const eventName of videoEvents) {
                let eventRegexp = regexp.replace('{EVENT_NAME}', eventName);
                eventRegexp = eventRegexp.replace('{GAME_ID}', currentGameId.toString());
                assert.equal(findEventCount(requestLog, eventRegexp), 1, 'Did not find a ' + eventName + ' event');
            }
        }
    };

    beforeEach((done) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = (event: Event) => {
            const responseObj: any = JSON.parse(xhr.responseText);
            currentGameId = responseObj.game_id;
            done();
        };
        xhr.open('GET', 'https://fake-ads-backend.applifier.info/setup/first_perf_then_vast?token=373a221f4df5c659f2df918f899fa403');
        xhr.send();
    });

    afterEach((done) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = (event: Event) => {
            done();
        };
        xhr.open('GET', 'https://fake-ads-backend.applifier.info/fabulous/' + currentGameId + '/remove?token=373a221f4df5c659f2df918f899fa403');
        xhr.send();
    });

    it('should include all operational events on Android', function(this: Mocha.ITestCallbackContext, done: MochaDone) {
        this.timeout(60000);
        const validationRegexps = ['/ack/{GAME_ID}\\?campaignId=000000000000000000000000&event={EVENT_NAME}', '/mobile/gamers/[0-9a-f]+/video/{EVENT_NAME}/005472656d6f7220416e6472/{GAME_ID}'];
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
                            validateRequestLog(Request.getLog(), validationRegexps);
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

        UnityAds.initialize(Platform.ANDROID, currentGameId.toString(), listener, true);
    });

    it('should include all operational events on iOS', function(this: Mocha.ITestCallbackContext, done: MochaDone) {
        this.timeout(60000);
        const validationRegexps = ['/ack/{GAME_ID}\\?campaignId=000000000000000000000000&event={EVENT_NAME}', '/mobile/gamers/[0-9a-f]+/video/{EVENT_NAME}/00005472656d6f7220694f53/{GAME_ID}'];
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
                            validateRequestLog(Request.getLog(), validationRegexps);
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

        UnityAds.initialize(Platform.IOS, currentGameId.toString(), listener, true);
    });
});
