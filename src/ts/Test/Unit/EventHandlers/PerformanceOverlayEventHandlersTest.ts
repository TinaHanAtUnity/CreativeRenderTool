import 'mocha';
import * as sinon from 'sinon';

import { NativeBridge } from 'Native/NativeBridge';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { Overlay } from 'Views/Overlay';
import { EndScreen } from 'Views/EndScreen';
import { PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';
import { PerformanceOverlayEventHandlers } from 'EventHandlers/PerformanceOverlayEventHandlers';
import { Observable0 } from 'Utilities/Observable';
import { Platform } from 'Constants/Platform';
import { AdUnitContainer } from 'AdUnits/AdUnitContainer';
import { Activity } from 'AdUnits/Activity';
import { PerformanceCampaign } from 'Models/PerformanceCampaign';

describe('PerformanceOverlayEventHandlersTest', () => {

    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge, overlay: Overlay, endScreen: EndScreen | undefined;
    let container: AdUnitContainer;
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

        container = new Activity(nativeBridge, TestFixtures.getDeviceInfo(Platform.ANDROID));
        performanceAdUnit = new PerformanceAdUnit(nativeBridge, container, TestFixtures.getPlacement(), <PerformanceCampaign><any>{}, overlay, null, endScreen);
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
