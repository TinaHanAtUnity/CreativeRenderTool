import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { NativeBridge } from 'Native/NativeBridge';
import { Platform } from 'Constants/Platform';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { TestAdUnit } from '../TestHelpers/TestAdUnit';
import { ScreenOrientation } from 'Constants/Android/ScreenOrientation';
import { KeyCode } from 'Constants/Android/KeyCode';
import { SystemUiVisibility } from 'Constants/Android/SystemUiVisibility';
import { Activity } from 'AdUnits/Containers/Activity';
import { ForceOrientation, ViewConfiguration } from 'AdUnits/Containers/AdUnitContainer';

describe('AndroidAdUnitTest', () => {
    let nativeBridge: NativeBridge;
    let container: Activity;
    let testAdUnit: TestAdUnit;

    describe('should open ad unit', () => {
        let stub: any;

        beforeEach(() => {
            nativeBridge = TestFixtures.getNativeBridge(Platform.ANDROID);
            container = new Activity(nativeBridge, TestFixtures.getDeviceInfo(Platform.ANDROID));
            testAdUnit = new TestAdUnit(nativeBridge, container, TestFixtures.getPlacement(), TestFixtures.getCampaign());
            sinon.stub(nativeBridge.Sdk, 'logInfo').returns(Promise.resolve());
            stub = sinon.stub(nativeBridge.AndroidAdUnit, 'open').returns(Promise.resolve());
        });

        it('with all options true', () => {
            return container.open(testAdUnit, true, true, ForceOrientation.LANDSCAPE, true, false, true, true, { requestedOrientation: ScreenOrientation.SCREEN_ORIENTATION_UNSPECIFIED }).then(() => {
                sinon.assert.calledWith(<sinon.SinonSpy>stub, 1, ['videoplayer', 'webview'], ScreenOrientation.SCREEN_ORIENTATION_SENSOR_LANDSCAPE, [KeyCode.BACK], SystemUiVisibility.LOW_PROFILE, true);
                return;
            });
        });

        it('with all options false', () => {
            nativeBridge.setApiLevel(16); // act like Android 4.1, hw acceleration should be disabled
            return container.open(testAdUnit, false, false, ForceOrientation.NONE, false, false, true, true, { requestedOrientation: ScreenOrientation.SCREEN_ORIENTATION_SENSOR_LANDSCAPE }).then(() => {
                sinon.assert.calledWith(<sinon.SinonSpy>stub, 1, ['webview'], ScreenOrientation.SCREEN_ORIENTATION_LOCKED, [], SystemUiVisibility.LOW_PROFILE, false);
                return;
            });
        });
    });

    it('should close ad unit', () => {
        nativeBridge = TestFixtures.getNativeBridge(Platform.ANDROID);
        container = new Activity(nativeBridge, TestFixtures.getDeviceInfo(Platform.ANDROID));
        const stub = sinon.stub(nativeBridge.AndroidAdUnit, 'close').returns(Promise.resolve());

        return container.close().then(() => {
            sinon.assert.calledOnce(<sinon.SinonSpy>stub);
            return;
        });
    });

    // note: when reconfigure method is enhanced with some actual parameters, this test needs to be refactored
    it('should reconfigure ad unit', () => {
        nativeBridge = TestFixtures.getNativeBridge(Platform.ANDROID);
        container = new Activity(nativeBridge, TestFixtures.getDeviceInfo(Platform.ANDROID));

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
            nativeBridge = TestFixtures.getNativeBridge(Platform.ANDROID);
            container = new Activity(nativeBridge, TestFixtures.getDeviceInfo(Platform.ANDROID));
            testAdUnit = new TestAdUnit(nativeBridge, container, TestFixtures.getPlacement(), TestFixtures.getCampaign());
            sinon.stub(nativeBridge.AndroidAdUnit, 'open').returns(Promise.resolve());
            options = { requestedOrientation: ScreenOrientation.SCREEN_ORIENTATION_UNSPECIFIED };
        });

        it('with onResume', () => {
            let onShowTriggered: boolean = false;
            container.onShow.subscribe(() => { onShowTriggered = true; });

            return container.open(testAdUnit, true, true, ForceOrientation.LANDSCAPE, true, false, true, true, options).then(() => {
                nativeBridge.AndroidAdUnit.onResume.trigger(1);
                assert.isTrue(onShowTriggered, 'onShow was not triggered when invoking onResume');
                return;
            });
        });

        it('with onPause', () => {
            let onSystemKillTriggered: boolean = false;
            container.onSystemKill.subscribe(() => { onSystemKillTriggered = true; });

            return container.open(testAdUnit, true, true, ForceOrientation.LANDSCAPE, true, false, true, true, options).then(() => {
                nativeBridge.AndroidAdUnit.onPause.trigger(true, 1);
                assert.isTrue(onSystemKillTriggered, 'onSystemKill was not triggered when invoking onPause with finishing true');
                return;
            });
        });

        it('with onDestroy', () => {
            let onSystemKillTriggered: boolean = false;
            container.onSystemKill.subscribe(() => { onSystemKillTriggered = true; });

            return container.open(testAdUnit, true, true, ForceOrientation.LANDSCAPE, true, false, true, true, options).then(() => {
                nativeBridge.AndroidAdUnit.onDestroy.trigger(true, 1);
                assert.isTrue(onSystemKillTriggered, 'onSystemKill was not triggered when invoking onDestroy with finishing true');
                return;
            });
        });
    });
});
