import { CampaignManager } from 'Ads/Managers/CampaignManager';
import { ProgrammaticOperativeEventManager } from 'Ads/Managers/ProgrammaticOperativeEventManager';
import { Backend } from 'Backend/Backend';
import { IUnityAdsListener } from 'Backend/IUnityAdsListener';
import { UnityAds } from 'Backend/UnityAds';

import { Platform } from 'Core/Constants/Platform';
import { ConfigManager } from 'Core/Managers/ConfigManager';
import 'mocha';
import { fakeARUtils } from 'TestHelpers/FakeARUtils';
import * as sinon from 'sinon';
import { assert } from 'chai';
import { ZyngaLoadTest } from 'Core/Models/ABGroup';

describe('AndroidIntegrationTest', () => {
    const sandbox = sinon.createSandbox();

    beforeEach(() => {
        fakeARUtils(sandbox);
        // Force AB Test to return false to comply with hardcoded ABGroup 14 in FAB for reverse AB Test
        sandbox.stub(ZyngaLoadTest, 'isValid').callsFake(() => {
            return false;
        });
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should handle happy path on Android', function(this: Mocha.ITestCallbackContext, done: MochaDone) {
        this.timeout(10000);
        let readyCount = 0;
        const listener: IUnityAdsListener = {
            onUnityAdsReady: (placement: string) => {
                if(++readyCount === 1) {
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

        UnityAds.initialize(Platform.ANDROID, '456', listener, true);
    });

    it('should handle happy path on Android with Load API', function(this: Mocha.ITestCallbackContext): Promise<any> {
        this.timeout(10000);
        let readyCount = 0;

        let readyPlacement: string = '';
        let promiseReadyResolve: any = null;
        const promiseReady = new Promise(resolve => promiseReadyResolve = resolve);

        const listener: IUnityAdsListener = {
            onUnityAdsReady: (placement: string) => {
                readyPlacement = placement;
                readyCount++;
                if(promiseReadyResolve) {
                    promiseReadyResolve();
                    promiseReadyResolve = null;
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
        UnityAds.getBackend().Api.Request.setPassthrough(true);

        UnityAds.getBackend().Api.DeviceInfo.setAdvertisingTrackingId('78db88cb-2026-4423-bfe0-07e9ed2701c3');
        UnityAds.getBackend().Api.DeviceInfo.setManufacturer('LGE');
        UnityAds.getBackend().Api.DeviceInfo.setModel('Nexus 5');
        UnityAds.getBackend().Api.DeviceInfo.setOsVersion('6.0.1');
        UnityAds.getBackend().Api.DeviceInfo.setScreenWidth(1080);
        UnityAds.getBackend().Api.DeviceInfo.setScreenHeight(1776);
        UnityAds.getBackend().Api.DeviceInfo.setTimeZone('GMT+02:00');
        UnityAds.getBackend().Api.Sdk.setInitTimeStamp(Date.now());

        ConfigManager.setAbGroup(14);
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
            assert.equal(readyCount, 1);
            assert.equal(readyPlacement, 'video');
        });
    });

    it('should handle happy path on Android with Load API, ready called twice', function(this: Mocha.ITestCallbackContext): Promise<any> {
        this.timeout(10000);

        let readyPlacement: string[] = [];
        let promiseReadyResolve: any = null;
        const promiseReady = new Promise(resolve => promiseReadyResolve = resolve);

        const listener: IUnityAdsListener = {
            onUnityAdsReady: (placement: string) => {
                readyPlacement = readyPlacement.concat(placement);
                if (readyPlacement.length >= 2) {
                    if (promiseReadyResolve) {
                        promiseReadyResolve();
                        promiseReadyResolve = null;
                    }
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
        UnityAds.getBackend().Api.Request.setPassthrough(true);

        UnityAds.getBackend().Api.DeviceInfo.setAdvertisingTrackingId('78db88cb-2026-4423-bfe0-07e9ed2701c3');
        UnityAds.getBackend().Api.DeviceInfo.setManufacturer('LGE');
        UnityAds.getBackend().Api.DeviceInfo.setModel('Nexus 5');
        UnityAds.getBackend().Api.DeviceInfo.setOsVersion('6.0.1');
        UnityAds.getBackend().Api.DeviceInfo.setScreenWidth(1080);
        UnityAds.getBackend().Api.DeviceInfo.setScreenHeight(1776);
        UnityAds.getBackend().Api.DeviceInfo.setTimeZone('GMT+02:00');
        UnityAds.getBackend().Api.Sdk.setInitTimeStamp(Date.now());

        ConfigManager.setAbGroup(14);
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
            assert.equal(readyPlacement.length, 2);
            assert.isTrue(readyPlacement.includes('rewardedVideo'));
            assert.isTrue(readyPlacement.includes('video'));
        });
    });

    it('should handle happy path on Android with Load API, should do nothing', function(this: Mocha.ITestCallbackContext): Promise<any> {
        this.timeout(10000);
        let readyCount = 0;

        const listener: IUnityAdsListener = {
            onUnityAdsReady: (placement: string) => {
                readyCount++;
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
        UnityAds.getBackend().Api.Request.setPassthrough(true);

        UnityAds.getBackend().Api.DeviceInfo.setAdvertisingTrackingId('78db88cb-2026-4423-bfe0-07e9ed2701c3');
        UnityAds.getBackend().Api.DeviceInfo.setManufacturer('LGE');
        UnityAds.getBackend().Api.DeviceInfo.setModel('Nexus 5');
        UnityAds.getBackend().Api.DeviceInfo.setOsVersion('6.0.1');
        UnityAds.getBackend().Api.DeviceInfo.setScreenWidth(1080);
        UnityAds.getBackend().Api.DeviceInfo.setScreenHeight(1776);
        UnityAds.getBackend().Api.DeviceInfo.setTimeZone('GMT+02:00');
        UnityAds.getBackend().Api.Sdk.setInitTimeStamp(Date.now());

        ConfigManager.setAbGroup(14);
        ConfigManager.setTestBaseUrl('https://fake-ads-backend.unityads.unity3d.com');
        CampaignManager.setBaseUrl('https://fake-ads-backend.unityads.unity3d.com');
        ProgrammaticOperativeEventManager.setTestBaseUrl('https://fake-ads-backend.unityads.unity3d.com');

        const gameId = '2988443';
        const testMode = true;
        const enablePerPlacementLoad = true;
        UnityAds.initialize(Platform.ANDROID, gameId, listener, testMode, enablePerPlacementLoad);

        return new Promise(resolve => setTimeout(resolve, 5000)).then(() => {
            assert.equal(readyCount, 0);
        });
    });

    it('should handle happy path on Android with Load API, request after init', function(this: Mocha.ITestCallbackContext): Promise<any> {
        this.timeout(10000);
        let readyCount = 0;

        let readyPlacement: string = '';
        let promiseReadyResolve: any = null;
        const promiseReady = new Promise(resolve => promiseReadyResolve = resolve);

        const listener: IUnityAdsListener = {
            onUnityAdsReady: (placement: string) => {
                readyPlacement = placement;
                readyCount++;
                if(promiseReadyResolve) {
                    promiseReadyResolve();
                    promiseReadyResolve = null;
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
        UnityAds.getBackend().Api.Request.setPassthrough(true);

        UnityAds.getBackend().Api.DeviceInfo.setAdvertisingTrackingId('78db88cb-2026-4423-bfe0-07e9ed2701c3');
        UnityAds.getBackend().Api.DeviceInfo.setManufacturer('LGE');
        UnityAds.getBackend().Api.DeviceInfo.setModel('Nexus 5');
        UnityAds.getBackend().Api.DeviceInfo.setOsVersion('6.0.1');
        UnityAds.getBackend().Api.DeviceInfo.setScreenWidth(1080);
        UnityAds.getBackend().Api.DeviceInfo.setScreenHeight(1776);
        UnityAds.getBackend().Api.DeviceInfo.setTimeZone('GMT+02:00');
        UnityAds.getBackend().Api.Sdk.setInitTimeStamp(Date.now());

        ConfigManager.setAbGroup(14);
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
            assert.equal(readyCount, 1);
            assert.equal(readyPlacement, 'rewardedVideo');
        });
    });

    it('should handle happy path on Android with Load API, ready called twice for same placement', function(this: Mocha.ITestCallbackContext): Promise<any> {
        this.timeout(10000);

        let stateChangeCount = 0;
        let readyPlacement: string[] = [];
        let promiseReadyResolve: any = null;
        const promiseReady = new Promise(resolve => promiseReadyResolve = resolve);

        const listener: IUnityAdsListener = {
            onUnityAdsReady: (placement: string) => {
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

        ConfigManager.setAbGroup(14);
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
