import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { CampaignManager } from 'Ads/Managers/CampaignManager';
import { ProgrammaticOperativeEventManager } from 'Ads/Managers/ProgrammaticOperativeEventManager';
import { Backend } from 'Backend/Backend';
import { IUnityAdsListener } from 'Backend/IUnityAdsListener';
import { UnityAds } from 'Backend/UnityAds';
import { assert } from 'chai';
import { FinishState } from 'Core/Constants/FinishState';

import { Platform } from 'Core/Constants/Platform';
import { ConfigManager } from 'Core/Managers/ConfigManager';
import 'mocha';
import { fakeARUtils } from 'TestHelpers/FakeARUtils';
import * as sinon from 'sinon';
import { RequestManager, AuctionProtocol } from 'Core/Managers/RequestManager';

describe('IosEventsTest V4', () => {
    const sandbox = sinon.createSandbox();

    let currentGameId: number;
    const videoEvents = ['video_start', 'first_quartile', 'midpoint', 'third_quartile', 'video_end'];

    const findEventCount = (requestLog: string[], regexp: string) => {
        let count = 0;
        requestLog.forEach(log => {
            if (log.match(regexp)) {
                ++count;
            }
        });
        return count;
    };

    const validateRequestLog = (requestLog: string[], validationRegexps: string[]) => {
        assert.equal(findEventCount(requestLog, '/games/\\d+/configuration'), 1, 'Did not find a configuration request');
        assert.equal(findEventCount(requestLog, '/v\\d+/games/\\d+/requests'), 3, 'Did not find 3 fill requests');

        for (const regexp of validationRegexps) {
            for (const eventName of videoEvents) {
                let eventRegexp = regexp.replace('{EVENT_NAME}', eventName);
                eventRegexp = eventRegexp.replace('{GAME_ID}', currentGameId.toString());
                assert.equal(findEventCount(requestLog, eventRegexp), 1, 'Did not find a ' + eventName + ' event');
            }
        }
    };

    beforeEach(function(done) {
        RequestManager.setTestAuctionProtocol(AuctionProtocol.V4);
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
        xhr.open('GET', 'https://fake-ads-backend.unityads.unity3d.com/setup/first_perf_then_vast?token=373a221f4df5c659f2df918f899fa403');
        xhr.send();

        fakeARUtils(sandbox);
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
        xhr.open('GET', 'https://fake-ads-backend.unityads.unity3d.com/fabulous/' + currentGameId + '/remove?token=373a221f4df5c659f2df918f899fa403');
        xhr.send();

        sandbox.restore();
    });

    it('should include all operational events on iOS', function(this: Mocha.ITestCallbackContext, done: MochaDone) {
        this.timeout(60000);
        const validationRegexps = ['/ack/{GAME_ID}\\?campaignId=000000000000000000000000&event={EVENT_NAME}', '/events/v2/brand/video/{EVENT_NAME}/{GAME_ID}/00005472656d6f7220694f53'];
        let readyCount = 0;
        let startCount = 0;
        const listener: IUnityAdsListener = {
            onUnityAdsReady: (placement: string) => {
                if (placement === 'video' || placement === 'defaultVideoAndPictureZone') {
                    if (++readyCount === 1) {
                        UnityAds.show(placement);
                    }
                    if (startCount === 1) {
                        UnityAds.show(placement);
                    }
                }
            },
            onUnityAdsStart: (placement: string) => {
                ++startCount;
            },
            onUnityAdsFinish: (placement: string, state: string) => {
                if (state === FinishState[FinishState.COMPLETED]) {
                    if (startCount === 2) {
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

        UnityAds.setBackend(new Backend(Platform.IOS));

        UnityAds.getBackend().Api.Request.setPassthrough(true);
        UnityAds.getBackend().Api.Request.setLog([]);

        UnityAds.getBackend().Api.DeviceInfo.setAdvertisingTrackingId('DA276DED-8DFE-4C57-A75E-9D7F7BBF2D21');
        UnityAds.getBackend().Api.DeviceInfo.setManufacturer('Apple');
        UnityAds.getBackend().Api.DeviceInfo.setModel('iPhone7,2');
        UnityAds.getBackend().Api.DeviceInfo.setOsVersion('10.1.1');
        UnityAds.getBackend().Api.DeviceInfo.setScreenWidth(647);
        UnityAds.getBackend().Api.DeviceInfo.setScreenHeight(357);
        UnityAds.getBackend().Api.DeviceInfo.setTimeZone('+0200');
        UnityAds.getBackend().Api.DeviceInfo.setLimitAdTrackingFlag(false);

        AbstractAdUnit.setAutoClose(true);

        ConfigManager.setTestBaseUrl('https://fake-ads-backend.unityads.unity3d.com');
        CampaignManager.setBaseUrl('https://fake-ads-backend.unityads.unity3d.com');
        ProgrammaticOperativeEventManager.setTestBaseUrl('https://fake-ads-backend.unityads.unity3d.com');

        UnityAds.initialize(Platform.IOS, currentGameId.toString(), listener, true);
    });
});
