import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { NativeBridge } from 'Common/Native/NativeBridge';
import { Platform } from 'Common/Constants/Platform';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { TestAdUnit } from 'TestHelpers/TestAdUnit';
import { UIInterfaceOrientationMask } from 'Common/Constants/iOS/UIInterfaceOrientationMask';
import {
    AdUnitContainerSystemMessage,
    IAdUnitContainerListener,
    Orientation,
    ViewConfiguration
} from 'Ads/AdUnits/Containers/AdUnitContainer';
import { ViewController } from 'Ads/AdUnits/Containers/ViewController';
import { FocusManager } from 'Core/Managers/FocusManager';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { Request } from 'Core/Utilities/Request';
import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { PerformanceCampaign } from 'Ads/Models/Campaigns/PerformanceCampaign';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { GdprManager } from 'Ads/Managers/GdprManager';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';

describe('IosAdUnitTest', () => {
    let nativeBridge: NativeBridge;
    let container: ViewController;
    let testAdUnit: TestAdUnit;
    let focusManager: FocusManager;
    let adUnitParams: IAdUnitParameters<PerformanceCampaign>;

    const defaultOptions: any = {
        supportedOrientations: UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_ALL,
        supportedOrientationsPlist: UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_ALL,
        shouldAutorotate: true,
        statusBarOrientation: 4, // landscape left
        statusBarHidden: false
    };

    beforeEach(() => {
        nativeBridge = TestFixtures.getNativeBridge(Platform.IOS);
        const clientInfo = TestFixtures.getClientInfo();
        focusManager = new FocusManager(nativeBridge);
        const metaDataManager = new MetaDataManager(nativeBridge);
        const wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
        const request = new Request(nativeBridge, wakeUpManager);
        const thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
        const sessionManager = new SessionManager(nativeBridge, request);
        const deviceInfo = TestFixtures.getIosDeviceInfo();
        container = new ViewController(nativeBridge, TestFixtures.getIosDeviceInfo(), focusManager, clientInfo);
        const campaign = TestFixtures.getCampaign();
        const configuration = TestFixtures.getConfiguration();
        const gdprManager = sinon.createStubInstance(GdprManager);
        const programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);
        const operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager({
            nativeBridge: nativeBridge,
            request: request,
            metaDataManager: metaDataManager,
            sessionManager: sessionManager,
            clientInfo: clientInfo,
            deviceInfo: deviceInfo,
            configuration: configuration,
            campaign: campaign
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
            campaign: campaign,
            configuration: configuration,
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
            stub = sinon.stub(nativeBridge.IosAdUnit, 'open').returns(Promise.resolve());
        });

        it('with all options true', () => {
            return container.open(testAdUnit, ['videoplayer', 'webview'], true, Orientation.LANDSCAPE, true, true, true, true, defaultOptions).then(() => {
                sinon.assert.calledWith(<sinon.SinonSpy>stub, ['videoplayer', 'webview'], UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE_LEFT, false, true, true, true);
                return;
            });
        });

        it('with all options false', () => {
            return container.open(testAdUnit, ['webview'], false, Orientation.NONE, false, false, false, false, defaultOptions).then(() => {
                sinon.assert.calledWith(<sinon.SinonSpy>stub, ['webview'], UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_ALL, true, false, false, false);
                return;
            });
        });
    });

    it('should close ad unit', () => {
        nativeBridge = TestFixtures.getNativeBridge(Platform.IOS);
        focusManager = new FocusManager(nativeBridge);
        container = new ViewController(nativeBridge, TestFixtures.getIosDeviceInfo(), focusManager, TestFixtures.getClientInfo());
        const stub = sinon.stub(nativeBridge.IosAdUnit, 'close').returns(Promise.resolve());

        return container.close().then(() => {
            sinon.assert.calledOnce(<sinon.SinonSpy>stub);
            return;
        });
    });

    // note: when reconfigure method is enhanced with some actual parameters, this test needs to be refactored
    it('should reconfigure ad unit', () => {
        nativeBridge = TestFixtures.getNativeBridge(Platform.IOS);
        container = new ViewController(nativeBridge, TestFixtures.getIosDeviceInfo(), focusManager, TestFixtures.getClientInfo());

        const stubViews = sinon.stub(nativeBridge.IosAdUnit, 'setViews').returns(Promise.resolve());
        const stubOrientation = sinon.stub(nativeBridge.IosAdUnit, 'setSupportedOrientations').returns(Promise.resolve());

        return container.reconfigure(ViewConfiguration.ENDSCREEN).then(() => {
            sinon.assert.calledWith(<sinon.SinonSpy>stubViews, ['webview']);
            sinon.assert.calledWith(<sinon.SinonSpy>stubOrientation, UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_ALL);
            return;
        });
    });

    it('should trigger onShow', () => {
        testAdUnit = new TestAdUnit(nativeBridge, adUnitParams);
        sinon.stub(nativeBridge.IosAdUnit, 'open').returns(Promise.resolve());

        let onShowTriggered: boolean = false;
        const listener: IAdUnitContainerListener = {
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
            onContainerSystemMessage: (message: AdUnitContainerSystemMessage) => {
                // EMPTY
            }
        };

        container.addEventHandler(listener);

        return container.open(testAdUnit, ['videoplayer', 'webview'], true, Orientation.LANDSCAPE, true, false, true, false, defaultOptions).then(() => {
            nativeBridge.IosAdUnit.onViewControllerDidAppear.trigger();
            assert.isTrue(onShowTriggered, 'onShow was not triggered with onViewControllerDidAppear');
            return;
        });
    });

    describe('should handle iOS notifications', () => {
        let onContainerSystemMessage: boolean;
        let onContainerVisibilityChanged: boolean;

        beforeEach(() => {
            const listener: IAdUnitContainerListener = {
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
                onContainerSystemMessage: (message: AdUnitContainerSystemMessage) => {
                    onContainerSystemMessage = true;
                }
            };
            testAdUnit = new TestAdUnit(nativeBridge, adUnitParams);
            sinon.stub(nativeBridge.IosAdUnit, 'open').returns(Promise.resolve());
            onContainerSystemMessage = false;
            onContainerVisibilityChanged = false;
            container.addEventHandler(listener);
        });

        it('with application did become active', () => {
            return container.open(testAdUnit, ['videoplayer', 'webview'], true, Orientation.LANDSCAPE, true, false, true, false, defaultOptions).then(() => {
                nativeBridge.Notification.onNotification.trigger('UIApplicationDidBecomeActiveNotification', {});
                assert.isTrue(onContainerVisibilityChanged, 'onContainerBackground or onContainerForeground was not triggered with UIApplicationDidBecomeActiveNotification');
                return;
            });
        });

        it('with audio session interrupt', () => {
            return container.open(testAdUnit, ['videoplayer', 'webview'], true, Orientation.LANDSCAPE, true, false, true, false, defaultOptions).then(() => {
                nativeBridge.Notification.onNotification.trigger('AVAudioSessionInterruptionNotification', { AVAudioSessionInterruptionTypeKey: 0, AVAudioSessionInterruptionOptionKey: 1 });
                assert.isTrue(onContainerSystemMessage, 'onContainerSystemMessage was not triggered with AVAudioSessionInterruptionNotification');
                return;
            });
        });

        it('with audio session route change', () => {
            return container.open(testAdUnit, ['videoplayer', 'webview'], true, Orientation.LANDSCAPE, true, false, true, false, defaultOptions).then(() => {
                nativeBridge.Notification.onNotification.trigger('AVAudioSessionRouteChangeNotification', {});
                assert.isTrue(onContainerSystemMessage, 'onContainerSystemMessage was not triggered with AVAudioSessionRouteChangeNotification');
                return;
            });
        });
    });
});
