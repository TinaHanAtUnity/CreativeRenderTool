import 'mocha';
import * as sinon from 'sinon';

import { VideoAdUnitController } from 'AdUnits/VideoAdUnitController';
import { NativeBridge } from 'Native/NativeBridge';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { Campaign } from 'Models/Campaign';
import { VideoOverlay } from 'Views/VideoOverlay';
import { EndScreen } from 'Views/EndScreen';
import { PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';
import { PerformanceOverlayEventHandlers } from 'EventHandlers/PerformanceOverlayEventHandlers';
import { Observable0 } from 'Utilities/Observable';
import { Platform } from 'Constants/Platform';
import { AdUnit } from 'Utilities/AdUnit';
import { AndroidAdUnit } from 'Utilities/AndroidAdUnit';

describe('PerformanceOverlayEventHandlersTest', () => {

    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge, overlay: VideoOverlay, endScreen: EndScreen | undefined;
    let adUnit: AdUnit;
    let performanceAdUnit: PerformanceAdUnit;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });

        overlay = <VideoOverlay><any> {};

        endScreen = <EndScreen><any> {
            show: sinon.spy(),
        };

        adUnit = new AndroidAdUnit(nativeBridge, TestFixtures.getDeviceInfo(Platform.ANDROID));
        const videoAdUnitController = new VideoAdUnitController(nativeBridge, adUnit, TestFixtures.getPlacement(), <Campaign><any>{}, overlay, null);
        performanceAdUnit = new PerformanceAdUnit(nativeBridge, adUnit, videoAdUnitController, endScreen);
    });

    describe('with onSkip', () => {
        it('should show end screen', () => {
            PerformanceOverlayEventHandlers.onSkip(performanceAdUnit);

            endScreen = performanceAdUnit.getEndScreen();
            if(endScreen) {
                sinon.assert.called(<sinon.SinonSpy>endScreen.show);
            }
        });

        it('should trigger onFinish', () => {
            performanceAdUnit.onFinish = <Observable0><any> {
                trigger: sinon.spy(),
            };

            PerformanceOverlayEventHandlers.onSkip(performanceAdUnit);

            sinon.assert.called(<sinon.SinonSpy>performanceAdUnit.onFinish.trigger);
        });
    });

});
