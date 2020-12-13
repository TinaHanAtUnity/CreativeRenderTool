import { CampaignManager } from 'Ads/Managers/CampaignManager';
import { ProgrammaticOperativeEventManager } from 'Ads/Managers/ProgrammaticOperativeEventManager';
import { Backend } from 'Backend/Backend';
import { UnityAds } from 'Backend/UnityAds';
import { RequestManager, AuctionProtocol } from 'Core/Managers/RequestManager';
import { Platform } from 'Core/Constants/Platform';
import { ConfigManager } from 'Core/Managers/ConfigManager';
import 'mocha';
import { fakeARUtils } from 'TestHelpers/FakeARUtils';
import * as sinon from 'sinon';
import { assert } from 'chai';
describe('AndroidIntegrationTest', () => {
    const sandbox = sinon.createSandbox();
    beforeEach(() => {
        fakeARUtils(sandbox);
    });
    afterEach(() => {
        sandbox.restore();
    });
    it('should handle happy path on Android', function (done) {
        this.timeout(10000);
        let readyCount = 0;
        const listener = {
            onUnityAdsReady: (placement) => {
                if (++readyCount === 1) {
                    done();
                }
            },
            onUnityAdsStart: (placement) => {
                return;
            },
            onUnityAdsFinish: (placement, state) => {
                return;
            },
            onUnityAdsError: (error, message) => {
                return;
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
        UnityAds.getBackend().Api.DeviceInfo.setAdvertisingTrackingId('78db88cb-2026-4423-bfe0-07e9ed2701c3');
        UnityAds.getBackend().Api.DeviceInfo.setManufacturer('LGE');
        UnityAds.getBackend().Api.DeviceInfo.setModel('Nexus 5');
        UnityAds.getBackend().Api.DeviceInfo.setOsVersion('6.0.1');
        UnityAds.getBackend().Api.DeviceInfo.setScreenWidth(1080);
        UnityAds.getBackend().Api.DeviceInfo.setScreenHeight(1776);
        UnityAds.getBackend().Api.DeviceInfo.setTimeZone('GMT+02:00');
        ConfigManager.setTestBaseUrl('https://fake-ads-backend.unityads.unity3d.com');
        CampaignManager.setBaseUrl('https://fake-ads-backend.unityads.unity3d.com');
        ProgrammaticOperativeEventManager.setTestBaseUrl('https://fake-ads-backend.unityads.unity3d.com');
        RequestManager.setTestAuctionProtocol(AuctionProtocol.V4);
        UnityAds.initialize(Platform.ANDROID, '456', listener, true);
    });
    xit('should handle happy path on Android with Load API', function () {
        this.timeout(10000);
        let readyCount = 0;
        let stateChangeCount = 0;
        let readyPlacement = '';
        let promiseReadyResolve = null;
        const promiseReady = new Promise(resolve => promiseReadyResolve = resolve);
        const listener = {
            onUnityAdsReady: (placement) => {
                readyPlacement = placement;
                readyCount++;
                if (promiseReadyResolve) {
                    promiseReadyResolve();
                    promiseReadyResolve = null;
                }
            },
            onUnityAdsStart: (placement) => {
                return;
            },
            onUnityAdsFinish: (placement, state) => {
                return;
            },
            onUnityAdsError: (error, message) => {
                return;
            },
            onUnityAdsClick: (placement) => {
                return;
            },
            onUnityAdsPlacementStateChanged: (placement, oldState, newState) => {
                stateChangeCount++;
                return;
            }
        };
        UnityAds.setBackend(new Backend(Platform.ANDROID));
        UnityAds.getBackend().Api.Request.setPassthrough(true);
        UnityAds.getBackend().Api.DeviceInfo.setAdvertisingTrackingId('78db88cb-2026-4423-bfe0-07e9ed2701c3');
        UnityAds.getBackend().Api.DeviceInfo.setManufacturer('LGE');
        UnityAds.getBackend().Api.DeviceInfo.setModel('Nexus 5');
        UnityAds.getBackend().Api.DeviceInfo.setOsVersion('6.0.1');
        UnityAds.getBackend().Api.DeviceInfo.setScreenWidth(1080);
        UnityAds.getBackend().Api.DeviceInfo.setScreenHeight(1776);
        UnityAds.getBackend().Api.DeviceInfo.setTimeZone('GMT+02:00');
        UnityAds.getBackend().Api.Sdk.setInitTimeStamp(Date.now());
        ConfigManager.setAbGroup(15);
        ConfigManager.setTestBaseUrl('https://fake-ads-backend.unityads.unity3d.com');
        CampaignManager.setBaseUrl('https://fake-ads-backend.unityads.unity3d.com');
        ProgrammaticOperativeEventManager.setTestBaseUrl('https://fake-ads-backend.unityads.unity3d.com');
        const gameId = '2988443';
        const testMode = true;
        const enablePerPlacementLoad = true;
        UnityAds.initialize(Platform.ANDROID, gameId, listener, testMode, enablePerPlacementLoad).then(() => {
            UnityAds.load('video');
        }).catch(() => {
            assert.fail('should not throw');
        });
        return promiseReady.then(() => {
            assert.equal(stateChangeCount, 2);
            assert.equal(readyCount, 1);
            assert.equal(readyPlacement, 'video');
        });
    });
    xit('should handle happy path on Android with Load API, ready called twice', function () {
        this.timeout(10000);
        let stateChangeCount = 0;
        let readyPlacement = [];
        let promiseReadyResolve = null;
        const promiseReady = new Promise(resolve => promiseReadyResolve = resolve);
        const listener = {
            onUnityAdsReady: (placement) => {
                readyPlacement = readyPlacement.concat(placement);
                if (readyPlacement.length >= 2) {
                    if (promiseReadyResolve) {
                        promiseReadyResolve();
                        promiseReadyResolve = null;
                    }
                }
            },
            onUnityAdsStart: (placement) => {
                return;
            },
            onUnityAdsFinish: (placement, state) => {
                return;
            },
            onUnityAdsError: (error, message) => {
                return;
            },
            onUnityAdsClick: (placement) => {
                return;
            },
            onUnityAdsPlacementStateChanged: (placement, oldState, newState) => {
                stateChangeCount++;
                return;
            }
        };
        UnityAds.setBackend(new Backend(Platform.ANDROID));
        UnityAds.getBackend().Api.Request.setPassthrough(true);
        UnityAds.getBackend().Api.DeviceInfo.setAdvertisingTrackingId('78db88cb-2026-4423-bfe0-07e9ed2701c3');
        UnityAds.getBackend().Api.DeviceInfo.setManufacturer('LGE');
        UnityAds.getBackend().Api.DeviceInfo.setModel('Nexus 5');
        UnityAds.getBackend().Api.DeviceInfo.setOsVersion('6.0.1');
        UnityAds.getBackend().Api.DeviceInfo.setScreenWidth(1080);
        UnityAds.getBackend().Api.DeviceInfo.setScreenHeight(1776);
        UnityAds.getBackend().Api.DeviceInfo.setTimeZone('GMT+02:00');
        UnityAds.getBackend().Api.Sdk.setInitTimeStamp(Date.now());
        ConfigManager.setAbGroup(15);
        ConfigManager.setTestBaseUrl('https://fake-ads-backend.unityads.unity3d.com');
        CampaignManager.setBaseUrl('https://fake-ads-backend.unityads.unity3d.com');
        ProgrammaticOperativeEventManager.setTestBaseUrl('https://fake-ads-backend.unityads.unity3d.com');
        const gameId = '2988443';
        const testMode = true;
        const enablePerPlacementLoad = true;
        UnityAds.initialize(Platform.ANDROID, gameId, listener, testMode, enablePerPlacementLoad).then(() => {
            UnityAds.load('rewardedVideo');
            UnityAds.load('video');
        }).catch(() => {
            assert.fail('should not throw');
        });
        return promiseReady.then(() => {
            assert.equal(stateChangeCount, 4);
            assert.equal(readyPlacement.length, 2);
            assert.isTrue(readyPlacement.includes('rewardedVideo'));
            assert.isTrue(readyPlacement.includes('video'));
        });
    });
    xit('should handle happy path on Android with Load API, should do nothing', function () {
        this.timeout(10000);
        let readyCount = 0;
        let stateChangeCount = 0;
        const listener = {
            onUnityAdsReady: (placement) => {
                readyCount++;
            },
            onUnityAdsStart: (placement) => {
                return;
            },
            onUnityAdsFinish: (placement, state) => {
                return;
            },
            onUnityAdsError: (error, message) => {
                return;
            },
            onUnityAdsClick: (placement) => {
                return;
            },
            onUnityAdsPlacementStateChanged: (placement, oldState, newState) => {
                stateChangeCount++;
                return;
            }
        };
        UnityAds.setBackend(new Backend(Platform.ANDROID));
        UnityAds.getBackend().Api.Request.setPassthrough(true);
        UnityAds.getBackend().Api.DeviceInfo.setAdvertisingTrackingId('78db88cb-2026-4423-bfe0-07e9ed2701c3');
        UnityAds.getBackend().Api.DeviceInfo.setManufacturer('LGE');
        UnityAds.getBackend().Api.DeviceInfo.setModel('Nexus 5');
        UnityAds.getBackend().Api.DeviceInfo.setOsVersion('6.0.1');
        UnityAds.getBackend().Api.DeviceInfo.setScreenWidth(1080);
        UnityAds.getBackend().Api.DeviceInfo.setScreenHeight(1776);
        UnityAds.getBackend().Api.DeviceInfo.setTimeZone('GMT+02:00');
        UnityAds.getBackend().Api.Sdk.setInitTimeStamp(Date.now());
        ConfigManager.setAbGroup(15);
        ConfigManager.setTestBaseUrl('https://fake-ads-backend.unityads.unity3d.com');
        CampaignManager.setBaseUrl('https://fake-ads-backend.unityads.unity3d.com');
        ProgrammaticOperativeEventManager.setTestBaseUrl('https://fake-ads-backend.unityads.unity3d.com');
        const gameId = '2988443';
        const testMode = true;
        const enablePerPlacementLoad = true;
        UnityAds.initialize(Platform.ANDROID, gameId, listener, testMode, enablePerPlacementLoad);
        return new Promise(resolve => setTimeout(resolve, 5000)).then(() => {
            assert.equal(readyCount, 0);
            assert.equal(stateChangeCount, 0);
        });
    });
    xit('should handle happy path on Android with Load API, request before init', function () {
        this.timeout(10000);
        let readyCount = 0;
        let stateChangeCount = 0;
        let readyPlacement = '';
        let promiseReadyResolve = null;
        const promiseReady = new Promise(resolve => promiseReadyResolve = resolve);
        const listener = {
            onUnityAdsReady: (placement) => {
                readyPlacement = placement;
                readyCount++;
                if (promiseReadyResolve) {
                    promiseReadyResolve();
                    promiseReadyResolve = null;
                }
            },
            onUnityAdsStart: (placement) => {
                return;
            },
            onUnityAdsFinish: (placement, state) => {
                return;
            },
            onUnityAdsError: (error, message) => {
                return;
            },
            onUnityAdsClick: (placement) => {
                return;
            },
            onUnityAdsPlacementStateChanged: (placement, oldState, newState) => {
                stateChangeCount++;
                return;
            }
        };
        UnityAds.setBackend(new Backend(Platform.ANDROID));
        UnityAds.getBackend().Api.Request.setPassthrough(true);
        UnityAds.getBackend().Api.DeviceInfo.setAdvertisingTrackingId('78db88cb-2026-4423-bfe0-07e9ed2701c3');
        UnityAds.getBackend().Api.DeviceInfo.setManufacturer('LGE');
        UnityAds.getBackend().Api.DeviceInfo.setModel('Nexus 5');
        UnityAds.getBackend().Api.DeviceInfo.setOsVersion('6.0.1');
        UnityAds.getBackend().Api.DeviceInfo.setScreenWidth(1080);
        UnityAds.getBackend().Api.DeviceInfo.setScreenHeight(1776);
        UnityAds.getBackend().Api.DeviceInfo.setTimeZone('GMT+02:00');
        UnityAds.getBackend().Api.Sdk.setInitTimeStamp(Date.now());
        ConfigManager.setAbGroup(15);
        ConfigManager.setTestBaseUrl('https://fake-ads-backend.unityads.unity3d.com');
        CampaignManager.setBaseUrl('https://fake-ads-backend.unityads.unity3d.com');
        ProgrammaticOperativeEventManager.setTestBaseUrl('https://fake-ads-backend.unityads.unity3d.com');
        const gameId = '2988443';
        const testMode = true;
        const enablePerPlacementLoad = true;
        UnityAds.initialize(Platform.ANDROID, gameId, listener, testMode, enablePerPlacementLoad).then(() => {
            UnityAds.load('rewardedVideo');
        }).catch(() => {
            assert.fail('should not throw');
        });
        return promiseReady.then(() => {
            assert.equal(stateChangeCount, 2);
            assert.equal(readyCount, 1);
            assert.equal(readyPlacement, 'rewardedVideo');
        });
    });
    xit('should handle happy path on Android with Load API, ready called twice for same placement', function () {
        this.timeout(10000);
        let stateChangeCount = 0;
        let readyPlacement = [];
        let promiseReadyResolve = null;
        const promiseReady = new Promise(resolve => promiseReadyResolve = resolve);
        const listener = {
            onUnityAdsReady: (placement) => {
                readyPlacement = readyPlacement.concat(placement);
                if (readyPlacement.length === 1) {
                    UnityAds.load('video');
                }
                if (readyPlacement.length >= 2) {
                    if (promiseReadyResolve) {
                        promiseReadyResolve();
                        promiseReadyResolve = null;
                    }
                }
            },
            onUnityAdsStart: (placement) => {
                return;
            },
            onUnityAdsFinish: (placement, state) => {
                return;
            },
            onUnityAdsError: (error, message) => {
                return;
            },
            onUnityAdsClick: (placement) => {
                return;
            },
            onUnityAdsPlacementStateChanged: (placement, oldState, newState) => {
                stateChangeCount++;
                return;
            }
        };
        UnityAds.setBackend(new Backend(Platform.ANDROID));
        UnityAds.getBackend().Api.Request.setPassthrough(true);
        UnityAds.getBackend().Api.DeviceInfo.setAdvertisingTrackingId('78db88cb-2026-4423-bfe0-07e9ed2701c3');
        UnityAds.getBackend().Api.DeviceInfo.setManufacturer('LGE');
        UnityAds.getBackend().Api.DeviceInfo.setModel('Nexus 5');
        UnityAds.getBackend().Api.DeviceInfo.setOsVersion('6.0.1');
        UnityAds.getBackend().Api.DeviceInfo.setScreenWidth(1080);
        UnityAds.getBackend().Api.DeviceInfo.setScreenHeight(1776);
        UnityAds.getBackend().Api.DeviceInfo.setTimeZone('GMT+02:00');
        UnityAds.getBackend().Api.Sdk.setInitTimeStamp(Date.now());
        ConfigManager.setAbGroup(15);
        ConfigManager.setTestBaseUrl('https://fake-ads-backend.unityads.unity3d.com');
        CampaignManager.setBaseUrl('https://fake-ads-backend.unityads.unity3d.com');
        ProgrammaticOperativeEventManager.setTestBaseUrl('https://fake-ads-backend.unityads.unity3d.com');
        const gameId = '2988443';
        const testMode = true;
        const enablePerPlacementLoad = true;
        UnityAds.initialize(Platform.ANDROID, gameId, listener, testMode, enablePerPlacementLoad).then(() => {
            UnityAds.load('video');
        }).catch(() => {
            assert.fail('should not throw');
        });
        return promiseReady.then(() => {
            assert.equal(stateChangeCount, 2);
            assert.equal(readyPlacement.length, 2);
            assert.isTrue(readyPlacement.includes('video'));
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQW5kcm9pZEludGVncmF0aW9uVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Rlc3QvSW50ZWdyYXRpb24vQW5kcm9pZC9BbmRyb2lkSW50ZWdyYXRpb25UZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUMvRCxPQUFPLEVBQUUsaUNBQWlDLEVBQUUsTUFBTSxnREFBZ0QsQ0FBQztBQUNuRyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFMUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQzVDLE9BQU8sRUFBRSxjQUFjLEVBQUUsZUFBZSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDL0UsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ25ELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUM1RCxPQUFPLE9BQU8sQ0FBQztBQUNmLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUN0RCxPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUMvQixPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBRTlCLFFBQVEsQ0FBQyx3QkFBd0IsRUFBRSxHQUFHLEVBQUU7SUFDcEMsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBRXRDLFVBQVUsQ0FBQyxHQUFHLEVBQUU7UUFDWixXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDekIsQ0FBQyxDQUFDLENBQUM7SUFFSCxTQUFTLENBQUMsR0FBRyxFQUFFO1FBQ1gsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ3RCLENBQUMsQ0FBQyxDQUFDO0lBRUgsRUFBRSxDQUFDLHFDQUFxQyxFQUFFLFVBQTJDLElBQWU7UUFDaEcsSUFB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