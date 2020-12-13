import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { ViewController } from 'Ads/AdUnits/Containers/ViewController';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { assert } from 'chai';
import { UIInterfaceOrientationMask } from 'Core/Constants/iOS/UIInterfaceOrientationMask';
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
describe('IosAdUnitTest', () => {
    let platform;
    let backend;
    let nativeBridge;
    let core;
    let ads;
    let store;
    let container;
    let testAdUnit;
    let focusManager;
    let adUnitParams;
    const defaultOptions = {
        supportedOrientations: UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_ALL,
        supportedOrientationsPlist: UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_ALL,
        shouldAutorotate: true,
        statusBarOrientation: 4,
        statusBarHidden: false
    };
    beforeEach(() => {
        platform = Platform.IOS;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        ads = TestFixtures.getAdsApi(nativeBridge);
        store = TestFixtures.getStoreApi(nativeBridge);
        const storageBridge = new StorageBridge(core);
        const clientInfo = TestFixtures.getClientInfo();
        focusManager = new FocusManager(platform, core);
        const metaDataManager = new MetaDataManager(core);
        const wakeUpManager = new WakeUpManager(core);
        const request = new RequestManager(platform, core, wakeUpManager);
        const thirdPartyEventManager = new ThirdPartyEventManager(core, request);
        const sessionManager = new SessionManager(core, request, storageBridge);
        const deviceInfo = TestFixtures.getIosDeviceInfo(core);
        container = new ViewController(core, ads, TestFixtures.getIosDeviceInfo(core), focusManager, clientInfo);
        const campaign = TestFixtures.getCampaign();
        const coreConfig = TestFixtures.getCoreConfiguration();
        const adsConfig = TestFixtures.getAdsConfiguration();
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
            campaign: campaign,
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
            campaign: campaign,
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
            stub = sinon.stub(ads.iOS.AdUnit, 'open').returns(Promise.resolve());
        });
        it('with all options true', () => {
            return container.open(testAdUnit, ['videoplayer', 'webview'], true, Orientation.LANDSCAPE, true, true, true, true, defaultOptions).then(() => {
                sinon.assert.calledWith(stub, ['videoplayer', 'webview'], UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE_LEFT, false, true, true, true);
                return;
            });
        });
        it('with all options false', () => {
            return container.open(testAdUnit, ['webview'], false, Orientation.NONE, false, false, false, false, defaultOptions).then(() => {
                sinon.assert.calledWith(stub, ['webview'], UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_ALL, true, false, false, false);
                return;
            });
        });
    });
    it('should close ad unit', () => {
        container = new ViewController(core, ads, TestFixtures.getIosDeviceInfo(core), focusManager, TestFixtures.getClientInfo());
        const stub = sinon.stub(ads.iOS.AdUnit, 'close').returns(Promise.resolve());
        return container.close().then(() => {
            sinon.assert.calledOnce(stub);
            return;
        });
    });
    // note: when reconfigure method is enhanced with some actual parameters, this test needs to be refactored
    it('should reconfigure ad unit', () => {
        container = new ViewController(core, ads, TestFixtures.getIosDeviceInfo(core), focusManager, TestFixtures.getClientInfo());
        const stubViews = sinon.stub(ads.iOS.AdUnit, 'setViews').returns(Promise.resolve());
        const stubOrientation = sinon.stub(ads.iOS.AdUnit, 'setSupportedOrientations').returns(Promise.resolve());
        return container.reconfigure(0 /* ENDSCREEN */).then(() => {
            sinon.assert.calledWith(stubViews, ['webview']);
            sinon.assert.calledWith(stubOrientation, UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_ALL);
            return;
        });
    });
    it('should trigger onShow', () => {
        testAdUnit = new TestAdUnit(adUnitParams);
        sinon.stub(ads.iOS.AdUnit, 'open').returns(Promise.resolve());
        let onShowTriggered = false;
        const listener = {
            onContainerShow: () => {
                onShowTriggered = true;
            },
            onContainerDestroy: () => {
                // EMPTY
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
        return container.open(testAdUnit, ['videoplayer', 'webview'], true, Orientation.LANDSCAPE, true, false, true, false, defaultOptions).then(() => {
            ads.iOS.AdUnit.onViewControllerDidAppear.trigger();
            assert.isTrue(onShowTriggered, 'onShow was not triggered with onViewControllerDidAppear');
            return;
        });
    });
    describe('should handle iOS notifications', () => {
        let onContainerSystemMessage;
        let onContainerVisibilityChanged;
        beforeEach(() => {
            const listener = {
                onContainerShow: () => {
                    // EMPTY
                },
                onContainerDestroy: () => {
                    // EMPTY
                },
                onContainerBackground: () => {
                    onContainerVisibilityChanged = true;
                },
                onContainerForeground: () => {
                    onContainerVisibilityChanged = true;
                },
                onContainerSystemMessage: (message) => {
                    onContainerSystemMessage = true;
                }
            };
            testAdUnit = new TestAdUnit(adUnitParams);
            sinon.stub(ads.iOS.AdUnit, 'open').returns(Promise.resolve());
            onContainerSystemMessage = false;
            onContainerVisibilityChanged = false;
            container.addEventHandler(listener);
        });
        it('with application did become active', () => {
            return container.open(testAdUnit, ['videoplayer', 'webview'], true, Orientation.LANDSCAPE, true, false, true, false, defaultOptions).then(() => {
                core.iOS.Notification.onNotification.trigger('UIApplicationDidBecomeActiveNotification', {});
                assert.isTrue(onContainerVisibilityChanged, 'onContainerBackground or onContainerForeground was not triggered with UIApplicationDidBecomeActiveNotification');
                return;
            });
        });
        it('with audio session interrupt', () => {
            return container.open(testAdUnit, ['videoplayer', 'webview'], true, Orientation.LANDSCAPE, true, false, true, false, defaultOptions).then(() => {
                core.iOS.Notification.onNotification.trigger('AVAudioSessionInterruptionNotification', { AVAudioSessionInterruptionTypeKey: 0, AVAudioSessionInterruptionOptionKey: 1 });
                assert.isTrue(onContainerSystemMessage, 'onContainerSystemMessage was not triggered with AVAudioSessionInterruptionNotification');
                return;
            });
        });
        it('with audio session route change', () => {
            return container.open(testAdUnit, ['videoplayer', 'webview'], true, Orientation.LANDSCAPE, true, false, true, false, defaultOptions).then(() => {
                core.iOS.Notification.onNotification.trigger('AVAudioSessionRouteChangeNotification', {});
                assert.isTrue(onContainerSystemMessage, 'onContainerSystemMessage was not triggered with AVAudioSessionRouteChangeNotification');
                return;
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW9zQWRVbml0VGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Rlc3QvVW5pdC9BZHMvSW9zQWRVbml0VGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBR0gsV0FBVyxFQUVkLE1BQU0sd0NBQXdDLENBQUM7QUFDaEQsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBRXZFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQ3JFLE9BQU8sRUFBRSw0QkFBNEIsRUFBRSxNQUFNLDJDQUEyQyxDQUFDO0FBQ3pGLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUM3RCxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUU3RSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzlCLE9BQU8sRUFBRSwwQkFBMEIsRUFBRSxNQUFNLCtDQUErQyxDQUFDO0FBQzNGLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUVuRCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDMUQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQ2hFLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUM5RCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFHNUQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzdELE9BQU8sT0FBTyxDQUFDO0FBRWYsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUM7QUFDL0IsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ3BELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUN4RCxPQUFPLEVBQUUs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