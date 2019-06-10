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
import { StorageType, StorageEvent } from 'Core/Native/Storage';
import { ILoadEvent } from 'Ads/Managers/LoadManager';

describe('AndroidIntegrationTest', () => {
    const sandbox = sinon.createSandbox();

    beforeEach(() => {
        fakeARUtils(sandbox);
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

        UnityAds.getBackend().Api.Storage.set(StorageType.PUBLIC, 'mediation.enable_metadata_load.value', true);
        const loadEvent: ILoadEvent = {
            value: 'video',
            ts: Date.now()
        };
        UnityAds.getBackend().Api.Storage.set(StorageType.PUBLIC, 'load.1', loadEvent);

        UnityAds.initialize(Platform.ANDROID, '2988443', listener, true);

        return promiseReady.then(() => {
            chai.assert.equal(readyCount, 1);
            chai.assert.equal(readyPlacement, 'video');
        }).then(() => UnityAds.getBackend().Api.Storage.getKeys(StorageType.PUBLIC, 'load', false)).then((keys) => {
            chai.assert.equal(keys.length, 0);
        });
    });

    it('should handle happy path on Android with Load API, should ignore old requests', function(this: Mocha.ITestCallbackContext): Promise<any> {
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

        UnityAds.getBackend().Api.Storage.set(StorageType.PUBLIC, 'mediation.enable_metadata_load.value', true);
        const loadEventPremium: ILoadEvent = {
            value: 'premium',
            ts: Date.now()
        };
        const loadEventVideo: ILoadEvent = {
            value: 'video',
            ts: Date.now() - 600000
        };
        UnityAds.getBackend().Api.Storage.set(StorageType.PUBLIC, 'load.1', loadEventPremium);
        UnityAds.getBackend().Api.Storage.set(StorageType.PUBLIC, 'load.2', loadEventVideo);

        UnityAds.initialize(Platform.ANDROID, '2988443', listener, true);

        return promiseReady.then(() => {
            chai.assert.equal(readyCount, 1);
            chai.assert.equal(readyPlacement, 'premium');
        }).then(() => UnityAds.getBackend().Api.Storage.getKeys(StorageType.PUBLIC, 'load', false)).then((keys) => {
            chai.assert.equal(keys.length, 0);
        });
    });

    it('should handle happy path on Android with Load API, should do nothing', function(this: Mocha.ITestCallbackContext): Promise<any> {
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

        UnityAds.getBackend().Api.Storage.set(StorageType.PUBLIC, 'mediation.enable_metadata_load.value', true);

        UnityAds.initialize(Platform.ANDROID, '2988443', listener, true);

        return new Promise(resolve => setTimeout(resolve, 5000)).then(() => {
            chai.assert.equal(readyCount, 0);
        }).then(() => UnityAds.getBackend().Api.Storage.getKeys(StorageType.PUBLIC, 'load', false)).then((keys) => {
            chai.assert.equal(keys.length, 0);
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

        UnityAds.getBackend().Api.Storage.set(StorageType.PUBLIC, 'mediation.enable_metadata_load.value', true);

        UnityAds.initialize(Platform.ANDROID, '2988443', listener, true);

        return new Promise(resolve => setTimeout(resolve, 2000)).then(() => {
            const loadEvent: ILoadEvent = {
                value: 'rewardedVideo',
                ts: Date.now()
            };
            UnityAds.getBackend().Api.Storage.set(StorageType.PUBLIC, 'load.test', loadEvent);
            UnityAds.getBackend().sendEvent('STORAGE', StorageEvent[StorageEvent.SET], 'load', {load: {test: loadEvent}});
        }).then(() => promiseReady).then(() => {
            chai.assert.equal(readyCount, 1);
            chai.assert.equal(readyPlacement, 'rewardedVideo');
        }).then(() => UnityAds.getBackend().Api.Storage.getKeys(StorageType.PUBLIC, 'load', false)).then((keys) => {
            chai.assert.equal(keys.length, 0);
        });
    });

});
