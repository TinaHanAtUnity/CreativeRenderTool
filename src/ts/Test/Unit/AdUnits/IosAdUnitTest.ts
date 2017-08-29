import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { NativeBridge } from 'Native/NativeBridge';
import { Platform } from 'Constants/Platform';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { TestAdUnit } from '../TestHelpers/TestAdUnit';
import { UIInterfaceOrientationMask } from 'Constants/iOS/UIInterfaceOrientationMask';
import { ForceOrientation, ViewConfiguration } from 'AdUnits/Containers/AdUnitContainer';
import { ViewController } from 'AdUnits/Containers/ViewController';
import { FocusManager } from 'Managers/FocusManager';

describe('IosAdUnitTest', () => {
    let nativeBridge: NativeBridge;
    let container: ViewController;
    let testAdUnit: TestAdUnit;
    let focusManager: FocusManager;

    const defaultOptions: any = {
        supportedOrientations: UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_ALL,
        supportedOrientationsPlist: UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_ALL,
        shouldAutorotate: true,
        statusBarOrientation: 1,
        statusBarHidden: false
    };

    describe('should open ad unit', () => {
        let stub: any;

        beforeEach(() => {
            nativeBridge = TestFixtures.getNativeBridge(Platform.IOS);
            focusManager = new FocusManager(nativeBridge);
            container = new ViewController(nativeBridge, TestFixtures.getDeviceInfo(Platform.IOS), focusManager);
            testAdUnit = new TestAdUnit(nativeBridge, container, TestFixtures.getPlacement(), TestFixtures.getCampaign());
            sinon.stub(nativeBridge.Sdk, 'logInfo').returns(Promise.resolve());
            stub = sinon.stub(nativeBridge.IosAdUnit, 'open').returns(Promise.resolve());
        });

        it('with all options true', () => {
            return container.open(testAdUnit, true, true, ForceOrientation.LANDSCAPE, true, true, true, true, defaultOptions).then(() => {
                sinon.assert.calledWith(<sinon.SinonSpy>stub, ['videoplayer', 'webview'], UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE, false, true, true, true);
                return;
            });
        });

        it('with all options false', () => {
            return container.open(testAdUnit, false, false, ForceOrientation.NONE, false, false, false, false, defaultOptions).then(() => {
                sinon.assert.calledWith(<sinon.SinonSpy>stub, ['webview'], UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_ALL, true, false, false, false);
                return;
            });
        });
    });

    it('should close ad unit', () => {
        nativeBridge = TestFixtures.getNativeBridge(Platform.IOS);
        focusManager = new FocusManager(nativeBridge);
        container = new ViewController(nativeBridge, TestFixtures.getDeviceInfo(Platform.IOS), focusManager);
        const stub = sinon.stub(nativeBridge.IosAdUnit, 'close').returns(Promise.resolve());

        return container.close().then(() => {
            sinon.assert.calledOnce(<sinon.SinonSpy>stub);
            return;
        });
    });

    // note: when reconfigure method is enhanced with some actual parameters, this test needs to be refactored
    it('should reconfigure ad unit', () => {
        nativeBridge = TestFixtures.getNativeBridge(Platform.IOS);
        container = new ViewController(nativeBridge, TestFixtures.getDeviceInfo(Platform.IOS), focusManager);

        const stubViews = sinon.stub(nativeBridge.IosAdUnit, 'setViews').returns(Promise.resolve());
        const stubOrientation = sinon.stub(nativeBridge.IosAdUnit, 'setSupportedOrientations').returns(Promise.resolve());

        return container.reconfigure(ViewConfiguration.ENDSCREEN).then(() => {
            sinon.assert.calledWith(<sinon.SinonSpy>stubViews, ['webview']);
            sinon.assert.calledWith(<sinon.SinonSpy>stubOrientation, UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_ALL);
            return;
        });
    });

    it('should trigger onShow', () => {
        nativeBridge = TestFixtures.getNativeBridge(Platform.IOS);
        focusManager = new FocusManager(nativeBridge);
        container = new ViewController(nativeBridge, TestFixtures.getDeviceInfo(Platform.IOS), focusManager);
        testAdUnit = new TestAdUnit(nativeBridge, container, TestFixtures.getPlacement(), TestFixtures.getCampaign());
        sinon.stub(nativeBridge.IosAdUnit, 'open').returns(Promise.resolve());

        let onShowTriggered: boolean = false;
        container.onShow.subscribe(() => { onShowTriggered = true; });

        return container.open(testAdUnit, true, true, ForceOrientation.LANDSCAPE, true, false, true, false, defaultOptions).then(() => {
            nativeBridge.IosAdUnit.onViewControllerDidAppear.trigger();
            assert.isTrue(onShowTriggered, 'onShow was not triggered with onViewControllerDidAppear');
            return;
        });
    });

    describe('should handle iOS notifications', () => {
        let onSystemInterruptTriggered: boolean;

        beforeEach(() => {
            nativeBridge = TestFixtures.getNativeBridge(Platform.IOS);
            focusManager = new FocusManager(nativeBridge);
            container = new ViewController(nativeBridge, TestFixtures.getDeviceInfo(Platform.IOS), focusManager);
            testAdUnit = new TestAdUnit(nativeBridge, container, TestFixtures.getPlacement(), TestFixtures.getCampaign());
            sinon.stub(nativeBridge.IosAdUnit, 'open').returns(Promise.resolve());
            onSystemInterruptTriggered = false;
            container.onSystemInterrupt.subscribe(() => { onSystemInterruptTriggered = true; });
        });

        it('with application did become active', () => {
            return container.open(testAdUnit, true, true, ForceOrientation.LANDSCAPE, true, false, true, false, defaultOptions).then(() => {
                nativeBridge.Notification.onNotification.trigger('UIApplicationDidBecomeActiveNotification', {});
                assert.isTrue(onSystemInterruptTriggered, 'onSystemInterrupt was not triggered with UIApplicationDidBecomeActiveNotification');
                return;
            });
        });

        it('with audio session interrupt', () => {
            return container.open(testAdUnit, true, true, ForceOrientation.LANDSCAPE, true, false, true, false, defaultOptions).then(() => {
                nativeBridge.Notification.onNotification.trigger('AVAudioSessionInterruptionNotification', { AVAudioSessionInterruptionTypeKey: 0, AVAudioSessionInterruptionOptionKey: 1 });
                assert.isTrue(onSystemInterruptTriggered, 'onSystemInterrupt was not triggered with AVAudioSessionInterruptionNotification');
                return;
            });
        });

        it('with audio session route change', () => {
            return container.open(testAdUnit, true, true, ForceOrientation.LANDSCAPE, true, false, true, false, defaultOptions).then(() => {
                nativeBridge.Notification.onNotification.trigger('AVAudioSessionRouteChangeNotification', {});
                assert.isTrue(onSystemInterruptTriggered, 'onSystemInterrupt was not triggered with AVAudioSessionRouteChangeNotification');
                return;
            });
        });
    });
});
