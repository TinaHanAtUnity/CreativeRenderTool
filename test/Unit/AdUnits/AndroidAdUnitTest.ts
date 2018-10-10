import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { Activity } from 'Ads/AdUnits/Containers/Activity';
import {
    AdUnitContainerSystemMessage,
    IAdUnitContainerListener,
    Orientation,
    ViewConfiguration
} from 'Ads/AdUnits/Containers/AdUnitContainer';
import { GdprManager } from 'Ads/Managers/GdprManager';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { assert } from 'chai';
import { KeyCode } from 'Core/Constants/Android/KeyCode';
import { Rotation } from 'Core/Constants/Android/Rotation';
import { ScreenOrientation } from 'Core/Constants/Android/ScreenOrientation';
import { SystemUiVisibility } from 'Core/Constants/Android/SystemUiVisibility';
import { Platform } from 'Core/Constants/Platform';
import { FocusManager } from 'Core/Managers/FocusManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Request } from 'Core/Utilities/Request';
import 'mocha';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import * as sinon from 'sinon';
import { TestAdUnit } from 'TestHelpers/TestAdUnit';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { StorageBridge } from 'Core/Utilities/StorageBridge';

describe('AndroidAdUnitTest', () => {
    let nativeBridge: NativeBridge;
    let container: Activity;
    let testAdUnit: TestAdUnit;
    let adUnitParams: IAdUnitParameters<PerformanceCampaign>;
    const testDisplay: any = {
        rotation: Rotation.ROTATION_0,
        width: 800,
        height: 600
    };

    beforeEach(() => {
        nativeBridge = TestFixtures.getNativeBridge(Platform.ANDROID);
        const storageBridge = new StorageBridge(nativeBridge);
        const clientInfo = TestFixtures.getClientInfo();
        const focusManager = new FocusManager(nativeBridge);
        const metaDataManager = new MetaDataManager(nativeBridge);
        const wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
        const request = new Request(nativeBridge, wakeUpManager);
        const thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
        const sessionManager = new SessionManager(nativeBridge, request, storageBridge);
        const deviceInfo = TestFixtures.getAndroidDeviceInfo();
        const coreConfig = TestFixtures.getCoreConfiguration();
        const adsConfig = TestFixtures.getAdsConfiguration();
        container = new Activity(nativeBridge, deviceInfo);
        const gdprManager = sinon.createStubInstance(GdprManager);
        const programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);
        const operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager({
            nativeBridge: nativeBridge,
            request: request,
            metaDataManager: metaDataManager,
            sessionManager: sessionManager,
            clientInfo: clientInfo,
            deviceInfo: deviceInfo,
            coreConfig: coreConfig,
            adsConfig: adsConfig,
            storageBridge: storageBridge,
            campaign: TestFixtures.getCampaign()
        });

        adUnitParams = {
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
            gdprManager: gdprManager,
            programmaticTrackingService: programmaticTrackingService
        };
    });

    describe('should open ad unit', () => {
        let stub: any;

        beforeEach(() => {
            testAdUnit = new TestAdUnit(nativeBridge, adUnitParams);
            sinon.stub(nativeBridge.Sdk, 'logInfo').returns(Promise.resolve());
            stub = sinon.stub(nativeBridge.AndroidAdUnit, 'open').returns(Promise.resolve());
        });

        it('with all options true', () => {
            return container.open(testAdUnit, ['videoplayer', 'webview'], true, Orientation.LANDSCAPE, true, true, true, true, { requestedOrientation: ScreenOrientation.SCREEN_ORIENTATION_UNSPECIFIED, display: testDisplay }).then(() => {
                sinon.assert.calledWith(<sinon.SinonSpy>stub, 1, ['videoplayer', 'webview'], ScreenOrientation.SCREEN_ORIENTATION_LANDSCAPE, [KeyCode.BACK], SystemUiVisibility.LOW_PROFILE, true, true);
                return;
            });
        });

        it('with all options false', () => {
            nativeBridge.setApiLevel(16); // act like Android 4.1, hw acceleration should be disabled
            return container.open(testAdUnit, ['webview'], false, Orientation.NONE, false, false, false, false, { requestedOrientation: ScreenOrientation.SCREEN_ORIENTATION_SENSOR_LANDSCAPE, display: testDisplay }).then(() => {
                sinon.assert.calledWith(<sinon.SinonSpy>stub, 1, ['webview'], ScreenOrientation.SCREEN_ORIENTATION_LOCKED, [], SystemUiVisibility.LOW_PROFILE, false, false);
                return;
            });
        });
    });

    it('should close ad unit', () => {
        nativeBridge = TestFixtures.getNativeBridge(Platform.ANDROID);
        container = new Activity(nativeBridge, TestFixtures.getAndroidDeviceInfo());
        const stub = sinon.stub(nativeBridge.AndroidAdUnit, 'close').returns(Promise.resolve());

        return container.close().then(() => {
            sinon.assert.calledOnce(<sinon.SinonSpy>stub);
            return;
        });
    });

    // note: when reconfigure method is enhanced with some actual parameters, this test needs to be refactored
    it('should reconfigure ad unit', () => {
        nativeBridge = TestFixtures.getNativeBridge(Platform.ANDROID);
        container = new Activity(nativeBridge, TestFixtures.getAndroidDeviceInfo());

        const stubViews = sinon.stub(nativeBridge.AndroidAdUnit, 'setViews').returns(Promise.resolve());
        const stubOrientation = sinon.stub(nativeBridge.AndroidAdUnit, 'setOrientation').returns(Promise.resolve());

        return container.reconfigure(ViewConfiguration.ENDSCREEN).then(() => {
            sinon.assert.calledWith(<sinon.SinonSpy>stubViews, ['webview']);
            sinon.assert.calledWith(<sinon.SinonSpy>stubOrientation, ScreenOrientation.SCREEN_ORIENTATION_FULL_SENSOR);
            return;
        });
    });

    describe('should handle Android lifecycle', () => {
        let options: any;

        beforeEach(() => {
            testAdUnit = new TestAdUnit(nativeBridge, adUnitParams);
            sinon.stub(nativeBridge.AndroidAdUnit, 'open').returns(Promise.resolve());
            options = { requestedOrientation: ScreenOrientation.SCREEN_ORIENTATION_UNSPECIFIED, display: testDisplay };
        });

        it('with onResume', () => {
            let onContainerForegroundTriggered: boolean = false;
            const listener: IAdUnitContainerListener = {
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
                onContainerSystemMessage: (message: AdUnitContainerSystemMessage) => {
                    // EMPTY
                }
            };

            container.addEventHandler(listener);

            return container.open(testAdUnit, ['videoplayer', 'webview'], true, Orientation.LANDSCAPE, true, false, true, false, options).then(() => {
                nativeBridge.AndroidAdUnit.onResume.trigger(1);
                assert.isTrue(onContainerForegroundTriggered, 'onContainerForeground was not triggered when invoking onResume');
                return;
            });
        });

        it('with onPause', () => {
            let onContainerDestroyTriggered: boolean = false;
            const listener: IAdUnitContainerListener = {
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
                onContainerSystemMessage: (message: AdUnitContainerSystemMessage) => {
                    // EMPTY
                }
            };

            container.addEventHandler(listener);

            return container.open(testAdUnit, ['videoplayer', 'webview'], true, Orientation.LANDSCAPE, true, false, true, false, options).then(() => {
                nativeBridge.AndroidAdUnit.onPause.trigger(true, 1);
                assert.isTrue(onContainerDestroyTriggered, 'onContainerDestroy was not triggered when invoking onPause with finishing true');
                return;
            });
        });

        it('with onDestroy', () => {
            let onContainerDestroyTriggered: boolean = false;

            const listener: IAdUnitContainerListener = {
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
                onContainerSystemMessage: (message: AdUnitContainerSystemMessage) => {
                    // EMPTY
                }
            };

            container.addEventHandler(listener);

            return container.open(testAdUnit, ['videoplayer', 'webview'], true, Orientation.LANDSCAPE, true, false, true, false, options).then(() => {
                nativeBridge.AndroidAdUnit.onDestroy.trigger(true, 1);
                assert.isTrue(onContainerDestroyTriggered, 'onContainerDestroy was not triggered when invoking onDestroy with finishing true');
                return;
            });
        });
    });
});
