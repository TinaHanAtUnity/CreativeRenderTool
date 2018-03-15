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
import { Rotation } from 'Constants/Android/Rotation';
import { IAdUnitParameters } from 'AdUnits/AbstractAdUnit';
import { PerformanceCampaign } from 'Models/Campaigns/PerformanceCampaign';
import { FocusManager } from 'Managers/FocusManager';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { SessionManager } from 'Managers/SessionManager';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { Request } from 'Utilities/Request';
import { ComScoreTrackingService } from 'Utilities/ComScoreTrackingService';
import { OperativeEventManagerFactory } from 'Managers/OperativeEventManagerFactory';

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
        const clientInfo = TestFixtures.getClientInfo();
        const focusManager = new FocusManager(nativeBridge);
        const metaDataManager = new MetaDataManager(nativeBridge);
        const wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
        const request = new Request(nativeBridge, wakeUpManager);
        const thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
        const sessionManager = new SessionManager(nativeBridge, request);
        const deviceInfo = TestFixtures.getAndroidDeviceInfo();
        container = new Activity(nativeBridge, deviceInfo);
        const operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager({
            nativeBridge: nativeBridge,
            request: request,
            metaDataManager: metaDataManager,
            sessionManager: sessionManager,
            clientInfo: clientInfo,
            deviceInfo: deviceInfo,
            campaign: TestFixtures.getCampaign()
        });
        const comScoreService = new ComScoreTrackingService(thirdPartyEventManager, nativeBridge, deviceInfo);

        adUnitParams = {
            forceOrientation: ForceOrientation.NONE,
            focusManager: focusManager,
            container: container,
            deviceInfo: deviceInfo,
            clientInfo: clientInfo,
            thirdPartyEventManager: thirdPartyEventManager,
            operativeEventManager: operativeEventManager,
            comScoreTrackingService: comScoreService,
            placement: TestFixtures.getPlacement(),
            campaign: TestFixtures.getCampaign(),
            configuration: TestFixtures.getConfiguration(),
            request: request,
            options: {}
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
            return container.open(testAdUnit, ['videoplayer', 'webview'], true, ForceOrientation.LANDSCAPE, true, true, true, true, { requestedOrientation: ScreenOrientation.SCREEN_ORIENTATION_UNSPECIFIED, display: testDisplay }).then(() => {
                sinon.assert.calledWith(<sinon.SinonSpy>stub, 1, ['videoplayer', 'webview'], ScreenOrientation.SCREEN_ORIENTATION_LANDSCAPE, [KeyCode.BACK], SystemUiVisibility.LOW_PROFILE, true, true);
                return;
            });
        });

        it('with all options false', () => {
            nativeBridge.setApiLevel(16); // act like Android 4.1, hw acceleration should be disabled
            return container.open(testAdUnit, ['webview'], false, ForceOrientation.NONE, false, false, false, false, { requestedOrientation: ScreenOrientation.SCREEN_ORIENTATION_SENSOR_LANDSCAPE, display: testDisplay }).then(() => {
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
            let onShowTriggered: boolean = false;
            container.onShow.subscribe(() => { onShowTriggered = true; });

            return container.open(testAdUnit, ['videoplayer', 'webview'], true, ForceOrientation.LANDSCAPE, true, false, true, false, options).then(() => {
                nativeBridge.AndroidAdUnit.onResume.trigger(1);
                assert.isTrue(onShowTriggered, 'onShow was not triggered when invoking onResume');
                return;
            });
        });

        it('with onPause', () => {
            let onSystemKillTriggered: boolean = false;
            container.onSystemKill.subscribe(() => { onSystemKillTriggered = true; });

            return container.open(testAdUnit, ['videoplayer', 'webview'], true, ForceOrientation.LANDSCAPE, true, false, true, false, options).then(() => {
                nativeBridge.AndroidAdUnit.onPause.trigger(true, 1);
                assert.isTrue(onSystemKillTriggered, 'onSystemKill was not triggered when invoking onPause with finishing true');
                return;
            });
        });

        it('with onDestroy', () => {
            let onSystemKillTriggered: boolean = false;
            container.onSystemKill.subscribe(() => { onSystemKillTriggered = true; });

            return container.open(testAdUnit, ['videoplayer', 'webview'], true, ForceOrientation.LANDSCAPE, true, false, true, false, options).then(() => {
                nativeBridge.AndroidAdUnit.onDestroy.trigger(true, 1);
                assert.isTrue(onSystemKillTriggered, 'onSystemKill was not triggered when invoking onDestroy with finishing true');
                return;
            });
        });
    });
});
