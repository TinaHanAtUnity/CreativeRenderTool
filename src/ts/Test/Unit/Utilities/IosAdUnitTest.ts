import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { NativeBridge } from 'Native/NativeBridge';
import { Platform } from 'Constants/Platform';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { TestAdUnit } from "../TestHelpers/TestAdUnit";
import { IosAdUnit } from 'Utilities/IosAdUnit';
import { UIInterfaceOrientationMask } from 'Constants/iOS/UIInterfaceOrientationMask';

describe('IosAdUnitTest', () => {
    let nativeBridge: NativeBridge;
    let adUnit: IosAdUnit;
    let testAdUnit: TestAdUnit;

    const defaultOptions: any = {
        supportedOrientations: UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_ALL,
        supportedOrientationsPlist: UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_ALL,
        shouldAutorotate: true,
        statusBarOrientation: 1
    };

    describe('should open ad unit', () => {
        let stub: any;

        beforeEach(() => {
            nativeBridge = TestFixtures.getNativeBridge(Platform.IOS);
            adUnit = new IosAdUnit(nativeBridge, TestFixtures.getDeviceInfo(Platform.IOS));
            testAdUnit = new TestAdUnit(nativeBridge, adUnit, TestFixtures.getPlacement(), TestFixtures.getCampaign());
            sinon.stub(nativeBridge.Sdk, 'logInfo').returns(Promise.resolve());
            stub = sinon.stub(nativeBridge.IosAdUnit, 'open').returns(Promise.resolve());
        });

        it('with all options true', () => {
            return adUnit.open(testAdUnit, true, true, true, defaultOptions).then(() => {
                sinon.assert.calledWith(<sinon.SinonSpy>stub, ['videoplayer', 'webview'], UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE, true, true);
                return;
            });
        });

        it('with all options false', () => {
            return adUnit.open(testAdUnit, false, false, false, defaultOptions).then(() => {
                sinon.assert.calledWith(<sinon.SinonSpy>stub, ['webview'], UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_ALL, true, true);
                return;
            });
        });
    });

    it('should close ad unit', () => {
        nativeBridge = TestFixtures.getNativeBridge(Platform.IOS);
        adUnit = new IosAdUnit(nativeBridge, TestFixtures.getDeviceInfo(Platform.IOS));
        const stub = sinon.stub(nativeBridge.IosAdUnit, 'close').returns(Promise.resolve());

        return adUnit.close().then(() => {
            sinon.assert.calledOnce(<sinon.SinonSpy>stub);
            return;
        });
    });

    // note: when reconfigure method is enhanced with some actual parameters, this test needs to be refactored
    it('should reconfigure ad unit', () => {
        nativeBridge = TestFixtures.getNativeBridge(Platform.IOS);
        adUnit = new IosAdUnit(nativeBridge, TestFixtures.getDeviceInfo(Platform.IOS));

        const stubViews = sinon.stub(nativeBridge.IosAdUnit, 'setViews').returns(Promise.resolve());
        const stubOrientation = sinon.stub(nativeBridge.IosAdUnit, 'setSupportedOrientations').returns(Promise.resolve());

        return adUnit.reconfigure().then(() => {
            sinon.assert.calledWith(<sinon.SinonSpy>stubViews, ['webview']);
            sinon.assert.calledWith(<sinon.SinonSpy>stubOrientation, UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_ALL);
            return;
        });
    });

    it('should trigger onShow', () => {
        nativeBridge = TestFixtures.getNativeBridge(Platform.IOS);
        adUnit = new IosAdUnit(nativeBridge, TestFixtures.getDeviceInfo(Platform.IOS));
        testAdUnit = new TestAdUnit(nativeBridge, adUnit, TestFixtures.getPlacement(), TestFixtures.getCampaign());
        sinon.stub(nativeBridge.IosAdUnit, 'open').returns(Promise.resolve());

        let onShowTriggered: boolean = false;
        adUnit.onShow.subscribe(() => { onShowTriggered = true; });

        return adUnit.open(testAdUnit, true, true, true, defaultOptions).then(() => {
            nativeBridge.IosAdUnit.onViewControllerDidAppear.trigger();
            assert.isTrue(onShowTriggered, 'onShow was not triggered with onViewControllerDidAppear');
            return;
        });
    });

    describe('should handle iOS notifications', () => {
        let onSystemInterruptTriggered: boolean;

        beforeEach(() => {
            nativeBridge = TestFixtures.getNativeBridge(Platform.IOS);
            adUnit = new IosAdUnit(nativeBridge, TestFixtures.getDeviceInfo(Platform.IOS));
            testAdUnit = new TestAdUnit(nativeBridge, adUnit, TestFixtures.getPlacement(), TestFixtures.getCampaign());
            sinon.stub(nativeBridge.IosAdUnit, 'open').returns(Promise.resolve());
            onSystemInterruptTriggered = false;
            adUnit.onSystemInterrupt.subscribe(() => { onSystemInterruptTriggered = true; });
        });

        it('with application did become active', () => {
            return adUnit.open(testAdUnit, true, true, true, defaultOptions).then(() => {
                nativeBridge.Notification.onNotification.trigger('UIApplicationDidBecomeActiveNotification', {});
                assert.isTrue(onSystemInterruptTriggered, 'onSystemInterrupt was not triggered with UIApplicationDidBecomeActiveNotification');
                return;
            });
        });

        it('with audio session interrupt', () => {
            return adUnit.open(testAdUnit, true, true, true, defaultOptions).then(() => {
                nativeBridge.Notification.onNotification.trigger('AVAudioSessionInterruptionNotification', { AVAudioSessionInterruptionTypeKey: 0, AVAudioSessionInterruptionOptionKey: 1 });
                assert.isTrue(onSystemInterruptTriggered, 'onSystemInterrupt was not triggered with AVAudioSessionInterruptionNotification');
                return;
            });
        });

        it('with audio session route change', () => {
            return adUnit.open(testAdUnit, true, true, true, defaultOptions).then(() => {
                nativeBridge.Notification.onNotification.trigger('AVAudioSessionRouteChangeNotification', {});
                assert.isTrue(onSystemInterruptTriggered, 'onSystemInterrupt was not triggered with AVAudioSessionRouteChangeNotification');
                return;
            });
        });
    });
});
