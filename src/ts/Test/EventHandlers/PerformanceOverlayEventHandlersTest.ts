import 'mocha';
import * as sinon from 'sinon';

import { AndroidVideoAdUnitController } from 'AdUnits/AndroidVideoAdUnitController';
import { NativeBridge } from 'Native/NativeBridge';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { Campaign } from 'Models/Campaign';
import { Overlay } from 'Views/Overlay';
import { EndScreen } from 'Views/EndScreen';
import { PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';
import { PerformanceOverlayEventHandlers } from 'EventHandlers/PerformanceOverlayEventHandlers';
import { Observable0 } from 'Utilities/Observable';

describe('PerformanceOverlayEventHandlersTest', () => {

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
