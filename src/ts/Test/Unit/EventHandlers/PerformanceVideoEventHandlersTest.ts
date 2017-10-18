import 'mocha';
import * as sinon from 'sinon';

import { NativeBridge } from 'Native/NativeBridge';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { Overlay } from 'Views/Overlay';
import { EndScreen } from 'Views/EndScreen';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';
import { PerformanceVideoEventHandlers } from 'EventHandlers/PerformanceVideoEventHandlers';
import { Platform } from 'Constants/Platform';
import { AdUnitContainer, ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';
import { Activity } from 'AdUnits/Containers/Activity';
import { PerformanceCampaign } from 'Models/Campaigns/PerformanceCampaign';
import { Video } from 'Models/Assets/Video';
import { Request } from 'Utilities/Request';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { SessionManager } from 'Managers/SessionManager';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { FocusManager } from 'Managers/FocusManager';
import { WakeUpManager } from 'Managers/WakeUpManager';

describe('PerformanceVideoEventHandlersTest', () => {

    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge, overlay: Overlay, endScreen: EndScreen | undefined;
    let container: AdUnitContainer;
    let performanceAdUnit: PerformanceAdUnit;
    let video: Video;
    let performanceAdUnitParameters: IPerformanceAdUnitParameters;

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

        const focusManager = new FocusManager(nativeBridge);
        const wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
        const request = new Request(nativeBridge, wakeUpManager);
        const metaDataManager = new MetaDataManager(nativeBridge);
        const clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
        const deviceInfo = TestFixtures.getDeviceInfo(Platform.ANDROID);
        const thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
        const sessionManager = new SessionManager(nativeBridge);
        const operativeEventManager = new OperativeEventManager(nativeBridge, request, metaDataManager, sessionManager, clientInfo, deviceInfo);

        performanceAdUnitParameters = {
            forceOrientation: ForceOrientation.LANDSCAPE,
            focusManager: focusManager,
            container: container,
            deviceInfo: deviceInfo,
            clientInfo: clientInfo,
            thirdPartyEventManager: thirdPartyEventManager,
            operativeEventManager: operativeEventManager,
            placement: TestFixtures.getPlacement(),
            campaign: <PerformanceCampaign><any>{
                getVideo: () => video,
                getStreamingVideo: () => video
            },
            configuration: TestFixtures.getConfiguration(),
            request: request,
            options: {},
            endScreen: endScreen,
            overlay: overlay,
            video: video
        };

        performanceAdUnit = new PerformanceAdUnit(nativeBridge, performanceAdUnitParameters);
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
