import 'mocha';
import * as sinon from 'sinon';
import { VideoAdUnitController } from 'AdUnits/VideoAdUnitController';
import { NativeBridge } from 'Native/NativeBridge';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { Campaign } from 'Models/Campaign';
import { Overlay } from 'Views/Overlay';
import { EndScreen } from 'Views/EndScreen';
import { PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';
import { PerformanceVideoEventHandlers } from 'EventHandlers/PerformanceVideoEventHandlers';
import { Platform } from 'Constants/Platform';
import { AdUnit } from 'Utilities/AdUnit';
import { AndroidAdUnit } from 'Utilities/AndroidAdUnit';

describe('PerformanceVideoEventHandlersTest', () => {

    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge, overlay: Overlay, endScreen: EndScreen | undefined;
    let adUnit: AdUnit;
    let performanceAdUnit: PerformanceAdUnit;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });

        overlay = <Overlay><any> {};

        endScreen = <EndScreen><any> {
            show: sinon.spy(),
        };

        adUnit = new AndroidAdUnit(nativeBridge, TestFixtures.getDeviceInfo(Platform.ANDROID));
        const videoAdUnitController = new VideoAdUnitController(nativeBridge, adUnit, TestFixtures.getPlacement(), <Campaign><any>{}, TestFixtures.getDeviceInfo(Platform.ANDROID), overlay, null);
        performanceAdUnit = new PerformanceAdUnit(nativeBridge, adUnit, videoAdUnitController, endScreen);
    });

    describe('with onVideoCompleted', () => {
        it('should show end screen', () => {
            PerformanceVideoEventHandlers.onVideoCompleted(performanceAdUnit);

            endScreen = performanceAdUnit.getEndScreen();
            if(endScreen) {
                sinon.assert.called(<sinon.SinonSpy>endScreen.show);
            }
        });
    });

    describe('with onVideoError', () => {
        it('should show end screen', () => {
            PerformanceVideoEventHandlers.onVideoError(performanceAdUnit);

            endScreen = performanceAdUnit.getEndScreen();
            if(endScreen) {
                sinon.assert.called(<sinon.SinonSpy>endScreen.show);
            }
        });
    });

});
