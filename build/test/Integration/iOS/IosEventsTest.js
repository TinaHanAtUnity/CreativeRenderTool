import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { CampaignManager } from 'Ads/Managers/CampaignManager';
import { ProgrammaticOperativeEventManager } from 'Ads/Managers/ProgrammaticOperativeEventManager';
import { Backend } from 'Backend/Backend';
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
        RequestManager.setTestAuctionProtocol(AuctionProtocol.V4);
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
    it('should include all operational events on iOS', function (done) {
        this.timeout(60000);
        const validationRegexps = ['/ack/{GAME_ID}\\?campaignId=000000000000000000000000&event={EVENT_NAME}', '/events/v2/brand/video/{EVENT_NAME}/{GAME_ID}/00005472656d6f7220694f53'];
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
        UnityAds.getBackend().Api.DeviceInfo.setLimitAdTrackingFlag(true);
        AbstractAdUnit.setAutoClose(true);
        ConfigManager.setTestBaseUrl('https://fake-ads-backend.unityads.unity3d.com');
        CampaignManager.setBaseUrl('https://fake-ads-backend.unityads.unity3d.com');
        ProgrammaticOperativeEventManager.setTestBaseUrl('https://fake-ads-backend.unityads.unity3d.com');
        UnityAds.initialize(Platform.IOS, currentGameId.toString(), listener, true);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW9zRXZlbnRzVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Rlc3QvSW50ZWdyYXRpb24vaU9TL0lvc0V2ZW50c1Rlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQzVELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUMvRCxPQUFPLEVBQUUsaUNBQWlDLEVBQUUsTUFBTSxnREFBZ0QsQ0FBQztBQUNuRyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFMUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQzVDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDOUIsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBRXpELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUNuRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDNUQsT0FBTyxPQUFPLENBQUM7QUFDZixPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDdEQsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUM7QUFDL0IsT0FBTyxFQUFFLGNBQWMsRUFBRSxlQUFlLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUUvRSxRQUFRLENBQUMsa0JBQWtCLEVBQUUsR0FBRyxFQUFFO0lBQzlCLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUV0QyxJQUFJLGFBQXFCLENBQUM7SUFDMUIsTUFBTSxXQUFXLEdBQUcsQ0FBQyxhQUFhLEVBQUUsZ0JBQWdCLEVBQUUsVUFBVSxFQUFFLGdCQUFnQixFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBRWpHLE1BQU0sY0FBYyxHQUFHLENBQUMsVUFB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