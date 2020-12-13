import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { CampaignManager } from 'Ads/Managers/CampaignManager';
import { ProgrammaticOperativeEventManager } from 'Ads/Managers/ProgrammaticOperativeEventManager';
import { Backend } from 'Backend/Backend';
import { UnityAds } from 'Backend/UnityAds';
import { assert } from 'chai';
import { FinishState } from 'Core/Constants/FinishState';
import { RequestManager, AuctionProtocol } from 'Core/Managers/RequestManager';
import { Platform } from 'Core/Constants/Platform';
import { ConfigManager } from 'Core/Managers/ConfigManager';
import 'mocha';
import { fakeARUtils } from 'TestHelpers/FakeARUtils';
import * as sinon from 'sinon';
describe('AndroidEventsTest', () => {
    const sandbox = sinon.createSandbox();
    let currentGameId;
    const videoEvents = ['video_start', 'first_quartile', 'midpoint', 'third_quartile', 'video_end'];
    const findEventCount = (requestLog, regexp) => {
        let count = 0;
        requestLog.forEach(log => {
            if (log.match(regexp)) {
                ++count;
            }
        });
        return count;
    };
    const validateRequestLog = (requestLog, validationRegexps) => {
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
    beforeEach(function (done) {
        // tslint:disable:no-invalid-this
        this.timeout(15000);
        // tslint:enable
        const xhr = new XMLHttpRequest();
        xhr.timeout = 10000;
        xhr.onload = (event) => {
            const responseObj = JSON.parse(xhr.responseText);
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
    afterEach(function (done) {
        // tslint:disable:no-invalid-this
        this.timeout(15000);
        // tslint:enable
        const xhr = new XMLHttpRequest();
        xhr.timeout = 10000;
        xhr.onload = (event) => {
            done();
        };
        xhr.onerror = () => {
            throw new Error(xhr.statusText);
        };
        xhr.open('GET', 'https://fake-ads-backend.unityads.unity3d.com/fabulous/' + currentGameId + '/remove?token=373a221f4df5c659f2df918f899fa403');
        xhr.send();
        sandbox.restore();
    });
    it('should include all operational events on Android', function (done) {
        this.timeout(60000);
        const validationRegexps = ['/ack/{GAME_ID}\\?campaignId=000000000000000000000000&event={EVENT_NAME}', '/events/v2/brand/video/{EVENT_NAME}/{GAME_ID}/005472656d6f7220416e6472'];
        let readyCount = 0;
        let startCount = 0;
        const listener = {
            onUnityAdsReady: (placement) => {
                if (placement === 'video' || placement === 'defaultVideoAndPictureZone') {
                    if (++readyCount === 1) {
                        UnityAds.show(placement);
                    }
                    if (startCount === 1) {
                        UnityAds.show(placement);
                    }
                }
            },
            onUnityAdsStart: (placement) => {
                ++startCount;
            },
            onUnityAdsFinish: (placement, state) => {
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
            onUnityAdsError: (error, message) => {
                done(new Error(message));
            },
            onUnityAdsClick: (placement) => {
                return;
            },
            onUnityAdsPlacementStateChanged: (placement, oldState, newState) => {
                return;
            }
        };
        UnityAds.setBackend(new Backend(Platform.ANDROID));
        UnityAds.getBackend().Api.Request.setPassthrough(true);
        UnityAds.getBackend().Api.Request.setLog([]);
        UnityAds.getBackend().Api.DeviceInfo.setAdvertisingTrackingId('78db88cb-2026-4423-bfe0-07e9ed2701c3');
        UnityAds.getBackend().Api.DeviceInfo.setManufacturer('LGE');
        UnityAds.getBackend().Api.DeviceInfo.setModel('Nexus 5');
        UnityAds.getBackend().Api.DeviceInfo.setOsVersion('6.0.1');
        UnityAds.getBackend().Api.DeviceInfo.setScreenWidth(1776);
        UnityAds.getBackend().Api.DeviceInfo.setScreenHeight(1080);
        UnityAds.getBackend().Api.DeviceInfo.setTimeZone('GMT+02:00');
        UnityAds.getBackend().Api.DeviceInfo.setLimitAdTrackingFlag(true);
        AbstractAdUnit.setAutoClose(true);
        ConfigManager.setTestBaseUrl('https://fake-ads-backend.unityads.unity3d.com');
        CampaignManager.setBaseUrl('https://fake-ads-backend.unityads.unity3d.com');
        ProgrammaticOperativeEventManager.setTestBaseUrl('https://fake-ads-backend.unityads.unity3d.com');
        RequestManager.setTestAuctionProtocol(AuctionProtocol.V4);
        UnityAds.initialize(Platform.ANDROID, currentGameId.toString(), listener, true);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQW5kcm9pZEV2ZW50c1Rlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90ZXN0L0ludGVncmF0aW9uL0FuZHJvaWQvQW5kcm9pZEV2ZW50c1Rlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQzVELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUMvRCxPQUFPLEVBQUUsaUNBQWlDLEVBQUUsTUFBTSxnREFBZ0QsQ0FBQztBQUNuRyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFMUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQzVDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDOUIsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQ3pELE9BQU8sRUFBRSxjQUFjLEVBQUUsZUFBZSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDL0UsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ25ELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUM1RCxPQUFPLE9BQU8sQ0FBQztBQUNmLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUN0RCxPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUUvQixRQUFRLENBQUMsbUJBQW1CLEVBQUUsR0FBRyxFQUFFO0lBRS9CLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUN0QyxJQUFJLGFBQXFCLENBQUM7SUFDMUIsTUFBTSxXQUFXLEdBQUcsQ0FBQyxhQUFhLEVBQUUsZ0JBQWdCLEVBQUUsVUFBVSxFQUFFLGdCQUFnQixFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBRWpHLE1BQU0sY0FBYyxH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