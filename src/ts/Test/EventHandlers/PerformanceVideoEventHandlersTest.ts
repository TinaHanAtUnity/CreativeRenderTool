import 'mocha';
import * as sinon from 'sinon';
import { AndroidVideoAdUnitController } from 'AdUnits/AndroidVideoAdUnitController';
import { NativeBridge } from 'Native/NativeBridge';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { Campaign } from 'Models/Campaign';
import { Overlay } from 'Views/Overlay';
import { EndScreen } from 'Views/EndScreen';
import { PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';
import { PerformanceVideoEventHandlers } from 'EventHandlers/PerformanceVideoEventHandlers';

describe('PerformanceVideoEventHandlersTest', () => {

    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge, overlay: Overlay, endScreen: EndScreen;
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

        const videoAdUnitController = new AndroidVideoAdUnitController(nativeBridge, TestFixtures.getPlacement(), <Campaign><any>{}, overlay, null);
        performanceAdUnit = new PerformanceAdUnit(nativeBridge, videoAdUnitController, endScreen);
    });

    describe('with onVideoCompleted', () => {
        it('should show end screen', () => {
            PerformanceVideoEventHandlers.onVideoCompleted(performanceAdUnit);

            const endScreen = performanceAdUnit.getEndScreen();
            if(endScreen) {
                sinon.assert.called(<sinon.SinonSpy>endScreen.show);
            }
        });
    });

    describe('with onVideoError', () => {
        it('should show end screen', () => {
            PerformanceVideoEventHandlers.onVideoError(performanceAdUnit);

            const endScreen = performanceAdUnit.getEndScreen();
            if(endScreen) {
                sinon.assert.called(<sinon.SinonSpy>endScreen.show);
            }
        });
    });

});
