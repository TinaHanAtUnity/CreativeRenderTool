import { Activity } from 'Ads/AdUnits/Containers/Activity';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { assert } from 'chai';
import { Rotation } from 'Core/Constants/Android/Rotation';
import { ScreenOrientation } from 'Core/Constants/Android/ScreenOrientation';
import { Platform } from 'Core/Constants/Platform';
import { FocusManager } from 'Core/Managers/FocusManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { RequestManager } from 'Core/Managers/RequestManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import 'mocha';
import * as sinon from 'sinon';
import { TestAdUnit } from 'TestHelpers/TestAdUnit';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';
import { PrivacySDK } from 'Privacy/PrivacySDK';
describe('AndroidAdUnitTest', () => {
    let platform;
    let backend;
    let nativeBridge;
    let core;
    let ads;
    let store;
    let deviceInfo;
    let container;
    let testAdUnit;
    let adUnitParams;
    const testDisplay = {
        rotation: Rotation.ROTATION_0,
        width: 800,
        height: 600
    };
    beforeEach(() => {
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        ads = TestFixtures.getAdsApi(nativeBridge);
        store = TestFixtures.getStoreApi(nativeBridge);
        const storageBridge = new StorageBridge(core);
        const clientInfo = TestFixtures.getClientInfo();
        const focusManager = new FocusManager(platform, core);
        const metaDataManager = new MetaDataManager(core);
        const wakeUpManager = new WakeUpManager(core);
        const request = new RequestManager(platform, core, wakeUpManager);
        const thirdPartyEventManager = new ThirdPartyEventManager(core, request);
        const sessionManager = new SessionManager(core, request, storageBridge);
        deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
        const coreConfig = TestFixtures.getCoreConfiguration();
        const adsConfig = TestFixtures.getAdsConfiguration();
        container = new Activity(core, ads, deviceInfo);
        const privacyManager = sinon.createStubInstance(UserPrivacyManager);
        const privacy = sinon.createStubInstance(AbstractPrivacy);
        const privacySDK = sinon.createStubInstance(PrivacySDK);
        const operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager({
            platform,
            core,
            ads,
            request: request,
            metaDataManager: metaDataManager,
            sessionManager: sessionManager,
            clientInfo: clientInfo,
            deviceInfo: deviceInfo,
            coreConfig: coreConfig,
            adsConfig: adsConfig,
            storageBridge: storageBridge,
            campaign: TestFixtures.getCampaign(),
            playerMetadataServerId: 'test-gamerSid',
            privacySDK: privacySDK,
            userPrivacyManager: privacyManager
        });
        adUnitParams = {
            platform,
            core,
            ads,
            store,
            forceOrientation: Orientation.NONE,
            focusManager: focusManager,
            container: container,
            deviceInfo: deviceInfo,
            clientInfo: clientInfo,
            thirdPartyEventManager: thirdPartyEventManager,
            operativeEventManager: operativeEventManager,
            placement: TestFixtures.getPlacement(),
            campaign: TestFixtures.getCampaign(),
            coreConfig: coreConfig,
            adsConfig: adsConfig,
            request: request,
            options: {},
            privacyManager: privacyManager,
            privacy: privacy,
            privacySDK: privacySDK
        };
    });
    describe('should open ad unit', () => {
        let stub;
        beforeEach(() => {
            testAdUnit = new TestAdUnit(adUnitParams);
            sinon.stub(core.Sdk, 'logInfo').returns(Promise.resolve());
            stub = sinon.stub(ads.Android.AdUnit, 'open').returns(Promise.resolve());
        });
        it('with all options true', () => {
            return container.open(testAdUnit, ['videoplayer', 'webview'], true, Orientation.LANDSCAPE, true, true, true, true, { requestedOrientation: ScreenOrientation.SCREEN_ORIENTATION_UNSPECIFIED, display: testDisplay }).then(() => {
                sinon.assert.calledWith(stub, 1, ['videoplayer', 'webview'], ScreenOrientation.SCREEN_ORIENTATION_LANDSCAPE, [4 /* BACK */], 1 /* LOW_PROFILE */, true, true);
                return;
            });
        });
        it('with all options false', () => {
            sinon.stub(deviceInfo, 'getApiLevel').returns(16); // act like Android 4.1, hw acceleration should be disabled
            return container.open(testAdUnit, ['webview'], false, Orientation.NONE, false, false, false, false, { requestedOrientation: ScreenOrientation.SCREEN_ORIENTATION_SENSOR_LANDSCAPE, display: testDisplay }).then(() => {
                sinon.assert.calledWith(stub, 1, ['webview'], ScreenOrientation.SCREEN_ORIENTATION_LOCKED, [], 1 /* LOW_PROFILE */, false, false);
                return;
            });
        });
    });
    it('should close ad unit', () => {
        container = new Activity(core, ads, TestFixtures.getAndroidDeviceInfo(core));
        const stub = sinon.stub(ads.Android.AdUnit, 'close').returns(Promise.resolve());
        return container.close().then(() => {
            sinon.assert.calledOnce(stub);
            return;
        });
    });
    // note: when reconfigure method is enhanced with some actual parameters, this test needs to be refactored
    it('should reconfigure ad unit', () => {
        container = new Activity(core, ads, TestFixtures.getAndroidDeviceInfo(core));
        const stubViews = sinon.stub(ads.Android.AdUnit, 'setViews').returns(Promise.resolve());
        const stubOrientation = sinon.stub(ads.Android.AdUnit, 'setOrientation').returns(Promise.resolve());
        return container.reconfigure(0 /* ENDSCREEN */).then(() => {
            sinon.assert.calledWith(stubViews, ['webview']);
            sinon.assert.calledWith(stubOrientation, ScreenOrientation.SCREEN_ORIENTATION_FULL_SENSOR);
            return;
        });
    });
    describe('should handle Android lifecycle', () => {
        let options;
        beforeEach(() => {
            testAdUnit = new TestAdUnit(adUnitParams);
            sinon.stub(ads.Android.AdUnit, 'open').returns(Promise.resolve());
            options = { requestedOrientation: ScreenOrientation.SCREEN_ORIENTATION_UNSPECIFIED, display: testDisplay };
        });
        it('with onResume', () => {
            let onContainerForegroundTriggered = false;
            const listener = {
                onContainerShow: () => {
                    // EMPTY
                },
                onContainerDestroy: () => {
                    // EMPTY
                },
                onContainerBackground: () => {
                    // EMPTY
                },
                onContainerForeground: () => {
                    onContainerForegroundTriggered = true;
                },
                onContainerSystemMessage: (message) => {
                    // EMPTY
                }
            };
            container.addEventHandler(listener);
            return container.open(testAdUnit, ['videoplayer', 'webview'], true, Orientation.LANDSCAPE, true, false, true, false, options).then(() => {
                ads.Android.AdUnit.onResume.trigger(1);
                assert.isTrue(onContainerForegroundTriggered, 'onContainerForeground was not triggered when invoking onResume');
                return;
            });
        });
        it('with onPause', () => {
            let onContainerDestroyTriggered = false;
            const listener = {
                onContainerShow: () => {
                    // EMPTY
                },
                onContainerDestroy: () => {
                    onContainerDestroyTriggered = true;
                },
                onContainerBackground: () => {
                    // EMPTY
                },
                onContainerForeground: () => {
                    // EMPTY
                },
                onContainerSystemMessage: (message) => {
                    // EMPTY
                }
            };
            container.addEventHandler(listener);
            return container.open(testAdUnit, ['videoplayer', 'webview'], true, Orientation.LANDSCAPE, true, false, true, false, options).then(() => {
                ads.Android.AdUnit.onPause.trigger(true, 1);
                assert.isTrue(onContainerDestroyTriggered, 'onContainerDestroy was not triggered when invoking onPause with finishing true');
                return;
            });
        });
        it('with onDestroy', () => {
            let onContainerDestroyTriggered = false;
            const listener = {
                onContainerShow: () => {
                    // EMPTY
                },
                onContainerDestroy: () => {
                    onContainerDestroyTriggered = true;
                },
                onContainerBackground: () => {
                    // EMPTY
                },
                onContainerForeground: () => {
                    // EMPTY
                },
                onContainerSystemMessage: (message) => {
                    // EMPTY
                }
            };
            container.addEventHandler(listener);
            return container.open(testAdUnit, ['videoplayer', 'webview'], true, Orientation.LANDSCAPE, true, false, true, false, options).then(() => {
                ads.Android.AdUnit.onDestroy.trigger(true, 1);
                assert.isTrue(onContainerDestroyTriggered, 'onContainerDestroy was not triggered when invoking onDestroy with finishing true');
                return;
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQW5kcm9pZEFkVW5pdFRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90ZXN0L1VuaXQvQWRzL0FuZHJvaWRBZFVuaXRUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUMzRCxPQUFPLEVBR0gsV0FBVyxFQUVkLE1BQU0sd0NBQXdDLENBQUM7QUFFaEQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDckUsT0FBTyxFQUFFLDRCQUE0QixFQUFFLE1BQU0sMkNBQTJDLENBQUM7QUFDekYsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQzdELE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBRTdFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFFOUIsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQzNELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDBDQUEwQyxDQUFDO0FBRTdFLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUVuRCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDMUQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQ2hFLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUM5RCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFJNUQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzdELE9BQU8sT0FBTyxDQUFDO0FBRWYsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUM7QUFDL0IsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ3BELE9B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