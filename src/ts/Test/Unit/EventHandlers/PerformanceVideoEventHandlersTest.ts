import 'mocha';
import * as sinon from 'sinon';

import { NativeBridge } from 'Native/NativeBridge';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { Overlay } from 'Views/Overlay';
import { EndScreen } from 'Views/EndScreen';
import { PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';
import { PerformanceVideoEventHandlers } from 'EventHandlers/PerformanceVideoEventHandlers';
import { Platform } from 'Constants/Platform';
import { AdUnitContainer } from 'AdUnits/Containers/AdUnitContainer';
import { Activity } from 'AdUnits/Containers/Activity';
import { PerformanceCampaign } from 'Models/PerformanceCampaign';
import { Video } from 'Models/Video';

describe('PerformanceVideoEventHandlersTest', () => {

    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge, overlay: Overlay, endScreen: EndScreen | undefined;
    let container: AdUnitContainer;
    let performanceAdUnit: PerformanceAdUnit;
    let video: Video;

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
        video = new Video('');
        performanceAdUnit = new PerformanceAdUnit(nativeBridge, container, TestFixtures.getPlacement(), <PerformanceCampaign><any>{
            getVideo: () => video,
            getStreamingVideo: () => video
        }, overlay, TestFixtures.getDeviceInfo(Platform.ANDROID), null, endScreen);
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
