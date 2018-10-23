import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { CampaignManager } from 'Ads/Managers/CampaignManager';
import { ProgrammaticOperativeEventManager } from 'Ads/Managers/ProgrammaticOperativeEventManager';
import { DeviceInfo } from 'Backend/Api/DeviceInfo';
import { Request } from 'Backend/Api/Request';
import { IUnityAdsListener } from 'Backend/IUnityAdsListener';
import { UnityAds } from 'Backend/UnityAds';
import { assert } from 'chai';
import { FinishState } from 'Core/Constants/FinishState';

import { Platform } from 'Core/Constants/Platform';
import { ConfigManager } from 'Core/Managers/ConfigManager';
import 'mocha';
import { Backend } from '../../../src/ts/Backend/Backend';

describe('AndroidEventsTest', () => {

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

    beforeEach(function(done) {
        // tslint:disable:no-invalid-this
        this.timeout(15000);
        // tslint:enable
        const xhr = new XMLHttpRequest();
        xhr.timeout = 10000;
        xhr.onload = (event: Event) => {
            const responseObj: any = JSON.parse(xhr.responseText);
            currentGameId = responseObj.game_id;
            done();
        };
        xhr.onerror = () => {
            throw new Error(xhr.statusText);
        };
        xhr.open('GET', 'https://fake-ads-backend.applifier.info/setup/first_perf_then_vast?token=373a221f4df5c659f2df918f899fa403');
        xhr.send();
    });

    afterEach(function(done) {
        // tslint:disable:no-invalid-this
        this.timeout(15000);
        // tslint:enable
        const xhr = new XMLHttpRequest();
        xhr.timeout = 10000;
        xhr.onload = (event: Event) => {
            done();
        };
        xhr.onerror = () => {
            throw new Error(xhr.statusText);
        };
        xhr.open('GET', 'https://fake-ads-backend.applifier.info/fabulous/' + currentGameId + '/remove?token=373a221f4df5c659f2df918f899fa403');
        xhr.send();
    });

    it('should include all operational events on Android', function(this: Mocha.ITestCallbackContext, done: MochaDone) {
        this.timeout(60000);
        const validationRegexps = ['/ack/{GAME_ID}\\?campaignId=000000000000000000000000&event={EVENT_NAME}', '/events/v2/brand/video/{EVENT_NAME}/{GAME_ID}/005472656d6f7220416e6472'];
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
            onUnityAdsFinish: (placement: string, state: string) => {
                if(state === FinishState[FinishState.COMPLETED]) {
                    if(startCount === 2) {
                        setTimeout(() => {
                            validateRequestLog(UnityAds.getBackend().Api.Request.getLog(), validationRegexps);
                            assert.equal(startCount, 2, 'onUnityAdsStart was not called exactly 2 times');
                            done();
                        }, 2500);
                    }
                }
            },
            onUnityAdsError: (error: string, message: string) => {
                done(new Error(message));
            },
            onUnityAdsClick: (placement: string) => {
                return;
            },
            onUnityAdsPlacementStateChanged: (placement: string, oldState: string, newState: string) => {
                return;
            }
        };

        UnityAds.setBackend(new Backend(Platform.ANDROID));

        UnityAds.getBackend().Api.Request.setLog([]);

        UnityAds.getBackend().Api.DeviceInfo.setAdvertisingTrackingId('78db88cb-2026-4423-bfe0-07e9ed2701c3');
        UnityAds.getBackend().Api.DeviceInfo.setManufacturer('LGE');
        UnityAds.getBackend().Api.DeviceInfo.setModel('Nexus 5');
        UnityAds.getBackend().Api.DeviceInfo.setOsVersion('6.0.1');
        UnityAds.getBackend().Api.DeviceInfo.setScreenWidth(1776);
        UnityAds.getBackend().Api.DeviceInfo.setScreenHeight(1080);
        UnityAds.getBackend().Api.DeviceInfo.setTimeZone('GMT+02:00');

        AbstractAdUnit.setAutoClose(true);

        ConfigManager.setTestBaseUrl('https://fake-ads-backend.applifier.info');
        CampaignManager.setBaseUrl('https://fake-ads-backend.applifier.info');
        ProgrammaticOperativeEventManager.setTestBaseUrl('https://fake-ads-backend.applifier.info');

        UnityAds.initialize(Platform.ANDROID, currentGameId.toString(), listener, true);
    });

});
